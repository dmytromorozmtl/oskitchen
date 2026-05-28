import { NextResponse } from "next/server";

import { runCronRoute } from "@/lib/api/run-cron";

import { logger } from "@/lib/logger";
import { runThemeExperimentMabUpdateCycle } from "@/services/storefront/theme-experiment-mab-update-service";

export const dynamic = "force-dynamic";

async function handleCron(request: Request) {
  return runCronRoute(request, async () => {
  const stats = await runThemeExperimentMabUpdateCycle();
  logger.info("storefront_experiment_mab_update_cron", stats);
  return NextResponse.json({ ok: true, ...stats });
  });
}

export async function GET(request: Request) {
  return handleCron(request);
}

export async function POST(request: Request) {
  return handleCron(request);
}
