import type { DbHealth } from "@/lib/db/health";
import { checkDatabaseHealth } from "@/lib/db/health";
import { getServerEnv, isEnvConfigured } from "@/lib/env";
import { resolveObservabilityBackend } from "@/lib/observability/observability-config";
import { distributedRateLimitBackendReady } from "@/lib/rate-limit/rate-limit-env";
import {
  collectProductionReadinessIssues,
  productionStartupReadinessFailure,
  shouldFatalOnNodeStartup,
} from "@/lib/startup/production-readiness";
import { loadCriticalCronExecutionHealth } from "@/services/cron/cron-execution-evidence";
import {
  getActiveRateLimitAdapter,
  rateLimitProductionFailure,
  rateLimitProductionWarning,
} from "@/services/security/rate-limit-adapter";
import { getUberDirectCapabilitySnapshot } from "@/services/delivery/uber-direct";
import { describeQueuePosture } from "@/services/queue/queue-service";

export type ServerHealthSignals = {
  databaseReachable: boolean;
  stripeBillingConfigured: boolean;
  openAiConfigured: boolean;
  /** Credentials may be present even while Uber Direct remains placeholder-only. */
  uberDirectCredentialsPresent: boolean;
  uberDirectLiveReady: boolean;
  resendOrEmailProviderConfigured: boolean;
};

export async function getServerHealthSignals(): Promise<ServerHealthSignals> {
  const env = getServerEnv();
  const db = await checkDatabaseHealth();
  const uberDirect = getUberDirectCapabilitySnapshot(process.env);
  return {
    databaseReachable: db.ok,
    stripeBillingConfigured: Boolean(
      env.STRIPE_SECRET_KEY?.trim() &&
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim(),
    ),
    openAiConfigured: Boolean(env.OPENAI_API_KEY?.trim()),
    uberDirectCredentialsPresent: uberDirect.hasClientCredentials,
    uberDirectLiveReady:
      uberDirect.hasClientCredentials &&
      uberDirect.hasWebhookSecret &&
      uberDirect.liveQuoteCreateReady &&
      uberDirect.liveWebhookReady &&
      !uberDirect.placeholderMode,
    resendOrEmailProviderConfigured: Boolean(
      env.RESEND_API_KEY?.trim() && env.RESEND_FROM_EMAIL?.trim(),
    ),
  };
}

async function resolveSentryServerHealth(): Promise<"not_configured" | "live" | "dsn_uninitialized"> {
  if (!process.env.SENTRY_DSN?.trim()) return "not_configured";
  try {
    const Sentry = await import("@sentry/nextjs");
    return Sentry.getClient() ? "live" : "dsn_uninitialized";
  } catch {
    return "dsn_uninitialized";
  }
}

/** Extended JSON for `/api/health` — no secret values. */
export async function loadExtendedHealthSnapshot(dbHealth?: DbHealth) {
  const [db, sentryServer, cronExecution] = await Promise.all([
    dbHealth ? Promise.resolve(dbHealth) : checkDatabaseHealth(),
    resolveSentryServerHealth(),
    loadCriticalCronExecutionHealth(),
  ]);
  const rateLimitFailure = rateLimitProductionFailure();
  const queue = describeQueuePosture();
  const startupReadinessFailure = productionStartupReadinessFailure();
  return {
    database: db,
    coreEnv: isEnvConfigured(),
    queue,
    observability: resolveObservabilityBackend(),
    sentryServer,
    cronExecution,
    rateLimit: {
      ok: !rateLimitFailure,
      mode: getActiveRateLimitAdapter().kind,
      adapter: getActiveRateLimitAdapter().kind,
      distributedConfigured: distributedRateLimitBackendReady(),
      productionSafe: !rateLimitFailure,
      productionFailure: rateLimitFailure,
      productionMemoryWarning: rateLimitProductionWarning(),
    },
    startupReadiness: {
      ok: !startupReadinessFailure,
      fatalOnBoot: shouldFatalOnNodeStartup(),
      productionFailure: startupReadinessFailure,
      issues: collectProductionReadinessIssues(),
    },
  };
}
