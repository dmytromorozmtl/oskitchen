import { NextResponse } from "next/server";
import { z } from "zod";

import { requireBearerWebhookSecret } from "@/lib/api/webhook-guard";
import { logger } from "@/lib/logger";
import {
  buildFederatedLearningSnapshot,
  mergeFederatedLearningIntoJson,
  type FederatedGradientCell,
} from "@/lib/storefront/theme-experiment-federated-learning";
import { prisma } from "@/lib/prisma";

const cellSchema = z.object({
  workspaceId: z.string().min(1).max(120),
  storeSlug: z.string().min(1).max(120),
  featureDim: z.number().int().positive().optional(),
  gradientNorm: z.number().nonnegative(),
  sampleCount: z.number().int().nonnegative(),
  gradientHash: z.string().optional(),
});

const bodySchema = z.object({
  storeSlug: z.string().min(1).max(120),
  cells: z.array(cellSchema).min(1),
});

/**
 * BQ federated gradient round → federatedLearning (ε-DP, no PII).
 * Auth: Bearer BIGQUERY_FEDERATED_GRADIENTS_WEBHOOK_SECRET
 */
export async function POST(request: Request) {
  const authError = requireBearerWebhookSecret(request, {
    secret: process.env.BIGQUERY_FEDERATED_GRADIENTS_WEBHOOK_SECRET,
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

  const cells: FederatedGradientCell[] = parsed.data.cells.map((c) => ({
    workspaceId: c.workspaceId,
    storeSlug: c.storeSlug,
    featureDim: c.featureDim ?? 5,
    gradientHash: c.gradientHash ?? "",
    gradientNorm: c.gradientNorm,
    sampleCount: c.sampleCount,
  }));

  const snap = buildFederatedLearningSnapshot(cells);
  const merged = mergeFederatedLearningIntoJson(sf.themeExperimentJson, snap);

  await prisma.storefrontSettings.update({
    where: { id: sf.id },
    data: { themeExperimentJson: merged as object },
  });

  logger.info("bigquery_federated_gradients_webhook", {
    storeSlug: parsed.data.storeSlug,
    cells: cells.length,
    budgetRemaining: snap.privacyBudgetRemaining,
  });

  return NextResponse.json({ ok: true, storefrontId: sf.id, snap });
}
