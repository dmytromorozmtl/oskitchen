import { NextResponse } from "next/server";
import { z } from "zod";

import { requireBearerWebhookSecret } from "@/lib/api/webhook-guard";
import { logger } from "@/lib/logger";
import {
  ingestEuAiActArt71PmmEvent,
  isEuAiActArt71PmmLiveEnabled,
  mergeEuAiActArt71PmmLive,
  readEuAiActArt71PmmLive,
} from "@/lib/compliance/eu-ai-act-art71-pmm-live";
import { publishEuAiActPmmRelayEvent } from "@/lib/experiment-production/mesh-kafka-relay";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  storeSlug: z.string().min(1).max(120),
  eventId: z.string().min(1).max(128),
  incidentId: z.string().min(1).max(128),
  severity: z.enum(["informational", "moderate", "serious"]),
  status: z.enum(["open", "investigating", "resolved"]),
  modelDeploymentId: z.string().min(1).max(128),
});

export async function POST(request: Request) {
  const authError = requireBearerWebhookSecret(request, {
    secret: process.env.EU_AI_ACT_PMM_WEBHOOK_SECRET,
  });
  if (authError) {
    return authError;
  }

  if (!isEuAiActArt71PmmLiveEnabled()) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const sf = await prisma.storefrontSettings.findFirst({
    where: { storeSlug: parsed.data.storeSlug },
    select: { id: true, themeExperimentJson: true },
  });
  if (!sf) {
    return NextResponse.json({ error: "Storefront not found" }, { status: 404 });
  }

  const { json: merged, snap } = ingestEuAiActArt71PmmEvent(sf.themeExperimentJson, {
    source: "webhook",
    eventId: parsed.data.eventId,
    incidentId: parsed.data.incidentId,
    severity: parsed.data.severity,
    status: parsed.data.status,
    modelDeploymentId: parsed.data.modelDeploymentId,
    syncedToPmmFeed: true,
  });

  const relay = await publishEuAiActPmmRelayEvent({
    at: new Date().toISOString(),
    storeSlug: parsed.data.storeSlug,
    eventId: parsed.data.eventId,
    incidentId: parsed.data.incidentId,
    severity: parsed.data.severity,
    status: parsed.data.status,
  });

  const prev = readEuAiActArt71PmmLive(merged);
  const finalJson = prev
    ? mergeEuAiActArt71PmmLive(merged, { ...prev, kafkaRelayed: relay.published })
    : merged;

  await prisma.storefrontSettings.update({
    where: { id: sf.id },
    data: { themeExperimentJson: finalJson as object },
  });

  logger.info("eu_ai_act_art71_pmm_webhook", {
    storeSlug: parsed.data.storeSlug,
    publishBlockedByPmm: snap.publishBlockedByPmm,
  });

  return NextResponse.json({
    ok: true,
    pmmFeedReady: snap.pmmFeedReady,
    publishBlockedByPmm: snap.publishBlockedByPmm,
    kafkaRelayed: relay.published,
  });
}
