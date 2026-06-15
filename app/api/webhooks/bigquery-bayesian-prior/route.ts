import { NextResponse } from "next/server";
import { z } from "zod";

import { requireBearerWebhookSecret } from "@/lib/api/webhook-guard";
import { logger } from "@/lib/logger";
import {
  mergeBayesianPriorIntoJson,
  type BayesianPriorArm,
  type BayesianPriorSnapshot,
} from "@/lib/storefront/theme-experiment-bayesian-prior";
import { prisma } from "@/lib/prisma";

const armSchema = z.object({
  armId: z.string().min(1).max(64),
  alpha: z.number().positive(),
  beta: z.number().positive(),
  meanRate: z.number().min(0).max(1),
  ciLow: z.number().min(0).max(1),
  ciHigh: z.number().min(0).max(1),
});

const metricSchema = z.object({
  metricId: z.enum(["conversion", "revenue", "aov"]),
  controlArmId: z.string().min(1).max(64),
  bestArmId: z.string().min(1).max(64),
  liftPp: z.number(),
  probWinning: z.number().min(0).max(100),
  probLiftAboveThreshold: z.number().min(0).max(100),
  meanControl: z.number(),
  meanTreatment: z.number(),
  ciLow: z.number(),
  ciHigh: z.number(),
});

const bodySchema = z.object({
  storeSlug: z.string().min(1).max(120),
  source: z.enum(["bq", "pymc", "stan", "pymc_gpu"]).optional(),
  controlArmId: z.string().min(1).max(64),
  bestArmId: z.string().min(1).max(64),
  liftPp: z.number(),
  probLiftAboveThreshold: z.number().min(0).max(100),
  thresholdPp: z.number().optional(),
  arms: z.array(armSchema).min(1),
  metrics: z.array(metricSchema).optional(),
  hierarchical: z.boolean().optional(),
  asOf: z.string().datetime().optional(),
});

/**
 * BigQuery / PyMC / Stan nightly batch → bayesianPrior in themeExperimentJson.
 * Auth: `Authorization: Bearer ${BIGQUERY_BAYESIAN_PRIOR_WEBHOOK_SECRET}`
 */
export async function POST(request: Request) {
  const authError = requireBearerWebhookSecret(request, {
    secret: process.env.BIGQUERY_BAYESIAN_PRIOR_WEBHOOK_SECRET,
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

  const snap: BayesianPriorSnapshot = {
    at: parsed.data.asOf ?? new Date().toISOString(),
    source: parsed.data.source ?? "bq",
    controlArmId: parsed.data.controlArmId,
    bestArmId: parsed.data.bestArmId,
    liftPp: parsed.data.liftPp,
    probLiftAboveThreshold: parsed.data.probLiftAboveThreshold,
    thresholdPp: parsed.data.thresholdPp ?? 2,
    arms: parsed.data.arms as BayesianPriorArm[],
    metrics: parsed.data.metrics,
    hierarchical: parsed.data.hierarchical === true || (parsed.data.metrics?.length ?? 0) > 0,
  };

  const merged = mergeBayesianPriorIntoJson(sf.themeExperimentJson, snap);

  await prisma.storefrontSettings.update({
    where: { id: sf.id },
    data: { themeExperimentJson: merged as object },
  });

  logger.info("bigquery_bayesian_prior_webhook", {
    storeSlug: parsed.data.storeSlug,
    bestArmId: parsed.data.bestArmId,
    probLift: parsed.data.probLiftAboveThreshold,
  });

  return NextResponse.json({ ok: true, storefrontId: sf.id });
}
