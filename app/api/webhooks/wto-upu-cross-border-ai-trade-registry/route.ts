import { NextResponse } from "next/server";
import { z } from "zod";

import { requireBearerWebhookSecret } from "@/lib/api/webhook-guard";
import { logger } from "@/lib/logger";
import {
  ingestWtoUpuTradeRegistryEvent,
  isWtoUpuCrossBorderAiTradeRegistryEnabled,
  mergeWtoUpuCrossBorderAiTradeRegistry,
  readWtoUpuCrossBorderAiTradeRegistry,
} from "@/lib/compliance/wto-upu-cross-border-ai-trade-registry";
import { publishWtoUpuTradeRegistryRelayEvent } from "@/lib/experiment-production/mesh-kafka-relay";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  storeSlug: z.string().min(1).max(120),
  eventId: z.string().min(1).max(128),
  bodyId: z.enum(["wto_geneva", "upu_bern", "unctad_geneva", "itu_trade"]),
  tradeRecordId: z.string().min(1).max(128),
  crossBorderShipmentId: z.string().min(1).max(128),
  aviationAligned: z.boolean().optional(),
  unRegistryAligned: z.boolean().optional(),
});

export async function POST(request: Request) {
  const authError = requireBearerWebhookSecret(request, {
    secret: process.env.WTO_UPU_TRADE_REGISTRY_WEBHOOK_SECRET,
  });
  if (authError) {
    return authError;
  }

  if (!isWtoUpuCrossBorderAiTradeRegistryEnabled()) {
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
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  const { json: merged, snap } = ingestWtoUpuTradeRegistryEvent(sf.themeExperimentJson, {
    source: "webhook",
    eventId: parsed.data.eventId,
    bodyId: parsed.data.bodyId,
    tradeRecordId: parsed.data.tradeRecordId,
    crossBorderShipmentId: parsed.data.crossBorderShipmentId,
    aviationAligned: parsed.data.aviationAligned,
    unRegistryAligned: parsed.data.unRegistryAligned,
    syncedToTradeRegistry: true,
  });

  const relay = await publishWtoUpuTradeRegistryRelayEvent({
    at: new Date().toISOString(),
    storeSlug: parsed.data.storeSlug,
    eventId: parsed.data.eventId,
    bodyId: parsed.data.bodyId,
    tradeRecordId: parsed.data.tradeRecordId,
  });

  const prev = readWtoUpuCrossBorderAiTradeRegistry(merged);
  const finalJson = prev
    ? mergeWtoUpuCrossBorderAiTradeRegistry(merged, { ...prev, kafkaRelayed: relay.published })
    : merged;

  await prisma.storefrontSettings.update({
    where: { id: sf.id },
    data: { themeExperimentJson: finalJson as object },
  });

  logger.info("wto_upu_trade_registry_webhook", {
    storeSlug: parsed.data.storeSlug,
    publishBlockedByTrade: snap.publishBlockedByTrade,
  });

  return NextResponse.json({
    ok: true,
    tradeRegistryReady: snap.tradeRegistryReady,
    publishBlockedByTrade: snap.publishBlockedByTrade,
    kafkaRelayed: relay.published,
  });
}
