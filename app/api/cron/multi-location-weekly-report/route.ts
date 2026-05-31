import { NextResponse } from "next/server";

import { runCronRoute } from "@/lib/api/run-cron";
import { logger } from "@/lib/logger";
import { runMultiLocationWeeklyReportBatch } from "@/services/analytics/multi-location-report-service";

export const dynamic = "force-dynamic";

/** Weekly multi-location comparison email — Mondays (experimental cron). */
async function handleCron(request: Request) {
  return runCronRoute(request, async () => {
    const result = await runMultiLocationWeeklyReportBatch();
    logger.info("multi_location_weekly_report", result);
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
