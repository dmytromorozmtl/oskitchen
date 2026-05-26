import { NextResponse } from "next/server";

import { runCronRoute } from "@/lib/api/run-cron";

import { logger } from "@/lib/logger";
import { runMedullaOblongataEmergencyHaltSyncCycle } from "@/services/storefront/_experiments/medulla-oblongata-emergency-halt-sync-service";

export const dynamic = "force-dynamic";

async function handleCron(request: Request) {
  return runCronRoute(request, async () => {
  const result = await runMedullaOblongataEmergencyHaltSyncCycle();
  logger.info("medulla_oblongata_emergency_halt_sync_cron", result);
  return NextResponse.json({ ok: true, ...result });
  }, { experimental: true });
}

export async function GET(request: Request) {
  return handleCron(request);
}

export async function POST(request: Request) {
  return handleCron(request);
}
