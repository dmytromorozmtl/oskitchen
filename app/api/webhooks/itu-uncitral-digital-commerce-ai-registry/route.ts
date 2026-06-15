import { NextResponse } from "next/server";
import { z } from "zod";

import { requireBearerWebhookSecret } from "@/lib/api/webhook-guard";
import { logger } from "@/lib/logger";
import {
  ingestItuUncitralDigitalCommerceEvent,
  isItuUncitralDigitalCommerceAiRegistryEnabled,
  mergeItuUncitralDigitalCommerceAiRegistry,
  readItuUncitralDigitalCommerceAiRegistry,
} from "@/lib/compliance/itu-uncitral-digital-commerce-ai-registry";
import { publishItuUncitralDigitalCommerceRelayEvent } from "@/lib/experiment-production/mesh-kafka-relay";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  storeSlug: z.string().min(1).max(120),
  eventId: z.string().min(1).max(128),
  bodyId: z.enum(["itu_t_geneva", "uncitral_vienna", "wipo_digital", "itu_f_plenipot"]),
  commerceRecordId: z.string().min(1).max(128),
  digitalTradeAgreementId: z.string().min(1).max(128),
  tradeRegistryAligned: z.boolean().optional(),
  unRegistryAligned: z.boolean().optional(),
});

export async function POST(request: Request) {
  const authError = requireBearerWebhookSecret(request, {
    secret: process.env.ITU_UNCITRAL_COMMERCE_REGISTRY_WEBHOOK_SECRET,
  });
  if (authError) {
    return authError;
  }

  if (!isItuUncitralDigitalCommerceAiRegistryEnabled()) {
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

  const { json: merged, snap } = ingestItuUncitralDigitalCommerceEvent(sf.themeExperimentJson, {
    source: "webhook",
    eventId: parsed.data.eventId,
    bodyId: parsed.data.bodyId,
    commerceRecordId: parsed.data.commerceRecordId,
    digitalTradeAgreementId: parsed.data.digitalTradeAgreementId,
    tradeRegistryAligned: parsed.data.tradeRegistryAligned,
    unRegistryAligned: parsed.data.unRegistryAligned,
    syncedToCommerceRegistry: true,
  });

  const relay = await publishItuUncitralDigitalCommerceRelayEvent({
    at: new Date().toISOString(),
    storeSlug: parsed.data.storeSlug,
    eventId: parsed.data.eventId,
    bodyId: parsed.data.bodyId,
    commerceRecordId: parsed.data.commerceRecordId,
  });

  const prev = readItuUncitralDigitalCommerceAiRegistry(merged);
  const finalJson = prev
    ? mergeItuUncitralDigitalCommerceAiRegistry(merged, { ...prev, kafkaRelayed: relay.published })
    : merged;

  await prisma.storefrontSettings.update({
    where: { id: sf.id },
    data: { themeExperimentJson: finalJson as object },
  });

  logger.info("itu_uncitral_digital_commerce_webhook", {
    storeSlug: parsed.data.storeSlug,
    publishBlockedByCommerce: snap.publishBlockedByCommerce,
  });

  return NextResponse.json({
    ok: true,
    commerceRegistryReady: snap.commerceRegistryReady,
    publishBlockedByCommerce: snap.publishBlockedByCommerce,
    kafkaRelayed: relay.published,
  });
}
