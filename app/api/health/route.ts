import { NextResponse } from "next/server";

import { batchNamedQueries } from "@/lib/db/query-optimizer";
import { checkDatabaseHealth } from "@/lib/db/health";
import { isEnvConfigured } from "@/lib/env";
import { checkSupabaseAuthHealth } from "@/lib/observability/supabase-health";
import { cachedApiCall } from "@/lib/cache/redis-cache";
import { loadExtendedHealthSnapshot } from "@/services/observability/health-check-service";

export const dynamic = "force-dynamic";

/**
 * Liveness / readiness-lite endpoint for load balancers and ops.
 * Does not echo configuration values.
 * Response contract: `lib/api/health-contract.ts` (deploy + `tests/unit/api-health-contract.test.ts`).
 */
export async function GET() {
  const db = await checkDatabaseHealth();

  const { supabase, extended } = await batchNamedQueries({
    supabase: () => checkSupabaseAuthHealth(),
    extended: () =>
      cachedApiCall("health:extended:v1", 30, () => loadExtendedHealthSnapshot(db)),
  });

  const coreEnv = isEnvConfigured();
  const ok =
    db.ok &&
    coreEnv &&
    extended.cronExecution.ok &&
    extended.rateLimit.ok &&
    extended.queue.ok &&
    extended.startupReadiness.ok;
  const sentryConfigured = extended.sentryServer !== "not_configured";
  const sentryLive = extended.sentryServer === "live";
  return NextResponse.json(
    {
      status: ok ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "dev",
      checks: {
        database: { ok: db.ok, latencyMs: db.latencyMs, poolerConfigured: db.poolerConfigured },
        coreEnv: { ok: coreEnv },
        supabase,
        queueMode: {
          ok: extended.queue.ok,
          mode: extended.queue.mode,
          productionFailure: extended.queue.productionFailure,
        },
        observability: {
          ok: true,
          backend: extended.observability,
          configured: sentryConfigured,
          sentryConnected: sentryLive,
          version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "dev",
        },
        sentryServer: {
          ok: sentryLive,
          configured: sentryConfigured,
          status: extended.sentryServer,
        },
        cronExecution: {
          ok: extended.cronExecution.ok,
          productionFailure: extended.cronExecution.productionFailure,
          tracked: extended.cronExecution.tracked,
        },
        rateLimitAdapter: {
          ok: extended.rateLimit.ok,
          mode: extended.rateLimit.mode,
          adapter: extended.rateLimit.adapter,
          distributedConfigured: extended.rateLimit.distributedConfigured,
          productionSafe: extended.rateLimit.productionSafe,
          productionFailure: extended.rateLimit.productionFailure,
          productionMemoryWarning: extended.rateLimit.productionMemoryWarning,
        },
        startupReadiness: {
          ok: extended.startupReadiness.ok,
          fatalOnBoot: extended.startupReadiness.fatalOnBoot,
          productionFailure: extended.startupReadiness.productionFailure,
          issues: extended.startupReadiness.issues,
        },
      },
    },
    { status: ok ? 200 : 503 },
  );
}
