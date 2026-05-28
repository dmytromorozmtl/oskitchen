import { NextResponse } from "next/server";

import { runCronRoute } from "@/lib/api/run-cron";

import { logger } from "@/lib/logger";
import { seedUkAiSafetyPackForStorefronts } from "@/services/storefront/uk-ai-safety-seed-service";

export const dynamic = "force-dynamic";

async function handleCron(request: Request) {
  return runCronRoute(request, async () => {
  const result = await seedUkAiSafetyPackForStorefronts();
  logger.info("uk_ai_safety_seed_cron", result);
  return NextResponse.json({ ok: true, ...result });
  });
}

export async function GET(request: Request) {
  return handleCron(request);
}

export async function POST(request: Request) {
  return handleCron(request);
}
