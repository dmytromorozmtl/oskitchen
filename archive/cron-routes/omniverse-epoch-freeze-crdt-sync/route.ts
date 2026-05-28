import { NextResponse } from "next/server";

import { runCronRoute } from "@/lib/api/run-cron";

import { logger } from "@/lib/logger";
import { runOmniverseEpochFreezeCrdtSyncCycle } from "@/services/storefront/_experiments/omniverse-epoch-freeze-crdt-sync-service";

export const dynamic = "force-dynamic";

async function handleCron(request: Request) {
  return runCronRoute(request, async () => {
  const result = await runOmniverseEpochFreezeCrdtSyncCycle();
  logger.info("omniverse_epoch_freeze_crdt_sync_cron", result);
  return NextResponse.json({ ok: true, ...result });
  }, { experimental: true });
}

export async function GET(request: Request) {
  return handleCron(request);
}

export async function POST(request: Request) {
  return handleCron(request);
}
