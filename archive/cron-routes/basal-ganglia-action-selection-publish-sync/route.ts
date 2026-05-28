import { NextResponse } from "next/server";

import { runCronRoute } from "@/lib/api/run-cron";

import { logger } from "@/lib/logger";
import { runBasalGangliaActionSelectionPublishSyncCycle } from "@/services/storefront/_experiments/basal-ganglia-action-selection-publish-sync-service";

export const dynamic = "force-dynamic";

async function handleCron(request: Request) {
  return runCronRoute(request, async () => {
  const result = await runBasalGangliaActionSelectionPublishSyncCycle();
  logger.info("basal_ganglia_action_selection_publish_sync_cron", result);
  return NextResponse.json({ ok: true, ...result });
  }, { experimental: true });
}

export async function GET(request: Request) {
  return handleCron(request);
}

export async function POST(request: Request) {
  return handleCron(request);
}
