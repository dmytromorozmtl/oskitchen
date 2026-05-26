import { NextResponse } from "next/server";

import { runCronRoute } from "@/lib/api/run-cron";

import { logger } from "@/lib/logger";
import { runEuAiActArt71PmmLiveSyncCycle } from "@/services/storefront/_experiments/eu-ai-act-art71-pmm-live-sync-service";

export const dynamic = "force-dynamic";

async function handleCron(request: Request) {
  return runCronRoute(request, async () => {
  const result = await runEuAiActArt71PmmLiveSyncCycle();
  logger.info("eu_ai_act_art71_pmm_live_sync_cron", result);
  return NextResponse.json({ ok: true, ...result });
  }, { experimental: true });
}

export async function GET(request: Request) {
  return handleCron(request);
}

export async function POST(request: Request) {
  return handleCron(request);
}
