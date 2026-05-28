import { NextResponse } from "next/server";

import { runCronRoute } from "@/lib/api/run-cron";

import { logger } from "@/lib/logger";
import { runNeptuneTritonRetrogradeDtnHaloSyncCycle } from "@/services/storefront/_experiments/neptune-triton-retrograde-dtn-halo-sync-service";

export const dynamic = "force-dynamic";

async function handleCron(request: Request) {
  return runCronRoute(request, async () => {
  const result = await runNeptuneTritonRetrogradeDtnHaloSyncCycle();
  logger.info("neptune_triton_retrograde_dtn_halo_sync_cron", result);
  return NextResponse.json({ ok: true, ...result });
  }, { experimental: true });
}

export async function GET(request: Request) {
  return handleCron(request);
}

export async function POST(request: Request) {
  return handleCron(request);
}
