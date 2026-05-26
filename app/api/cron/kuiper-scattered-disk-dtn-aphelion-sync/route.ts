import { NextResponse } from "next/server";

import { runCronRoute } from "@/lib/api/run-cron";

import { logger } from "@/lib/logger";
import { runKuiperScatteredDiskDtnAphelionSyncCycle } from "@/services/storefront/_experiments/kuiper-scattered-disk-dtn-aphelion-sync-service";

export const dynamic = "force-dynamic";

async function handleCron(request: Request) {
  return runCronRoute(request, async () => {
  const result = await runKuiperScatteredDiskDtnAphelionSyncCycle();
  logger.info("kuiper_scattered_disk_dtn_aphelion_sync_cron", result);
  return NextResponse.json({ ok: true, ...result });
  }, { experimental: true });
}

export async function GET(request: Request) {
  return handleCron(request);
}

export async function POST(request: Request) {
  return handleCron(request);
}
