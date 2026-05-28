import { NextResponse } from "next/server";

import { runCronRoute } from "@/lib/api/run-cron";

import { logger } from "@/lib/logger";
import { runIrapEssentialEightMonitoringPack } from "@/services/storefront/irap-essential-eight-monitoring-service";

export const dynamic = "force-dynamic";

async function handleCron(request: Request) {
  return runCronRoute(request, async () => {
  const result = await runIrapEssentialEightMonitoringPack();
  logger.info("irap_essential_eight_cron", result);
  if (!result.ok && result.period !== "disabled") {
    return NextResponse.json(result, { status: 500 });
  }
  return NextResponse.json(result);
  });
}

export async function GET(request: Request) {
  return handleCron(request);
}

export async function POST(request: Request) {
  return handleCron(request);
}
