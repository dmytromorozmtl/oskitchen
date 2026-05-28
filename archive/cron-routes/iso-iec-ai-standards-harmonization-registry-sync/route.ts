import { NextResponse } from "next/server";

import { runCronRoute } from "@/lib/api/run-cron";

import { logger } from "@/lib/logger";
import { runIsoIecAiStandardsHarmonizationRegistrySyncCycle } from "@/services/storefront/_experiments/iso-iec-ai-standards-harmonization-registry-sync-service";

export const dynamic = "force-dynamic";

async function handleCron(request: Request) {
  return runCronRoute(request, async () => {
  const result = await runIsoIecAiStandardsHarmonizationRegistrySyncCycle();
  logger.info("iso_iec_ai_standards_harmonization_registry_sync_cron", result);
  return NextResponse.json({ ok: true, ...result });
  }, { experimental: true });
}

export async function GET(request: Request) {
  return handleCron(request);
}

export async function POST(request: Request) {
  return handleCron(request);
}
