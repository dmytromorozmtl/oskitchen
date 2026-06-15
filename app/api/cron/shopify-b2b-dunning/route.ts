import { NextResponse } from "next/server";

import { runCronRoute } from "@/lib/api/run-cron";
import { logger } from "@/lib/logger";
import { runB2bDunningCronForAllConnections } from "@/services/integrations/shopify-b2b-dunning-service";

export const dynamic = "force-dynamic";

/**
 * Daily B2B dunning cron — operator weekly digest (7-day cadence) + optional auto-reminders at configured day thresholds.
 */
async function handleCron(request: Request) {
  return runCronRoute(request, async () => {
    const summary = await runB2bDunningCronForAllConnections();
    logger.info("shopify_b2b_dunning_cron", summary);
    return NextResponse.json({ ok: true, ...summary });
  });
}

export async function GET(request: Request) {
  return handleCron(request);
}

export async function POST(request: Request) {
  return handleCron(request);
}
