import { NextResponse } from "next/server";
import { z } from "zod";

import { requireBearerWebhookSecret } from "@/lib/api/webhook-guard";
import { logger } from "@/lib/logger";
import {
  ingestOecdStateAgTransparencyEvent,
  isOecdStateAgAiTransparencyMeshEnabled,
  mergeOecdStateAgAiTransparencyMesh,
  readOecdStateAgAiTransparencyMesh,
} from "@/lib/compliance/oecd-state-ag-ai-transparency-mesh";
import { publishOecdStateAgTransparencyRelayEvent } from "@/lib/experiment-production/mesh-kafka-relay";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  storeSlug: z.string().min(1).max(120),
  eventId: z.string().min(1).max(128),
  jurisdictionId: z.enum(["oecd_core", "state_ag_ca", "state_ag_ny", "state_ag_tx"]),
  disclosureRecordId: z.string().min(1).max(128),
  algorithmicSystemId: z.string().min(1).max(128),
  crossBorderAligned: z.boolean(),
});

export async function POST(request: Request) {
  const authError = requireBearerWebhookSecret(request, {
    secret: process.env.OECD_STATE_AG_TRANSPARENCY_WEBHOOK_SECRET,
  });
  if (authError) {
    return authError;
  }

  if (!isOecdStateAgAiTransparencyMeshEnabled()) {
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

  const { json: merged, snap } = ingestOecdStateAgTransparencyEvent(sf.themeExperimentJson, {
    source: "webhook",
    eventId: parsed.data.eventId,
    jurisdictionId: parsed.data.jurisdictionId,
    disclosureRecordId: parsed.data.disclosureRecordId,
    algorithmicSystemId: parsed.data.algorithmicSystemId,
    crossBorderAligned: parsed.data.crossBorderAligned,
    syncedToOecdMesh: true,
  });

  const relay = await publishOecdStateAgTransparencyRelayEvent({
    at: new Date().toISOString(),
    storeSlug: parsed.data.storeSlug,
    eventId: parsed.data.eventId,
    jurisdictionId: parsed.data.jurisdictionId,
    disclosureRecordId: parsed.data.disclosureRecordId,
  });

  const prev = readOecdStateAgAiTransparencyMesh(merged);
  const finalJson = prev
    ? mergeOecdStateAgAiTransparencyMesh(merged, { ...prev, kafkaRelayed: relay.published })
    : merged;

  await prisma.storefrontSettings.update({
    where: { id: sf.id },
    data: { themeExperimentJson: finalJson as object },
  });

  logger.info("oecd_state_ag_transparency_webhook", {
    storeSlug: parsed.data.storeSlug,
    publishBlockedByOecdMesh: snap.publishBlockedByOecdMesh,
  });

  return NextResponse.json({
    ok: true,
    meshFeedReady: snap.meshFeedReady,
    publishBlockedByOecdMesh: snap.publishBlockedByOecdMesh,
    kafkaRelayed: relay.published,
  });
}
