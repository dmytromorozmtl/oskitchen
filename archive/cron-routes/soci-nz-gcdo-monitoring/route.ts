import { NextResponse } from "next/server";

import { runCronRoute } from "@/lib/api/run-cron";

import { logger } from "@/lib/logger";
import { runSociNzGcdoMonitoringPack } from "@/services/storefront/soci-nz-gcdo-monitoring-service";

export const dynamic = "force-dynamic";

async function handleCron(request: Request) {
  return runCronRoute(request, async () => {
  const result = await runSociNzGcdoMonitoringPack();
  logger.info("soci_nz_gcdo_monitoring_cron", result);
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
