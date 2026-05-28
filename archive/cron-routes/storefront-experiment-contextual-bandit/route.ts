import { NextResponse } from "next/server";

import { runCronRoute } from "@/lib/api/run-cron";

import { logger } from "@/lib/logger";
import { runContextualBanditSegmentUpdate } from "@/services/storefront/theme-experiment-contextual-bandit-service";

export const dynamic = "force-dynamic";

async function handleCron(request: Request) {
  return runCronRoute(request, async () => {
  const { updated } = await runContextualBanditSegmentUpdate();
  logger.info("storefront_experiment_contextual_bandit_cron", { updated });
  return NextResponse.json({ ok: true, updated });
  });
}

export async function GET(request: Request) {
  return handleCron(request);
}

export async function POST(request: Request) {
  return handleCron(request);
}
