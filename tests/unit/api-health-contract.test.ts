import { describe, expect, it } from "vitest";

import { healthResponseSchema } from "@/lib/api/health-contract";

describe("GET /api/health contract", () => {
  it("accepts production-shaped ok payload", () => {
    const sample = {
      status: "ok" as const,
      timestamp: new Date().toISOString(),
      version: "abc1234",
      checks: {
        database: { ok: true, latencyMs: 332, poolerConfigured: true },
        coreEnv: { ok: true },
        supabase: { ok: true, latencyMs: 102 },
        queueMode: {
          ok: true,
          mode: "DATABASE_WEBHOOK_JOBS",
          productionFailure: null,
        },
        observability: { ok: true, backend: "SENTRY", configured: true, sentryConnected: true },
        sentryServer: { ok: true, configured: true, status: "live" },
        cronExecution: {
          ok: true,
          productionFailure: null,
          tracked: [
            {
              slug: "webhook-jobs",
              schedule: "*/5 * * * *",
              windowMs: 1_200_000,
              status: "healthy",
              lastStartedAt: new Date().toISOString(),
              lastSucceededAt: new Date().toISOString(),
              lastFailedAt: null,
              lastDurationMs: 1400,
              lastStatusCode: 200,
              consecutiveFailures: 0,
            },
          ],
        },
        rateLimitAdapter: {
          ok: true,
          adapter: "upstash",
          productionFailure: null,
          productionMemoryWarning: null,
        },
        startupReadiness: {
          ok: true,
          fatalOnBoot: true,
          productionFailure: null,
          issues: [],
        },
      },
    };
    expect(healthResponseSchema.safeParse(sample).success).toBe(true);
  });

  it("accepts degraded status with 503 semantics", () => {
    const parsed = healthResponseSchema.safeParse({
      status: "degraded",
      timestamp: new Date().toISOString(),
      version: "dev",
      checks: {
        database: { ok: false, latencyMs: 0 },
        coreEnv: { ok: true },
        observability: { ok: true, backend: "NONE", configured: false, sentryConnected: false },
        sentryServer: { ok: false, configured: false, status: "not_configured" },
        cronExecution: {
          ok: false,
          productionFailure:
            "Critical production cron execution evidence is stale or failing: webhook-jobs:stale",
          tracked: [
            {
              slug: "webhook-jobs",
              schedule: "*/5 * * * *",
              windowMs: 1_200_000,
              status: "stale",
              lastStartedAt: new Date().toISOString(),
              lastSucceededAt: null,
              lastFailedAt: null,
              lastDurationMs: null,
              lastStatusCode: null,
              consecutiveFailures: 0,
            },
          ],
        },
        startupReadiness: {
          ok: false,
          fatalOnBoot: false,
          productionFailure: "Distributed rate limiting is required in production for critical routes. Configure Upstash or Redis before serving traffic.",
          issues: [
            {
              id: "rate_limit",
              message:
                "Distributed rate limiting is required in production for critical routes. Configure Upstash or Redis before serving traffic.",
            },
          ],
        },
      },
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects missing status", () => {
    const parsed = healthResponseSchema.safeParse({
      timestamp: new Date().toISOString(),
      version: "",
      checks: { database: { ok: true, latencyMs: 1 } },
    });
    expect(parsed.success).toBe(false);
  });
});
