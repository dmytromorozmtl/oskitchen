import { NextResponse } from "next/server";

import { runCronRoute } from "@/lib/api/run-cron";

import { logger } from "@/lib/logger";
import { runUranusObliquityDtnPolarRelaySyncCycle } from "@/services/storefront/_experiments/uranus-obliquity-dtn-polar-relay-sync-service";

export const dynamic = "force-dynamic";

async function handleCron(request: Request) {
  return runCronRoute(request, async () => {
  const result = await runUranusObliquityDtnPolarRelaySyncCycle();
  logger.info("uranus_obliquity_dtn_polar_relay_sync_cron", result);
  return NextResponse.json({ ok: true, ...result });
  }, { experimental: true });
}

export async function GET(request: Request) {
  return handleCron(request);
}

export async function POST(request: Request) {
  return handleCron(request);
}
