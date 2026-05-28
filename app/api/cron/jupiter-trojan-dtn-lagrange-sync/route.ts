import { NextResponse } from "next/server";

import { runCronRoute } from "@/lib/api/run-cron";

import { logger } from "@/lib/logger";
import { runJupiterTrojanDtnLagrangeSyncCycle } from "@/services/storefront/_experiments/jupiter-trojan-dtn-lagrange-sync-service";

export const dynamic = "force-dynamic";

async function handleCron(request: Request) {
  return runCronRoute(request, async () => {
  const result = await runJupiterTrojanDtnLagrangeSyncCycle();
  logger.info("jupiter_trojan_dtn_lagrange_sync_cron", result);
  return NextResponse.json({ ok: true, ...result });
  }, { experimental: true });
}

export async function GET(request: Request) {
  return handleCron(request);
}

export async function POST(request: Request) {
  return handleCron(request);
}
