import { NextResponse } from "next/server";

import { runCronRoute } from "@/lib/api/run-cron";

import { logger } from "@/lib/logger";
import { runItuUncitralDigitalCommerceAiRegistrySyncCycle } from "@/services/storefront/_experiments/itu-uncitral-digital-commerce-ai-registry-sync-service";

export const dynamic = "force-dynamic";

async function handleCron(request: Request) {
  return runCronRoute(request, async () => {
  const result = await runItuUncitralDigitalCommerceAiRegistrySyncCycle();
  logger.info("itu_uncitral_digital_commerce_ai_registry_sync_cron", result);
  return NextResponse.json({ ok: true, ...result });
  }, { experimental: true });
}

export async function GET(request: Request) {
  return handleCron(request);
}

export async function POST(request: Request) {
  return handleCron(request);
}
