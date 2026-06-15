import { NextResponse } from "next/server";
import { z } from "zod";

import { requireBearerWebhookSecret } from "@/lib/api/webhook-guard";
import { logger } from "@/lib/logger";
import {
  ingestUkDsitTransparencyEvent,
  isUkDsitAlgorithmicTransparencyEnabled,
  mergeUkDsitAlgorithmicTransparency,
  readUkDsitAlgorithmicTransparency,
} from "@/lib/compliance/uk-dsit-algorithmic-transparency";
import { publishUkDsitRelayEvent } from "@/lib/experiment-production/mesh-kafka-relay";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  storeSlug: z.string().min(1).max(120),
  eventId: z.string().min(1).max(128),
  transparencyRecordId: z.string().min(1).max(128),
  algorithmicSystemId: z.string().min(1).max(128),
  disclosureLevel: z.enum(["standard", "enhanced", "frontier"]),
});

export async function POST(request: Request) {
  const authError = requireBearerWebhookSecret(request, {
    secret: process.env.UK_DSIT_STREAM_WEBHOOK_SECRET,
  });
  if (authError) {
    return authError;
  }

  if (!isUkDsitAlgorithmicTransparencyEnabled()) {
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

  const { json: merged, snap } = ingestUkDsitTransparencyEvent(sf.themeExperimentJson, {
    source: "webhook",
    eventId: parsed.data.eventId,
    transparencyRecordId: parsed.data.transparencyRecordId,
    algorithmicSystemId: parsed.data.algorithmicSystemId,
    disclosureLevel: parsed.data.disclosureLevel,
    publishedToDsit: true,
  });

  const relay = await publishUkDsitRelayEvent({
    at: new Date().toISOString(),
    storeSlug: parsed.data.storeSlug,
    eventId: parsed.data.eventId,
    transparencyRecordId: parsed.data.transparencyRecordId,
    disclosureLevel: parsed.data.disclosureLevel,
  });

  const prev = readUkDsitAlgorithmicTransparency(merged);
  const finalJson = prev
    ? mergeUkDsitAlgorithmicTransparency(merged, { ...prev, kafkaRelayed: relay.published })
    : merged;

  await prisma.storefrontSettings.update({
    where: { id: sf.id },
    data: { themeExperimentJson: finalJson as object },
  });

  logger.info("uk_dsit_algorithmic_transparency_webhook", {
    storeSlug: parsed.data.storeSlug,
    dsitFeedReady: snap.dsitFeedReady,
  });

  return NextResponse.json({ ok: true, dsitFeedReady: snap.dsitFeedReady, kafkaRelayed: relay.published });
}
