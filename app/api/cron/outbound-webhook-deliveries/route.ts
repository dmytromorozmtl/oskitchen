import { NextResponse } from "next/server";

import { runCronRoute } from "@/lib/api/run-cron";
import { logger } from "@/lib/logger";
import { drainOutboundWebhookDeliveries } from "@/services/webhooks/outbound-webhook-delivery-service";

export const dynamic = "force-dynamic";

async function handleCron(request: Request) {
  return runCronRoute(request, async () => {
    const started = Date.now();
    const url = new URL(request.url);
    const dryRun = url.searchParams.get("dryRun") === "1";

    if (dryRun) {
      return NextResponse.json({ ok: true, dryRun: true, durationMs: Date.now() - started });
    }

    const stats = await drainOutboundWebhookDeliveries(25);
    const durationMs = Date.now() - started;

    logger.info("outbound_webhook_delivery_cron_batch", { ...stats, durationMs });

    return NextResponse.json({ ok: true, dryRun: false, durationMs, ...stats });
  });
}

export async function GET(request: Request) {
  return handleCron(request);
}

export async function POST(request: Request) {
  return handleCron(request);
}
