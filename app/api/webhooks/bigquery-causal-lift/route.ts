import { NextResponse } from "next/server";
import { z } from "zod";

import { requireBearerWebhookSecret } from "@/lib/api/webhook-guard";
import { logger } from "@/lib/logger";
import {
  computeSyntheticControlLift,
  mergeCausalLiftDailyIntoJson,
  recommendGeoHoldoutPercent,
  type CausalForestCell,
} from "@/lib/storefront/theme-experiment-causal-forest";
import { prisma } from "@/lib/prisma";

const cellSchema = z.object({
  region: z.string(),
  segment: z.string(),
  armId: z.string(),
  liftPp: z.number(),
  exposures: z.number().int().nonnegative(),
  syntheticWeight: z.number().optional(),
});

const bodySchema = z.object({
  storeSlug: z.string().min(1).max(120),
  cells: z.array(cellSchema).min(1),
  globalLiftPp: z.number().optional(),
  asOf: z.string().datetime().optional(),
});

/**
 * BQ experiment_causal_lift_daily → causalLiftDaily + auto geoHoldoutPercent.
 * Auth: Bearer BIGQUERY_CAUSAL_LIFT_WEBHOOK_SECRET
 */
export async function POST(request: Request) {
  const authError = requireBearerWebhookSecret(request, {
    secret: process.env.BIGQUERY_CAUSAL_LIFT_WEBHOOK_SECRET,
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

  const cells: CausalForestCell[] = parsed.data.cells.map((c) => ({
    ...c,
    syntheticWeight: c.syntheticWeight ?? c.exposures,
  }));
  const syntheticControlLiftPp = computeSyntheticControlLift(cells);
  const recommendedHoldoutPercent = recommendGeoHoldoutPercent(cells);
  const globalLiftPp = parsed.data.globalLiftPp ?? syntheticControlLiftPp;

  const snap = {
    at: parsed.data.asOf ?? new Date().toISOString(),
    cells,
    globalLiftPp,
    recommendedHoldoutPercent,
    syntheticControlLiftPp,
    alignedWithHierarchical: true,
  };

  const merged = mergeCausalLiftDailyIntoJson(sf.themeExperimentJson, snap);

  await prisma.storefrontSettings.update({
    where: { id: sf.id },
    data: { themeExperimentJson: merged as object },
  });

  logger.info("bigquery_causal_lift_webhook", {
    storeSlug: parsed.data.storeSlug,
    holdout: recommendedHoldoutPercent,
    globalLiftPp,
  });

  return NextResponse.json({ ok: true, storefrontId: sf.id });
}
