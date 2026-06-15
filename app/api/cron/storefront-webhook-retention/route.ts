import { NextResponse } from "next/server";

import { runCronRoute } from "@/lib/api/run-cron";
import { logger } from "@/lib/logger";
import { purgeStorefrontWebhookDeliveryLogs } from "@/services/storefront/webhook-delivery-log-service";

export const dynamic = "force-dynamic";

/** Purge old webhook.delivered / webhook.failed conversion events (90d + 500 cap per store). */
async function handleCron(request: Request) {
  return runCronRoute(request, async () => {
    const result = await purgeStorefrontWebhookDeliveryLogs();
    logger.info("storefront webhook retention cron", result);
    return NextResponse.json({ ok: true, ...result });
  });
}

export async function GET(request: Request) {
  return handleCron(request);
}

export async function POST(request: Request) {
  return handleCron(request);
}
