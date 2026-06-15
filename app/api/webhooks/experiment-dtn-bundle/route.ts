import { NextResponse } from "next/server";
import { z } from "zod";

import { requireBearerWebhookSecret } from "@/lib/api/webhook-guard";
import { logger } from "@/lib/logger";
import { ingestDtnBundle, type DtnNodeId } from "@/lib/storefront/theme-experiment-dtn-mesh";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  storeSlug: z.string().min(1).max(120),
  sourceNode: z.enum(["earth", "leo", "lunar_relay", "mars_edge_sim"]),
  targetNode: z.enum(["earth", "leo", "lunar_relay", "mars_edge_sim"]),
  latencyMs: z.number().int().nonnegative(),
  cloud: z.enum(["aws", "gcp", "azure"]),
  region: z.string().min(1).max(64),
  armId: z.string().min(1).max(64),
  conversions: z.number().int().nonnegative(),
  checkouts: z.number().int().nonnegative(),
  liftPp: z.number(),
});

/**
 * DTN bundle delivery webhook (LEO / lunar relay → earth merge).
 * Auth: Bearer EXPERIMENT_DTN_BUNDLE_WEBHOOK_SECRET
 */
export async function POST(request: Request) {
  const authError = requireBearerWebhookSecret(request, {
    secret: process.env.EXPERIMENT_DTN_BUNDLE_WEBHOOK_SECRET,
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

  const { json: merged, snap } = ingestDtnBundle(sf.themeExperimentJson, {
    sourceNode: parsed.data.sourceNode as DtnNodeId,
    targetNode: parsed.data.targetNode as DtnNodeId,
    latencyMs: parsed.data.latencyMs,
    cloud: parsed.data.cloud,
    region: parsed.data.region,
    armId: parsed.data.armId,
    conversions: parsed.data.conversions,
    checkouts: parsed.data.checkouts,
    liftPp: parsed.data.liftPp,
  });

  await prisma.storefrontSettings.update({
    where: { id: sf.id },
    data: { themeExperimentJson: merged as object },
  });

  logger.info("dtn_bundle_webhook", {
    storeSlug: parsed.data.storeSlug,
    deliveryRate: snap.deliveryRate,
    pending: snap.pendingBundles,
  });

  return NextResponse.json({ ok: true, snap });
}
