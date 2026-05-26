import { NextResponse } from "next/server";

import { runCronRoute } from "@/lib/api/run-cron";

import { logger } from "@/lib/logger";
import { runUsFtcAiTransparencyLiveSyncCycle } from "@/services/storefront/_experiments/us-ftc-ai-transparency-live-sync-service";

export const dynamic = "force-dynamic";

async function handleCron(request: Request) {
  return runCronRoute(request, async () => {
  const result = await runUsFtcAiTransparencyLiveSyncCycle();
  logger.info("us_ftc_ai_transparency_live_sync_cron", result);
  return NextResponse.json({ ok: true, ...result });
  }, { experimental: true });
}

export async function GET(request: Request) {
  return handleCron(request);
}

export async function POST(request: Request) {
  return handleCron(request);
}
