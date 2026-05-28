import { NextResponse } from "next/server";

import { runCronRoute } from "@/lib/api/run-cron";

import { logger } from "@/lib/logger";
import { runLunarFarsideDtnMeshSyncCycle } from "@/services/storefront/_experiments/lunar-farside-dtn-mesh-sync-service";

export const dynamic = "force-dynamic";

async function handleCron(request: Request) {
  return runCronRoute(request, async () => {
  const result = await runLunarFarsideDtnMeshSyncCycle();
  logger.info("lunar_farside_dtn_mesh_sync_cron", result);
  return NextResponse.json({ ok: true, ...result });
  }, { experimental: true });
}

export async function GET(request: Request) {
  return handleCron(request);
}

export async function POST(request: Request) {
  return handleCron(request);
}
