import { NextResponse } from "next/server";
import { z } from "zod";

import { requireBearerWebhookSecret } from "@/lib/api/webhook-guard";
import { logger } from "@/lib/logger";
import { mergeLinUcbIntoJson, type LinUcbSnapshot } from "@/lib/storefront/theme-experiment-linucb";
import { prisma } from "@/lib/prisma";
import { notifyExperimentRegretBudgetExceeded } from "@/lib/storefront/theme-experiment-regret-alerts";

const armSchema = z.object({
  armId: z.string().min(1).max(64),
  theta: z.array(z.number()).optional(),
  weight: z.number().min(0).max(1),
});

const bodySchema = z.object({
  storeSlug: z.string().min(1).max(120),
  explorationPercent: z.number().min(0).max(15).optional(),
  regretPp: z.number().optional(),
  arms: z.array(armSchema).min(1),
  segmentWeights: z.record(z.record(z.number())).optional(),
  asOf: z.string().datetime().optional(),
});

/**
 * BQ streaming / 15m batch → linucbWeights in themeExperimentJson.
 * Auth: Bearer BIGQUERY_LINUCB_WEBHOOK_SECRET
 */
export async function POST(request: Request) {
  const authError = requireBearerWebhookSecret(request, {
    secret: process.env.BIGQUERY_LINUCB_WEBHOOK_SECRET,
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
    select: { id: true, storeSlug: true, workspaceId: true, themeExperimentJson: true },
  });
  if (!sf) {
    return NextResponse.json({ error: "Storefront not found" }, { status: 404 });
  }

  const snap: LinUcbSnapshot = {
    at: parsed.data.asOf ?? new Date().toISOString(),
    explorationPercent: parsed.data.explorationPercent ?? 10,
    regretPp: parsed.data.regretPp ?? 0,
    featureDim: 5,
    arms: parsed.data.arms.map((a) => ({
      armId: a.armId,
      theta: a.theta ?? [],
      weight: a.weight,
    })),
    segmentWeights: parsed.data.segmentWeights,
  };

  const merged = mergeLinUcbIntoJson(sf.themeExperimentJson, snap);

  await prisma.storefrontSettings.update({
    where: { id: sf.id },
    data: { themeExperimentJson: merged as object },
  });

  await notifyExperimentRegretBudgetExceeded({
    storeSlug: sf.storeSlug,
    storefrontId: sf.id,
    workspaceId: sf.workspaceId,
    themeExperimentJson: merged,
  });

  logger.info("bigquery_linucb_weights_webhook", {
    storeSlug: parsed.data.storeSlug,
    regretPp: snap.regretPp,
  });

  return NextResponse.json({ ok: true, storefrontId: sf.id });
}
