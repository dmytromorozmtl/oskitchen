import { NextResponse } from "next/server";
import { z } from "zod";

import { requireBearerWebhookSecret } from "@/lib/api/webhook-guard";
import { logger } from "@/lib/logger";
import {
  ingestNistRmfControlStreamEvent,
  isNistAiRmfLiveControlFeedEnabled,
  mergeNistAiRmfLiveControlFeed,
  readNistAiRmfLiveControlFeed,
} from "@/lib/compliance/nist-ai-rmf-live-control-feed";
import { publishNistRmfRelayEvent } from "@/lib/experiment-production/mesh-kafka-relay";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  storeSlug: z.string().min(1).max(120),
  eventId: z.string().min(1).max(128),
  controlId: z.string().min(1).max(128),
  rmfFunction: z.enum(["govern", "map", "measure", "manage"]),
  newStatus: z.enum(["complete", "partial", "pending"]),
});

export async function POST(request: Request) {
  const authError = requireBearerWebhookSecret(request, {
    secret: process.env.NIST_AI_RMF_STREAM_WEBHOOK_SECRET,
  });
  if (authError) {
    return authError;
  }

  if (!isNistAiRmfLiveControlFeedEnabled()) {
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

  const { json: merged, snap } = ingestNistRmfControlStreamEvent(sf.themeExperimentJson, {
    source: "webhook",
    eventId: parsed.data.eventId,
    controlId: parsed.data.controlId,
    rmfFunction: parsed.data.rmfFunction,
    previousStatus: "partial",
    newStatus: parsed.data.newStatus,
    syncedToNistFeed: true,
  });

  const relay = await publishNistRmfRelayEvent({
    at: new Date().toISOString(),
    storeSlug: parsed.data.storeSlug,
    eventId: parsed.data.eventId,
    controlId: parsed.data.controlId,
    rmfFunction: parsed.data.rmfFunction,
  });

  const prev = readNistAiRmfLiveControlFeed(merged);
  const finalJson = prev
    ? mergeNistAiRmfLiveControlFeed(merged, { ...prev, kafkaRelayed: relay.published })
    : merged;

  await prisma.storefrontSettings.update({
    where: { id: sf.id },
    data: { themeExperimentJson: finalJson as object },
  });

  logger.info("nist_ai_rmf_live_control_feed_webhook", {
    storeSlug: parsed.data.storeSlug,
    liveControlFeedReady: snap.liveControlFeedReady,
  });

  return NextResponse.json({
    ok: true,
    liveControlFeedReady: snap.liveControlFeedReady,
    kafkaRelayed: relay.published,
  });
}
