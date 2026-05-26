import { NextResponse } from "next/server";
import { z } from "zod";

import { requireBearerWebhookSecret } from "@/lib/api/webhook-guard";
import { logger } from "@/lib/logger";
import {
  encryptArmMetricsCell,
  ingestHomomorphicArmBatch,
  mergeHomomorphicMetrics,
} from "@/lib/storefront/theme-experiment-homomorphic-metrics";
import { prisma } from "@/lib/prisma";

const cellSchema = z.object({
  armId: z.string().min(1).max(64),
  conversions: z.number().int().nonnegative(),
  checkouts: z.number().int().nonnegative(),
  visitorSealHash: z.string().optional(),
});

const bodySchema = z.object({
  storeSlug: z.string().min(1).max(120),
  cells: z.array(cellSchema).min(1),
});

/**
 * BQ homomorphic arm batch → CKKS-sim aggregation without per-visitor decrypt.
 * Auth: Bearer BIGQUERY_HOMOMORPHIC_METRICS_WEBHOOK_SECRET
 */
export async function POST(request: Request) {
  const authError = requireBearerWebhookSecret(request, {
    secret: process.env.BIGQUERY_HOMOMORPHIC_METRICS_WEBHOOK_SECRET,
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

  const encrypted = parsed.data.cells.map((c) =>
    encryptArmMetricsCell({
      armId: c.armId,
      conversions: c.conversions,
      checkouts: c.checkouts,
      visitorSealHash: c.visitorSealHash,
    }),
  );

  const snap = ingestHomomorphicArmBatch(sf.themeExperimentJson, encrypted);
  const merged = mergeHomomorphicMetrics(sf.themeExperimentJson, snap);

  await prisma.storefrontSettings.update({
    where: { id: sf.id },
    data: { themeExperimentJson: merged as object },
  });

  logger.info("homomorphic_metrics_webhook", {
    storeSlug: parsed.data.storeSlug,
    arms: snap.arms.length,
    aggregationComplete: snap.aggregationComplete,
  });

  return NextResponse.json({ ok: true, storefrontId: sf.id, snap });
}
