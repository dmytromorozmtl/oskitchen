import { NextResponse } from "next/server";

import { runCronRoute } from "@/lib/api/run-cron";
import { logger } from "@/lib/logger";
import { runCrossChannelDailyReconciliationBatch } from "@/services/inventory/cross-channel-inventory-sync";

export const dynamic = "force-dynamic";

/**
 * Daily cross-channel inventory reconciliation email (experimental cron).
 * Sends digest to workspace owners with connected Shopify/Woo/DoorDash channels.
 */
async function handleCron(request: Request) {
  return runCronRoute(request, async () => {
    const result = await runCrossChannelDailyReconciliationBatch();
    logger.info("cross_channel_daily_reconciliation", result);
    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      ...result,
    });
  });
}

export async function GET(request: Request) {
  return handleCron(request);
}

export async function POST(request: Request) {
  return handleCron(request);
}
