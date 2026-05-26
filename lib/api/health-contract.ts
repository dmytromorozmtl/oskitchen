import { z } from "zod";

/**
 * Contract for GET /api/health — deploy script, production smoke, and monitoring probes.
 * Keep in sync with `app/api/health/route.ts` response shape.
 */
export const healthResponseSchema = z.object({
  status: z.enum(["ok", "degraded"]),
  timestamp: z.string(),
  version: z.string(),
  checks: z.object({
    database: z.object({
      ok: z.boolean(),
      latencyMs: z.number().nonnegative(),
      poolerConfigured: z.boolean().optional(),
    }),
    coreEnv: z.object({ ok: z.boolean() }).optional(),
    supabase: z
      .object({
        ok: z.boolean(),
        latencyMs: z.number().nonnegative().optional(),
      })
      .optional(),
    queueMode: z
      .object({
        ok: z.boolean(),
        mode: z.string(),
        productionFailure: z.string().nullable().optional(),
      })
      .optional(),
    observability: z
      .object({
        ok: z.boolean(),
        backend: z.string(),
        configured: z.boolean().optional(),
        sentryConnected: z.boolean().optional(),
        version: z.string().optional(),
      })
      .optional(),
    sentryServer: z
      .object({
        ok: z.boolean(),
        configured: z.boolean().optional(),
        status: z.enum(["not_configured", "live", "dsn_uninitialized"]).optional(),
      })
      .optional(),
    cronExecution: z
      .object({
        ok: z.boolean(),
        productionFailure: z.string().nullable().optional(),
        tracked: z
          .array(
            z.object({
              slug: z.string(),
              schedule: z.string(),
              windowMs: z.number().nonnegative(),
              status: z.enum(["healthy", "pending_initial_run", "failing", "stale"]),
              lastStartedAt: z.string().nullable(),
              lastSucceededAt: z.string().nullable(),
              lastFailedAt: z.string().nullable(),
              lastDurationMs: z.number().nullable(),
              lastStatusCode: z.number().nullable(),
              consecutiveFailures: z.number().nonnegative(),
            }),
          )
          .optional(),
      })
      .optional(),
    rateLimitAdapter: z
      .object({
        ok: z.boolean(),
        adapter: z.string(),
        productionFailure: z.string().nullable().optional(),
        productionMemoryWarning: z.string().nullable().optional(),
      })
      .optional(),
    startupReadiness: z
      .object({
        ok: z.boolean(),
        fatalOnBoot: z.boolean(),
        productionFailure: z.string().nullable().optional(),
        issues: z
          .array(
            z.object({
              id: z.enum(["rate_limit", "webhook_queue"]),
              message: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
  }),
});

export type HealthResponse = z.infer<typeof healthResponseSchema>;
