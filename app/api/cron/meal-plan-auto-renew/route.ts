import { NextResponse } from "next/server";

import { runCronRoute } from "@/lib/api/run-cron";
import { logger } from "@/lib/logger";
import { runMealPlanAutoRenewForAllTenants } from "@/services/meal-plans/meal-plan-auto-renew-service";

export const dynamic = "force-dynamic";

async function handleCron() {
  const started = Date.now();
  const summary = await runMealPlanAutoRenewForAllTenants();
  const durationMs = Date.now() - started;
  logger.info("meal_plan_auto_renew_cron", { ...summary, durationMs });
  return NextResponse.json({ ok: true, durationMs, summary });
}

export async function GET(request: Request) {
  return runCronRoute(request, handleCron);
}

export async function POST(request: Request) {
  return runCronRoute(request, handleCron);
}
