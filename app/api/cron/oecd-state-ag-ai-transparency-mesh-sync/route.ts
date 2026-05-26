import { NextResponse } from "next/server";

import { runCronRoute } from "@/lib/api/run-cron";

import { logger } from "@/lib/logger";
import { runOecdStateAgAiTransparencyMeshSyncCycle } from "@/services/storefront/_experiments/oecd-state-ag-ai-transparency-mesh-sync-service";

export const dynamic = "force-dynamic";

async function handleCron(request: Request) {
  return runCronRoute(request, async () => {
  const result = await runOecdStateAgAiTransparencyMeshSyncCycle();
  logger.info("oecd_state_ag_ai_transparency_mesh_sync_cron", result);
  return NextResponse.json({ ok: true, ...result });
  }, { experimental: true });
}

export async function GET(request: Request) {
  return handleCron(request);
}

export async function POST(request: Request) {
  return handleCron(request);
}
