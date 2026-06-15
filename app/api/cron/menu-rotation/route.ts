import { NextResponse } from "next/server";

import { runCronRoute } from "@/lib/api/run-cron";
import { logger } from "@/lib/logger";
import { runMenuRotationForAllUsers } from "@/services/menus/menu-rotation-service";

export const dynamic = "force-dynamic";

async function handleCron() {
  const started = Date.now();
  const summary = await runMenuRotationForAllUsers();
  const durationMs = Date.now() - started;
  logger.info("menu_rotation_cron", { ...summary, durationMs });
  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
    durationMs,
    summary,
  });
}

export async function GET(request: Request) {
  return runCronRoute(request, handleCron);
}

export async function POST(request: Request) {
  return runCronRoute(request, handleCron);
}
