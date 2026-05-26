import { NextResponse } from "next/server";
import { z } from "zod";

import { requireBearerWebhookSecret } from "@/lib/api/webhook-guard";
import { logger } from "@/lib/logger";
import {
  ingestUsFtcTransparencyEvent,
  isUsFtcAiTransparencyLiveEnabled,
  mergeUsFtcAiTransparencyLive,
  readUsFtcAiTransparencyLive,
} from "@/lib/compliance/us-ftc-ai-transparency-live-feed";
import { publishUsFtcTransparencyRelayEvent } from "@/lib/experiment-production/mesh-kafka-relay";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  storeSlug: z.string().min(1).max(120),
  eventId: z.string().min(1).max(128),
  transparencyRecordId: z.string().min(1).max(128),
  algorithmicSystemId: z.string().min(1).max(128),
  disclosureLevel: z.enum(["baseline", "enhanced", "frontier"]),
  consumerHarmRisk: z.enum(["low", "medium", "high"]),
});

export async function POST(request: Request) {
  const authError = requireBearerWebhookSecret(request, {
    secret: process.env.US_FTC_TRANSPARENCY_WEBHOOK_SECRET,
  });
  if (authError) {
    return authError;
  }

  if (!isUsFtcAiTransparencyLiveEnabled()) {
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

  const { json: merged, snap } = ingestUsFtcTransparencyEvent(sf.themeExperimentJson, {
    source: "webhook",
    eventId: parsed.data.eventId,
    transparencyRecordId: parsed.data.transparencyRecordId,
    algorithmicSystemId: parsed.data.algorithmicSystemId,
    disclosureLevel: parsed.data.disclosureLevel,
    consumerHarmRisk: parsed.data.consumerHarmRisk,
    syncedToFtcFeed: true,
  });

  const relay = await publishUsFtcTransparencyRelayEvent({
    at: new Date().toISOString(),
    storeSlug: parsed.data.storeSlug,
    eventId: parsed.data.eventId,
    transparencyRecordId: parsed.data.transparencyRecordId,
    consumerHarmRisk: parsed.data.consumerHarmRisk,
  });

  const prev = readUsFtcAiTransparencyLive(merged);
  const finalJson = prev
    ? mergeUsFtcAiTransparencyLive(merged, { ...prev, kafkaRelayed: relay.published })
    : merged;

  await prisma.storefrontSettings.update({
    where: { id: sf.id },
    data: { themeExperimentJson: finalJson as object },
  });

  logger.info("us_ftc_ai_transparency_webhook", {
    storeSlug: parsed.data.storeSlug,
    publishBlockedByFtc: snap.publishBlockedByFtc,
  });

  return NextResponse.json({
    ok: true,
    ftcFeedReady: snap.ftcFeedReady,
    publishBlockedByFtc: snap.publishBlockedByFtc,
    kafkaRelayed: relay.published,
  });
}
