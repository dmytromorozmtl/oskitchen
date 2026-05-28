import { NextResponse } from "next/server";

import { runCronRoute } from "@/lib/api/run-cron";

import { logger } from "@/lib/logger";
import { runNistAiRmfLiveControlFeedSyncCycle } from "@/services/storefront/_experiments/nist-ai-rmf-live-control-feed-sync-service";

export const dynamic = "force-dynamic";

async function handleCron(request: Request) {
  return runCronRoute(request, async () => {
  const result = await runNistAiRmfLiveControlFeedSyncCycle();
  logger.info("nist_ai_rmf_live_control_feed_sync_cron", result);
  return NextResponse.json({ ok: true, ...result });
  }, { experimental: true });
}

export async function GET(request: Request) {
  return handleCron(request);
}

export async function POST(request: Request) {
  return handleCron(request);
}
