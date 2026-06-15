import { NextResponse } from "next/server";
import { z } from "zod";

import { requireBearerWebhookSecret } from "@/lib/api/webhook-guard";
import { logger } from "@/lib/logger";
import {
  mergeVertexModelIntoJson,
  type VertexMlModel,
} from "@/lib/storefront/theme-experiment-vertex-ml";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  storeSlug: z.string().min(1).max(120),
  version: z.number().int().positive(),
  sha256: z.string().min(64).max(64),
  auc: z.number().min(0).max(1),
  f1: z.number().min(0).max(1),
  intercept: z.number(),
  weights: z.object({
    liftPp: z.number(),
    sampleSizeOk: z.number(),
    srmDeltaPp: z.number(),
    parityScorePp: z.number(),
    edgeSynced: z.number(),
    daysRunning: z.number(),
  }),
  featureImportance: z.record(z.number()).optional(),
  asOf: z.string().datetime().optional(),
});

/**
 * Vertex AI weekly train → mlRegretModelV2 in themeExperimentJson.
 * Auth: Bearer VERTEX_ML_MODEL_WEBHOOK_SECRET
 */
export async function POST(request: Request) {
  const authError = requireBearerWebhookSecret(request, {
    secret: process.env.VERTEX_ML_MODEL_WEBHOOK_SECRET,
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

  const model: VertexMlModel = {
    version: parsed.data.version,
    sha256: parsed.data.sha256,
    at: parsed.data.asOf ?? new Date().toISOString(),
    provider: "vertex",
    auc: parsed.data.auc,
    f1: parsed.data.f1,
    intercept: parsed.data.intercept,
    weights: parsed.data.weights,
    featureImportance: parsed.data.featureImportance ?? {},
  };

  const merged = mergeVertexModelIntoJson(sf.themeExperimentJson, model);

  await prisma.storefrontSettings.update({
    where: { id: sf.id },
    data: { themeExperimentJson: merged as object },
  });

  logger.info("vertex_ml_model_webhook", {
    storeSlug: parsed.data.storeSlug,
    version: parsed.data.version,
    f1: parsed.data.f1,
  });

  return NextResponse.json({ ok: true, storefrontId: sf.id });
}
