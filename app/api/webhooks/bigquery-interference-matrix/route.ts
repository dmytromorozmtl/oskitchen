import { NextResponse } from "next/server";
import { z } from "zod";

import { requireBearerWebhookSecret } from "@/lib/api/webhook-guard";
import { logger } from "@/lib/logger";
import {
  buildInterferenceMatrixSnapshot,
  cellsFromSpilloverAndMatrix,
  mergeInterferenceIntoJson,
  type InterferenceMatrixCell,
} from "@/lib/storefront/theme-experiment-interference-matrix";
import { prisma } from "@/lib/prisma";

const cellSchema = z.object({
  workspaceId: z.string().min(1).max(120),
  storeSlug: z.string().min(1).max(120),
  spilloverPp: z.number(),
  crossLiftPp: z.number(),
  exposures: z.number().int().nonnegative(),
  syntheticWeight: z.number().optional(),
});

const bodySchema = z.object({
  storeSlug: z.string().min(1).max(120),
  cells: z.array(cellSchema).min(1),
  asOf: z.string().datetime().optional(),
});

/**
 * BQ experiment_interference_matrix_daily → interferenceMatrix heatmap.
 * Auth: Bearer BIGQUERY_INTERFERENCE_MATRIX_WEBHOOK_SECRET
 */
export async function POST(request: Request) {
  const authError = requireBearerWebhookSecret(request, {
    secret: process.env.BIGQUERY_INTERFERENCE_MATRIX_WEBHOOK_SECRET,
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

  const matrixCells: InterferenceMatrixCell[] = parsed.data.cells.map((c) => ({
    ...c,
    syntheticWeight: c.syntheticWeight ?? c.exposures,
  }));

  const mergedCells = cellsFromSpilloverAndMatrix({ matrixCells });
  const snap = buildInterferenceMatrixSnapshot(mergedCells);

  const merged = mergeInterferenceIntoJson(sf.themeExperimentJson, snap);

  await prisma.storefrontSettings.update({
    where: { id: sf.id },
    data: { themeExperimentJson: merged as object },
  });

  logger.info("bigquery_interference_matrix_webhook", {
    storeSlug: parsed.data.storeSlug,
    cells: snap.cells.length,
    holdoutBump: snap.recommendedHoldoutBumpPercent,
  });

  return NextResponse.json({ ok: true, storefrontId: sf.id, snap });
}
