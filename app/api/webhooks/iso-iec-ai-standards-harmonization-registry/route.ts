import { NextResponse } from "next/server";
import { z } from "zod";

import { requireBearerWebhookSecret } from "@/lib/api/webhook-guard";
import { logger } from "@/lib/logger";
import {
  ingestIsoIecStandardsHarmonizationEvent,
  isIsoIecAiStandardsHarmonizationRegistryEnabled,
  mergeIsoIecAiStandardsHarmonizationRegistry,
  readIsoIecAiStandardsHarmonizationRegistry,
} from "@/lib/compliance/iso-iec-ai-standards-harmonization-registry";
import { publishIsoIecAiStandardsHarmonizationRelayEvent } from "@/lib/experiment-production/mesh-kafka-relay";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  storeSlug: z.string().min(1).max(120),
  eventId: z.string().min(1).max(128),
  bodyId: z.enum(["iso_iec_jtc21", "iec_sc42", "iso_iec_42001", "iec_62443_ai"]),
  standardsRecordId: z.string().min(1).max(128),
  harmonizationClauseId: z.string().min(1).max(128),
  commerceRegistryAligned: z.boolean().optional(),
  unRegistryAligned: z.boolean().optional(),
});

export async function POST(request: Request) {
  const authError = requireBearerWebhookSecret(request, {
    secret: process.env.ISO_IEC_STANDARDS_REGISTRY_WEBHOOK_SECRET,
  });
  if (authError) {
    return authError;
  }

  if (!isIsoIecAiStandardsHarmonizationRegistryEnabled()) {
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

  const { json: merged, snap } = ingestIsoIecStandardsHarmonizationEvent(sf.themeExperimentJson, {
    source: "webhook",
    eventId: parsed.data.eventId,
    bodyId: parsed.data.bodyId,
    standardsRecordId: parsed.data.standardsRecordId,
    harmonizationClauseId: parsed.data.harmonizationClauseId,
    commerceRegistryAligned: parsed.data.commerceRegistryAligned,
    unRegistryAligned: parsed.data.unRegistryAligned,
    syncedToStandardsRegistry: true,
  });

  const relay = await publishIsoIecAiStandardsHarmonizationRelayEvent({
    at: new Date().toISOString(),
    storeSlug: parsed.data.storeSlug,
    eventId: parsed.data.eventId,
    bodyId: parsed.data.bodyId,
    standardsRecordId: parsed.data.standardsRecordId,
  });

  const prev = readIsoIecAiStandardsHarmonizationRegistry(merged);
  const finalJson = prev
    ? mergeIsoIecAiStandardsHarmonizationRegistry(merged, { ...prev, kafkaRelayed: relay.published })
    : merged;

  await prisma.storefrontSettings.update({
    where: { id: sf.id },
    data: { themeExperimentJson: finalJson as object },
  });

  logger.info("iso_iec_ai_standards_harmonization_webhook", {
    storeSlug: parsed.data.storeSlug,
    publishBlockedByStandards: snap.publishBlockedByStandards,
  });

  return NextResponse.json({
    ok: true,
    standardsRegistryReady: snap.standardsRegistryReady,
    publishBlockedByStandards: snap.publishBlockedByStandards,
    kafkaRelayed: relay.published,
  });
}
