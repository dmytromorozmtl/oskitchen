import { NextResponse } from "next/server";

import { runCronRoute } from "@/lib/api/run-cron";

import { logger } from "@/lib/logger";
import { materializeExperimentFeatureStore } from "@/services/storefront/experiment-feature-store-service";

export const dynamic = "force-dynamic";

async function handleCron(request: Request) {
  return runCronRoute(request, async () => {
  const { rows, mlModelsTrained } = await materializeExperimentFeatureStore();
  logger.info("storefront_experiment_feature_store_cron", {
    rowCount: rows.length,
    mlModelsTrained,
  });
  return NextResponse.json({ ok: true, rowCount: rows.length, mlModelsTrained });
  });
}

export async function GET(request: Request) {
  return handleCron(request);
}

export async function POST(request: Request) {
  return handleCron(request);
}
