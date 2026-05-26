import { NextResponse } from "next/server";
import { z } from "zod";

import { requireBearerWebhookSecret } from "@/lib/api/webhook-guard";
import { logger } from "@/lib/logger";
import { appendFeatureStreamEvent } from "@/lib/storefront/theme-experiment-feature-stream-bus";
import {
  ingestDurableFeatureStreamEvent,
  isDurableFeatureStreamEnabled,
  pushToFeatureStreamDlq,
  writeDurableLogToJson,
} from "@/lib/storefront/theme-experiment-feature-stream-durable";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  storeSlug: z.string().min(1).max(120),
  eventId: z.string().min(8).max(128),
  visitorId: z.string().min(1).max(120),
  sessionId: z.string().min(1).max(120),
  segment: z.enum(["default", "mobile", "desktop", "returning", "new"]).optional(),
  geo: z.string().max(8).optional(),
  device: z.enum(["mobile", "desktop", "tablet", "unknown"]).optional(),
  cartValueCents: z.number().int().nonnegative().optional(),
  regretPp: z.number().optional(),
  sourceTimestamp: z.string().datetime().optional(),
});

/**
 * Flink exactly-once sink → durable log + eventId dedupe (24h).
 * Auth: Bearer EXPERIMENT_FEATURE_STREAM_FLINK_SECRET
 */
export async function POST(request: Request) {
  const authError = requireBearerWebhookSecret(request, {
    secret: process.env.EXPERIMENT_FEATURE_STREAM_FLINK_SECRET,
  });
  if (authError) {
    return authError;
  }

  if (!isDurableFeatureStreamEnabled()) {
    return NextResponse.json({ error: "Durable stream disabled" }, { status: 503 });
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

  const eventAt = parsed.data.sourceTimestamp ?? new Date().toISOString();
  const ingest = ingestDurableFeatureStreamEvent({
    previousRaw: sf.themeExperimentJson,
    eventId: parsed.data.eventId,
    event: {
      at: eventAt,
      visitorId: parsed.data.visitorId,
      sessionId: parsed.data.sessionId,
      segment: parsed.data.segment ?? "default",
      geo: parsed.data.geo ?? "XX",
      device: parsed.data.device ?? "unknown",
      cartValueCents: parsed.data.cartValueCents ?? 0,
    },
    sourceTimestamp: eventAt,
  });

  let merged = writeDurableLogToJson(sf.themeExperimentJson, ingest.log);

  if (!ingest.ok) {
    merged = writeDurableLogToJson(
      merged,
      pushToFeatureStreamDlq(ingest.log, {
        eventId: parsed.data.eventId,
        at: new Date().toISOString(),
        reason: ingest.reason,
        payload: parsed.data,
      }),
    );
    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { themeExperimentJson: merged as object },
    });
    return NextResponse.json({ ok: false, dlq: true, reason: ingest.reason }, { status: 422 });
  }

  if (!ingest.duplicate) {
    merged = appendFeatureStreamEvent(
      merged,
      {
        at: eventAt,
        visitorId: parsed.data.visitorId,
        sessionId: parsed.data.sessionId,
        segment: parsed.data.segment ?? "default",
        geo: parsed.data.geo ?? "XX",
        device: parsed.data.device ?? "unknown",
        cartValueCents: parsed.data.cartValueCents ?? 0,
      },
      parsed.data.regretPp ?? 0,
    ) as Record<string, unknown>;
  }

  await prisma.storefrontSettings.update({
    where: { id: sf.id },
    data: { themeExperimentJson: merged as object },
  });

  logger.info("experiment_feature_stream_flink", {
    storeSlug: parsed.data.storeSlug,
    eventId: parsed.data.eventId,
    duplicate: ingest.duplicate,
    sloMet: ingest.log.slo.sloMet,
    lagP99: ingest.log.slo.ingestLagMsP99,
  });

  return NextResponse.json({
    ok: true,
    storefrontId: sf.id,
    duplicate: ingest.duplicate,
    slo: ingest.log.slo,
  });
}
