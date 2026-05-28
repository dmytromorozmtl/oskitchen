import { NextResponse } from "next/server";

import { runCronRoute } from "@/lib/api/run-cron";

import { logger } from "@/lib/logger";
import { monitorActiveExperimentSrm } from "@/services/storefront/theme-experiment-srm-monitor-service";

export const dynamic = "force-dynamic";

async function handleCron(request: Request) {
  return runCronRoute(request, async () => {
const stats = await monitorActiveExperimentSrm();
  logger.info("storefront_experiment_srm_cron", stats);
  return NextResponse.json({ ok: true, ...stats });
  }, { experimental: true });
}

export async function GET(request: Request) {
  return handleCron(request);
}

export async function POST(request: Request) {
  return handleCron(request);
}
