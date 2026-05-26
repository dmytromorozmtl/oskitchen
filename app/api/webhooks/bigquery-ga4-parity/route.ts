import { NextResponse } from "next/server";
import { z } from "zod";

import { requireBearerWebhookSecret } from "@/lib/api/webhook-guard";
import { logger } from "@/lib/logger";
import { mergeGa4ParityIntoJson } from "@/lib/storefront/ga4-parity-json";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  storeSlug: z.string().min(1).max(120),
  parityScorePp: z.number(),
  ga4LiftPp: z.number(),
  firstPartyLiftPp: z.number(),
  asOf: z.string().datetime().optional(),
});

/**
 * BigQuery scheduled query → webhook (finance/compliance source of truth).
 * Auth: `Authorization: Bearer ${BIGQUERY_GA4_PARITY_WEBHOOK_SECRET}`
 */
export async function POST(request: Request) {
  const authError = requireBearerWebhookSecret(request, {
    secret: process.env.BIGQUERY_GA4_PARITY_WEBHOOK_SECRET,
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

  const at = parsed.data.asOf ?? new Date().toISOString();
  const merged = mergeGa4ParityIntoJson(sf.themeExperimentJson, {
    bqSnapshot: {
      at,
      parityScorePp: parsed.data.parityScorePp,
      ga4LiftPp: parsed.data.ga4LiftPp,
      firstPartyLiftPp: parsed.data.firstPartyLiftPp,
    },
    historyPoint: {
      at,
      status: Math.abs(parsed.data.parityScorePp) > 3 ? "drift" : "ok",
      parityScorePp: parsed.data.parityScorePp,
      firstPartyLiftPp: parsed.data.firstPartyLiftPp,
      ga4LiftPp: parsed.data.ga4LiftPp,
    },
  });

  await prisma.storefrontSettings.update({
    where: { id: sf.id },
    data: { themeExperimentJson: merged as object },
  });

  logger.info("bigquery_ga4_parity_webhook", {
    storeSlug: parsed.data.storeSlug,
    parityScorePp: parsed.data.parityScorePp,
  });

  return NextResponse.json({ ok: true, storefrontId: sf.id });
}
