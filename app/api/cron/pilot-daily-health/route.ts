import { NextResponse } from "next/server";

import { runCronRoute } from "@/lib/api/run-cron";
import { checkDatabaseHealth } from "@/lib/db/health";
import { isEnvConfigured } from "@/lib/env";
import { logger } from "@/lib/logger";
import { checkSupabaseAuthHealth } from "@/lib/observability/supabase-health";

export const dynamic = "force-dynamic";

/**
 * Daily pilot health probe (Vercel Cron, 08:00 UTC).
 * Logs + 503 when degraded so ops monitors / Sentry can alert.
 */
async function handleCron(request: Request) {
  return runCronRoute(request, async () => {
    const [db, supabase] = await Promise.all([
      checkDatabaseHealth(),
      checkSupabaseAuthHealth(),
    ]);
    const coreEnv = isEnvConfigured();

    const checks = {
      database: db.ok,
      supabase: supabase.ok,
      coreEnv,
    };

    const allOk = Object.values(checks).every(Boolean);

    if (!allOk) {
      logger.warn("pilot_daily_health_degraded", { checks });
    }

    return NextResponse.json(
      {
        ok: allOk,
        timestamp: new Date().toISOString(),
        status: allOk ? "ok" : "degraded",
        checks: {
          database: { ok: db.ok, latencyMs: db.latencyMs },
          supabase: { ok: supabase.ok, latencyMs: supabase.latencyMs },
          coreEnv: { ok: coreEnv },
        },
      },
      { status: allOk ? 200 : 503 },
    );
  });
}

export async function GET(request: Request) {
  return handleCron(request);
}

export async function POST(request: Request) {
  return handleCron(request);
}
