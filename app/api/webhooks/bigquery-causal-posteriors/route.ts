import { NextResponse } from "next/server";
import { z } from "zod";

import { requireBearerWebhookSecret } from "@/lib/api/webhook-guard";
import { logger } from "@/lib/logger";
import {
  appendPosteriorPoint,
  mergeCausalPosteriorsIntoJson,
  readCausalPosteriorStream,
  type CausalPosteriorPoint,
} from "@/lib/storefront/theme-experiment-causal-posteriors";
import { prisma } from "@/lib/prisma";

const pointSchema = z.object({
  at: z.string().datetime(),
  mu: z.number(),
  sigma: z.number().positive(),
  hdiLow: z.number(),
  hdiHigh: z.number(),
  probPositive: z.number().min(0).max(1),
});

const bodySchema = z.object({
  storeSlug: z.string().min(1).max(120),
  metricId: z.string().optional(),
  points: z.array(pointSchema).min(1),
  pymcVersion: z.string().optional(),
});

/**
 * PyMC streaming posteriors → causalPosteriorStream.
 * Auth: Bearer BIGQUERY_CAUSAL_POSTERIORS_WEBHOOK_SECRET
 */
export async function POST(request: Request) {
  const authError = requireBearerWebhookSecret(request, {
    secret: process.env.BIGQUERY_CAUSAL_POSTERIORS_WEBHOOK_SECRET,
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

  let stream =
    readCausalPosteriorStream(sf.themeExperimentJson) ?? {
      at: new Date().toISOString(),
      metricId: parsed.data.metricId ?? "conversion_rate",
      points: [] as CausalPosteriorPoint[],
      pymcVersion: parsed.data.pymcVersion ?? "5.x",
      streaming: true,
    };

  for (const p of parsed.data.points) {
    stream = appendPosteriorPoint(stream, p);
  }

  const merged = mergeCausalPosteriorsIntoJson(sf.themeExperimentJson, stream);

  await prisma.storefrontSettings.update({
    where: { id: sf.id },
    data: { themeExperimentJson: merged as object },
  });

  logger.info("bigquery_causal_posteriors_webhook", {
    storeSlug: parsed.data.storeSlug,
    pointCount: stream.points.length,
  });

  return NextResponse.json({ ok: true, storefrontId: sf.id, latest: stream.points.at(-1) });
}
