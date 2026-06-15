import { NextResponse } from "next/server";
import { z } from "zod";

import { requireBearerWebhookSecret } from "@/lib/api/webhook-guard";
import { logger } from "@/lib/logger";
import {
  ingestIcaoImoAviationRegistryEvent,
  isIcaoImoAiAviationRegistryEnabled,
  mergeIcaoImoAiAviationRegistry,
  readIcaoImoAiAviationRegistry,
} from "@/lib/compliance/icao-imo-ai-aviation-registry";
import { publishIcaoImoAviationRegistryRelayEvent } from "@/lib/experiment-production/mesh-kafka-relay";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  storeSlug: z.string().min(1).max(120),
  eventId: z.string().min(1).max(128),
  authorityId: z.enum(["icao_montreal", "imo_london", "easa_cologne", "faa_washington"]),
  aviationRecordId: z.string().min(1).max(128),
  aircraftSystemId: z.string().min(1).max(128),
  unRegistryAligned: z.boolean().optional(),
  pmmAligned: z.boolean().optional(),
});

export async function POST(request: Request) {
  const authError = requireBearerWebhookSecret(request, {
    secret: process.env.ICAO_IMO_AVIATION_REGISTRY_WEBHOOK_SECRET,
  });
  if (authError) {
    return authError;
  }

  if (!isIcaoImoAiAviationRegistryEnabled()) {
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

  const { json: merged, snap } = ingestIcaoImoAviationRegistryEvent(sf.themeExperimentJson, {
    source: "webhook",
    eventId: parsed.data.eventId,
    authorityId: parsed.data.authorityId,
    aviationRecordId: parsed.data.aviationRecordId,
    aircraftSystemId: parsed.data.aircraftSystemId,
    unRegistryAligned: parsed.data.unRegistryAligned,
    pmmAligned: parsed.data.pmmAligned,
    syncedToAviationRegistry: true,
  });

  const relay = await publishIcaoImoAviationRegistryRelayEvent({
    at: new Date().toISOString(),
    storeSlug: parsed.data.storeSlug,
    eventId: parsed.data.eventId,
    authorityId: parsed.data.authorityId,
    aviationRecordId: parsed.data.aviationRecordId,
  });

  const prev = readIcaoImoAiAviationRegistry(merged);
  const finalJson = prev
    ? mergeIcaoImoAiAviationRegistry(merged, { ...prev, kafkaRelayed: relay.published })
    : merged;

  await prisma.storefrontSettings.update({
    where: { id: sf.id },
    data: { themeExperimentJson: finalJson as object },
  });

  logger.info("icao_imo_aviation_registry_webhook", {
    storeSlug: parsed.data.storeSlug,
    publishBlockedByAviation: snap.publishBlockedByAviation,
  });

  return NextResponse.json({
    ok: true,
    aviationRegistryReady: snap.aviationRegistryReady,
    publishBlockedByAviation: snap.publishBlockedByAviation,
    kafkaRelayed: relay.published,
  });
}
