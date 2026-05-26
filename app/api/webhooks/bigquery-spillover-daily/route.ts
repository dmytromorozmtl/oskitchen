import { NextResponse } from "next/server";
import { z } from "zod";

import { requireBearerWebhookSecret } from "@/lib/api/webhook-guard";
import { logger } from "@/lib/logger";
import {
  buildCausalDagEdges,
  mergeSpilloverDailyIntoJson,
  type SpilloverDailyCell,
} from "@/lib/storefront/theme-experiment-causal-dag";
import { prisma } from "@/lib/prisma";

const cellSchema = z.object({
  workspaceId: z.string().min(1).max(120),
  storeSlug: z.string().min(1).max(120),
  region: z.string().min(1).max(32),
  segment: z.string().min(1).max(64),
  spilloverPp: z.number(),
  treatmentArmId: z.string().min(1).max(64),
});

const bodySchema = z.object({
  storeSlug: z.string().min(1).max(120),
  cells: z.array(cellSchema).min(1),
  asOf: z.string().datetime().optional(),
});

/**
 * BQ experiment_spillover_daily → spilloverDaily + causal DAG edges.
 * Auth: Bearer BIGQUERY_SPILLOVER_WEBHOOK_SECRET
 */
export async function POST(request: Request) {
  const authError = requireBearerWebhookSecret(request, {
    secret: process.env.BIGQUERY_SPILLOVER_WEBHOOK_SECRET,
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

  const cells: SpilloverDailyCell[] = parsed.data.cells;
  const maxSpilloverPp = cells.reduce((m, c) => Math.max(m, c.spilloverPp), 0);
  const threshold = Number(process.env.THEME_EXPERIMENT_SPILLOVER_BAN_PP ?? "1");

  const snap = {
    at: parsed.data.asOf ?? new Date().toISOString(),
    cells,
    maxSpilloverPp,
    publishBanned: maxSpilloverPp > threshold,
    dagEdges: buildCausalDagEdges(cells),
  };

  const merged = mergeSpilloverDailyIntoJson(sf.themeExperimentJson, snap);

  await prisma.storefrontSettings.update({
    where: { id: sf.id },
    data: { themeExperimentJson: merged as object },
  });

  logger.info("bigquery_spillover_daily_webhook", {
    storeSlug: parsed.data.storeSlug,
    maxSpilloverPp,
    publishBanned: snap.publishBanned,
    cellCount: cells.length,
  });

  return NextResponse.json({ ok: true, storefrontId: sf.id, publishBanned: snap.publishBanned });
}
