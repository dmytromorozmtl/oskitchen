import { NextResponse } from "next/server";
import { z } from "zod";

import { requireBearerWebhookSecret } from "@/lib/api/webhook-guard";
import { logger } from "@/lib/logger";
import {
  ingestCenCenelecGovernanceEvent,
  isCenCenelecDigitalProductGovernanceRegistryEnabled,
  mergeCenCenelecDigitalProductGovernanceRegistry,
  readCenCenelecDigitalProductGovernanceRegistry,
} from "@/lib/compliance/cen-cenelec-digital-product-governance-registry";
import { publishCenCenelecDigitalGovernanceRelayEvent } from "@/lib/experiment-production/mesh-kafka-relay";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  storeSlug: z.string().min(1).max(120),
  eventId: z.string().min(1).max(128),
  bodyId: z.enum(["cen_tc21", "cenelec_tc65x", "cen_cenelec_jtc21", "cenelec_clc_srg"]),
  governanceRecordId: z.string().min(1).max(128),
  productGovernanceClauseId: z.string().min(1).max(128),
  standardsRegistryAligned: z.boolean().optional(),
  notifiedBodyAligned: z.boolean().optional(),
});

export async function POST(request: Request) {
  const authError = requireBearerWebhookSecret(request, {
    secret: process.env.CEN_CENELEC_GOVERNANCE_REGISTRY_WEBHOOK_SECRET,
  });
  if (authError) {
    return authError;
  }

  if (!isCenCenelecDigitalProductGovernanceRegistryEnabled()) {
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

  const { json: merged, snap } = ingestCenCenelecGovernanceEvent(sf.themeExperimentJson, {
    source: "webhook",
    eventId: parsed.data.eventId,
    bodyId: parsed.data.bodyId,
    governanceRecordId: parsed.data.governanceRecordId,
    productGovernanceClauseId: parsed.data.productGovernanceClauseId,
    standardsRegistryAligned: parsed.data.standardsRegistryAligned,
    notifiedBodyAligned: parsed.data.notifiedBodyAligned,
    syncedToGovernanceRegistry: true,
  });

  const relay = await publishCenCenelecDigitalGovernanceRelayEvent({
    at: new Date().toISOString(),
    storeSlug: parsed.data.storeSlug,
    eventId: parsed.data.eventId,
    bodyId: parsed.data.bodyId,
    governanceRecordId: parsed.data.governanceRecordId,
  });

  const prev = readCenCenelecDigitalProductGovernanceRegistry(merged);
  const finalJson = prev
    ? mergeCenCenelecDigitalProductGovernanceRegistry(merged, { ...prev, kafkaRelayed: relay.published })
    : merged;

  await prisma.storefrontSettings.update({
    where: { id: sf.id },
    data: { themeExperimentJson: finalJson as object },
  });

  logger.info("cen_cenelec_digital_product_governance_webhook", {
    storeSlug: parsed.data.storeSlug,
    publishBlockedByGovernance: snap.publishBlockedByGovernance,
  });

  return NextResponse.json({
    ok: true,
    governanceRegistryReady: snap.governanceRegistryReady,
    publishBlockedByGovernance: snap.publishBlockedByGovernance,
    kafkaRelayed: relay.published,
  });
}
