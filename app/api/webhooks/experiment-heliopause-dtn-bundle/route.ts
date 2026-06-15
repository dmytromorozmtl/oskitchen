import { NextResponse } from "next/server";
import { z } from "zod";

import { requireBearerWebhookSecret } from "@/lib/api/webhook-guard";
import { logger } from "@/lib/logger";
import {
  ingestHeliopauseBundle,
  type HeliopauseNodeId,
} from "@/lib/storefront/theme-experiment-heliopause-dtn";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  storeSlug: z.string().min(1).max(120),
  sourceNode: z.enum(["earth", "heliopause_relay", "oort_edge_sim", "interstellar_buffer"]),
  targetNode: z.enum(["earth", "heliopause_relay", "oort_edge_sim", "interstellar_buffer"]),
  latencyMs: z.number().int().nonnegative(),
  storeAndForwardHops: z.number().int().nonnegative().optional(),
  cloud: z.enum(["aws", "gcp", "azure"]),
  region: z.string().min(1).max(64),
  armId: z.string().min(1).max(64),
  conversions: z.number().int().nonnegative(),
  checkouts: z.number().int().nonnegative(),
  liftPp: z.number(),
});

export async function POST(request: Request) {
  const authError = requireBearerWebhookSecret(request, {
    secret: process.env.EXPERIMENT_HELIOPAUSE_DTN_WEBHOOK_SECRET,
  });
  if (authError) {
    return authError;
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

  const { json: merged, snap } = ingestHeliopauseBundle(sf.themeExperimentJson, {
    sourceNode: parsed.data.sourceNode as HeliopauseNodeId,
    targetNode: parsed.data.targetNode as HeliopauseNodeId,
    latencyMs: parsed.data.latencyMs,
    storeAndForwardHops: parsed.data.storeAndForwardHops,
    cloud: parsed.data.cloud,
    region: parsed.data.region,
    armId: parsed.data.armId,
    conversions: parsed.data.conversions,
    checkouts: parsed.data.checkouts,
    liftPp: parsed.data.liftPp,
    delivered: parsed.data.latencyMs <= Number(process.env.THEME_EXPERIMENT_HELIOPAUSE_MAX_LATENCY_MS ?? "63072000000"),
  });

  await prisma.storefrontSettings.update({
    where: { id: sf.id },
    data: { themeExperimentJson: merged as object },
  });

  logger.info("heliopause_dtn_bundle_webhook", {
    storeSlug: parsed.data.storeSlug,
    pending: snap.pendingBundles,
  });

  return NextResponse.json({ ok: true, snap });
}
