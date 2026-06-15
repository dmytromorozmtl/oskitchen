import { NextResponse } from "next/server";
import { z } from "zod";

import { requireBearerWebhookSecret } from "@/lib/api/webhook-guard";
import { logger } from "@/lib/logger";
import {
  applyHoldoutWsPush,
  mergeHoldoutWsIntoJson,
} from "@/lib/storefront/theme-experiment-holdout-ws";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  storeSlug: z.string().min(1).max(120),
  holdoutPercent: z.number().min(0).max(20),
  regionLatencies: z.record(z.string(), z.number()).optional(),
});

/**
 * WebSocket control plane → regional holdout policy push.
 * Auth: Bearer EXPERIMENT_HOLDOUT_WS_WEBHOOK_SECRET
 */
export async function POST(request: Request) {
  const authError = requireBearerWebhookSecret(request, {
    secret: process.env.EXPERIMENT_HOLDOUT_WS_WEBHOOK_SECRET,
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

  const plane = applyHoldoutWsPush({
    previousRaw: sf.themeExperimentJson,
    holdoutPercent: parsed.data.holdoutPercent,
    regionLatencies: parsed.data.regionLatencies,
  });

  const merged = mergeHoldoutWsIntoJson(sf.themeExperimentJson, plane);

  await prisma.storefrontSettings.update({
    where: { id: sf.id },
    data: { themeExperimentJson: merged as object },
  });

  logger.info("holdout_ws_push_webhook", {
    storeSlug: parsed.data.storeSlug,
    version: plane.policyVersion,
    latencyP99: plane.pushLatencyMsP99,
  });

  return NextResponse.json({ ok: true, storefrontId: sf.id, plane });
}
