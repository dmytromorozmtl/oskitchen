import { NextResponse } from "next/server";

import { runCronRoute } from "@/lib/api/run-cron";

import { logger } from "@/lib/logger";
import { runWtoUpuCrossBorderAiTradeRegistrySyncCycle } from "@/services/storefront/_experiments/wto-upu-cross-border-ai-trade-registry-sync-service";

export const dynamic = "force-dynamic";

async function handleCron(request: Request) {
  return runCronRoute(request, async () => {
  const result = await runWtoUpuCrossBorderAiTradeRegistrySyncCycle();
  logger.info("wto_upu_cross_border_ai_trade_registry_sync_cron", result);
  return NextResponse.json({ ok: true, ...result });
  }, { experimental: true });
}

export async function GET(request: Request) {
  return handleCron(request);
}

export async function POST(request: Request) {
  return handleCron(request);
}
