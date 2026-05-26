import { NextResponse } from "next/server";

import { runCronRoute } from "@/lib/api/run-cron";

import { logger } from "@/lib/logger";
import { runEuAiOfficeContinuousConformitySyncCycle } from "@/services/storefront/_experiments/eu-ai-office-continuous-conformity-sync-service";

export const dynamic = "force-dynamic";

async function handleCron(request: Request) {
  return runCronRoute(request, async () => {
  const result = await runEuAiOfficeContinuousConformitySyncCycle();
  logger.info("eu_ai_office_continuous_conformity_sync_cron", result);
  return NextResponse.json({ ok: true, ...result });
  }, { experimental: true });
}

export async function GET(request: Request) {
  return handleCron(request);
}

export async function POST(request: Request) {
  return handleCron(request);
}
