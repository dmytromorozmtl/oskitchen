import { NextResponse } from "next/server";
import { z } from "zod";

import { requireBearerWebhookSecret } from "@/lib/api/webhook-guard";
import { logger } from "@/lib/logger";
import {
  ingestUnAiOfficeRegistryEvent,
  isUnAiOfficeGlobalRegistryMeshEnabled,
  mergeUnAiOfficeGlobalRegistryMesh,
  readUnAiOfficeGlobalRegistryMesh,
} from "@/lib/compliance/un-ai-office-global-registry-mesh";
import { publishUnAiOfficeRegistryRelayEvent } from "@/lib/experiment-production/mesh-kafka-relay";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  storeSlug: z.string().min(1).max(120),
  eventId: z.string().min(1).max(128),
  regionId: z.enum(["un_hq_ny", "unog_geneva", "unesco_paris", "itu_geneva"]),
  globalRecordId: z.string().min(1).max(128),
  modelDeploymentId: z.string().min(1).max(128),
  oecdAligned: z.boolean().optional(),
  pmmAligned: z.boolean().optional(),
});

export async function POST(request: Request) {
  const authError = requireBearerWebhookSecret(request, {
    secret: process.env.UN_AI_OFFICE_REGISTRY_WEBHOOK_SECRET,
  });
  if (authError) {
    return authError;
  }

  if (!isUnAiOfficeGlobalRegistryMeshEnabled()) {
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

  const { json: merged, snap } = ingestUnAiOfficeRegistryEvent(sf.themeExperimentJson, {
    source: "webhook",
    eventId: parsed.data.eventId,
    regionId: parsed.data.regionId,
    globalRecordId: parsed.data.globalRecordId,
    modelDeploymentId: parsed.data.modelDeploymentId,
    oecdAligned: parsed.data.oecdAligned,
    pmmAligned: parsed.data.pmmAligned,
    syncedToGlobalRegistry: true,
  });

  const relay = await publishUnAiOfficeRegistryRelayEvent({
    at: new Date().toISOString(),
    storeSlug: parsed.data.storeSlug,
    eventId: parsed.data.eventId,
    regionId: parsed.data.regionId,
    globalRecordId: parsed.data.globalRecordId,
  });

  const prev = readUnAiOfficeGlobalRegistryMesh(merged);
  const finalJson = prev
    ? mergeUnAiOfficeGlobalRegistryMesh(merged, { ...prev, kafkaRelayed: relay.published })
    : merged;

  await prisma.storefrontSettings.update({
    where: { id: sf.id },
    data: { themeExperimentJson: finalJson as object },
  });

  logger.info("un_ai_office_registry_webhook", {
    storeSlug: parsed.data.storeSlug,
    publishBlockedByUnRegistry: snap.publishBlockedByUnRegistry,
  });

  return NextResponse.json({
    ok: true,
    globalRegistryReady: snap.globalRegistryReady,
    publishBlockedByUnRegistry: snap.publishBlockedByUnRegistry,
    kafkaRelayed: relay.published,
  });
}
