import { NextResponse } from "next/server";

import { runCronRoute } from "@/lib/api/run-cron";

import { logger } from "@/lib/logger";
import { monitorActiveExperimentGa4Parity } from "@/services/storefront/ga4-parity-monitor-service";

export const dynamic = "force-dynamic";

async function handleCron(request: Request) {
  return runCronRoute(request, async () => {
const stats = await monitorActiveExperimentGa4Parity();
  logger.info("storefront_ga4_parity_cron", stats);
  return NextResponse.json({ ok: true, ...stats });
  });
}

export async function GET(request: Request) {
  return handleCron(request);
}

export async function POST(request: Request) {
  return handleCron(request);
}
