import { NextResponse } from "next/server";
import { z } from "zod";

import { requireBearerWebhookSecret } from "@/lib/api/webhook-guard";
import { logger } from "@/lib/logger";
import {
  appendFeatureStreamEvent,
  type FeatureStreamEvent,
} from "@/lib/storefront/theme-experiment-feature-stream-bus";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  storeSlug: z.string().min(1).max(120),
  visitorId: z.string().min(1).max(120),
  sessionId: z.string().min(1).max(120),
  segment: z.enum(["default", "mobile", "desktop", "returning", "new"]).optional(),
  geo: z.string().max(8).optional(),
  device: z.enum(["mobile", "desktop", "tablet", "unknown"]).optional(),
  cartValueCents: z.number().int().nonnegative().optional(),
  regretPp: z.number().optional(),
});

/**
 * Kafka/PubSub consumer → experiment.feature.v1 ingest.
 * Auth: Bearer EXPERIMENT_FEATURE_STREAM_WEBHOOK_SECRET
 */
export async function POST(request: Request) {
  const authError = requireBearerWebhookSecret(request, {
    secret: process.env.EXPERIMENT_FEATURE_STREAM_WEBHOOK_SECRET,
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

  const event: FeatureStreamEvent = {
    at: new Date().toISOString(),
    visitorId: parsed.data.visitorId,
    sessionId: parsed.data.sessionId,
    segment: parsed.data.segment ?? "default",
    geo: parsed.data.geo ?? "XX",
    device: parsed.data.device ?? "unknown",
    cartValueCents: parsed.data.cartValueCents ?? 0,
  };

  const merged = appendFeatureStreamEvent(
    sf.themeExperimentJson,
    event,
    parsed.data.regretPp ?? 0,
  );

  await prisma.storefrontSettings.update({
    where: { id: sf.id },
    data: { themeExperimentJson: merged as object },
  });

  logger.info("experiment_feature_stream_ingest", {
    storeSlug: parsed.data.storeSlug,
    visitorId: parsed.data.visitorId,
  });

  return NextResponse.json({ ok: true, storefrontId: sf.id });
}
