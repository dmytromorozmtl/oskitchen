import { NextResponse } from "next/server";

import { runCronRoute } from "@/lib/api/run-cron";
import { logger } from "@/lib/logger";
import { runScheduledReportsWeeklyBatch } from "@/services/analytics/scheduled-reports-p2-48-service";

export const dynamic = "force-dynamic";

/** Weekly scheduled report email with PDF — Mondays 07:00 UTC (P2-48). */
async function handleCron(request: Request) {
  return runCronRoute(request, async () => {
    const result = await runScheduledReportsWeeklyBatch();
    logger.info("scheduled_reports_weekly_p2_48", result);
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
