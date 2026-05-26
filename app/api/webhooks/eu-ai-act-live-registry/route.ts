import { NextResponse } from "next/server";
import { z } from "zod";

import { requireBearerWebhookSecret } from "@/lib/api/webhook-guard";
import { logger } from "@/lib/logger";
import {
  ingestEuRegistryStreamEvent,
  isEuAiActLiveRegistryEnabled,
  mergeEuAiActLiveRegistry,
  readEuAiActLiveRegistry,
} from "@/lib/compliance/eu-ai-act-live-registry";
import { publishEuConformityRelayEvent } from "@/lib/experiment-production/mesh-kafka-relay";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  storeSlug: z.string().min(1).max(120),
  eventId: z.string().min(1).max(128),
  assessmentId: z.string().min(1).max(128),
  conformityStatus: z.enum(["conformity", "refusal", "conditional"]),
  certBodyCrossRef: z.string().optional().nullable(),
  registrySequence: z.number().int().nonnegative(),
});

export async function POST(request: Request) {
  const authError = requireBearerWebhookSecret(request, {
    secret: process.env.EU_AI_REGISTRY_STREAM_WEBHOOK_SECRET,
  });
  if (authError) {
    return authError;
  }

  if (!isEuAiActLiveRegistryEnabled()) {
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

  const { json: merged, snap, continuousUpdated } = ingestEuRegistryStreamEvent(
    sf.themeExperimentJson,
    {
      source: "webhook",
      eventId: parsed.data.eventId,
      assessmentId: parsed.data.assessmentId,
      conformityStatus: parsed.data.conformityStatus,
      certBodyCrossRef: parsed.data.certBodyCrossRef ?? null,
      registrySequence: parsed.data.registrySequence,
    },
  );

  const relay = await publishEuConformityRelayEvent({
    at: new Date().toISOString(),
    storeSlug: parsed.data.storeSlug,
    eventId: parsed.data.eventId,
    conformityStatus: parsed.data.conformityStatus,
    registrySequence: parsed.data.registrySequence,
  });

  const prev = readEuAiActLiveRegistry(merged);
  const finalJson = prev
    ? mergeEuAiActLiveRegistry(merged, { ...prev, kafkaRelayed: relay.published })
    : merged;

  await prisma.storefrontSettings.update({
    where: { id: sf.id },
    data: { themeExperimentJson: finalJson as object },
  });

  logger.info("eu_ai_act_live_registry_webhook", {
    storeSlug: parsed.data.storeSlug,
    liveRegistryReady: snap.liveRegistryReady,
    continuousUpdated,
  });

  return NextResponse.json({
    ok: true,
    liveRegistryReady: snap.liveRegistryReady,
    continuousUpdated,
    kafkaRelayed: relay.published,
  });
}
