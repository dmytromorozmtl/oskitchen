import { NextResponse } from "next/server";

import { runCronRoute } from "@/lib/api/run-cron";

import { logger } from "@/lib/logger";
import { runCerebellumMotorRefinementPublishSyncCycle } from "@/services/storefront/_experiments/cerebellum-motor-refinement-publish-sync-service";

export const dynamic = "force-dynamic";

async function handleCron(request: Request) {
  return runCronRoute(request, async () => {
  const result = await runCerebellumMotorRefinementPublishSyncCycle();
  logger.info("cerebellum_motor_refinement_publish_sync_cron", result);
  return NextResponse.json({ ok: true, ...result });
  });
}

export async function GET(request: Request) {
  return handleCron(request);
}

export async function POST(request: Request) {
  return handleCron(request);
}
