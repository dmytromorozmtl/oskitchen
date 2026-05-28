import { NextResponse } from "next/server";

import { runCronRoute } from "@/lib/api/run-cron";

import { logger } from "@/lib/logger";
import { runUnAiOfficeGlobalRegistryMeshSyncCycle } from "@/services/storefront/_experiments/un-ai-office-global-registry-mesh-sync-service";

export const dynamic = "force-dynamic";

async function handleCron(request: Request) {
  return runCronRoute(request, async () => {
  const result = await runUnAiOfficeGlobalRegistryMeshSyncCycle();
  logger.info("un_ai_office_global_registry_mesh_sync_cron", result);
  return NextResponse.json({ ok: true, ...result });
  });
}

export async function GET(request: Request) {
  return handleCron(request);
}

export async function POST(request: Request) {
  return handleCron(request);
}
