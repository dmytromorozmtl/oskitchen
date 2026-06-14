import { WebhookProcessingJobStatus } from "@prisma/client";

import { worstPlatformStatus, type PlatformOperationalStatus } from "@/lib/developer/platform-status";
import { isResendConfigured, isStripeConfigured } from "@/lib/env";
import { resolveObservabilityBackend } from "@/lib/observability/observability-config";
import { getEnvironmentDiagnostics } from "@/services/developer/environment-service";
import { prisma } from "@/lib/prisma";
import { getActiveRateLimitAdapter, rateLimitProductionWarning } from "@/services/security/rate-limit-adapter";

export async function probeDatabaseLatencyMs(): Promise<number | null> {
  const t0 = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return Date.now() - t0;
  } catch {
    return null;
  }
}

export type PlatformHealthCheck = {
  id: string;
  label: string;
  status: PlatformOperationalStatus;
  detail?: string;
  lastCheckedAt: string;
};

export async function getPlatformHealthChecks(): Promise<{
  overall: PlatformOperationalStatus;
  checks: PlatformHealthCheck[];
  dbLatencyMs: number | null;
}> {
  const now = new Date().toISOString();
  const env = getEnvironmentDiagnostics();
  const blocked = env.rows.filter((r) => r.status === "missing" && r.requiredOnProduction).length;
  const insecure = env.rows.filter((r) => r.status === "insecure").length;
  const dbLatencyMs = await probeDatabaseLatencyMs();

  let webhookQueueDepth: number | null = null;
  try {
    webhookQueueDepth = await prisma.webhookProcessingJob.count({
      where: { status: { in: [WebhookProcessingJobStatus.QUEUED, WebhookProcessingJobStatus.RETRYING] } },
    });
  } catch {
    webhookQueueDepth = null;
  }

  const sentryConfigured =
    resolveObservabilityBackend() === "SENTRY" && Boolean(process.env.SENTRY_DSN?.trim());
  const rateLimitAdapter = getActiveRateLimitAdapter();
  const rateLimitWarning = rateLimitProductionWarning();

  const checks: PlatformHealthCheck[] = [
    {
      id: "database",
      label: "Database connectivity",
      status: dbLatencyMs != null ? "operational" : "outage",
      detail: dbLatencyMs != null ? `Prisma round-trip ${dbLatencyMs}ms` : "Query failed",
      lastCheckedAt: now,
    },
    {
      id: "supabase_public",
      label: "Supabase public configuration",
      status: env.rows.some((r) => r.key === "NEXT_PUBLIC_SUPABASE_URL" && r.status === "missing")
        ? "outage"
        : "operational",
      lastCheckedAt: now,
    },
    {
      id: "env_production",
      label: "Production launch requirements",
      status: blocked > 0 ? "degraded" : "operational",
      detail: blocked > 0 ? `${blocked} required variable(s) unset` : "Core keys present",
      lastCheckedAt: now,
    },
    {
      id: "security_hygiene",
      label: "Credential hygiene signals",
      status: insecure > 0 ? "degraded" : "operational",
      detail: insecure > 0 ? `${insecure} variable(s) flagged for review` : "No pattern warnings",
      lastCheckedAt: now,
    },
    {
      id: "stripe",
      label: "Stripe configuration",
      status: isStripeConfigured() ? "operational" : "degraded",
      detail: isStripeConfigured() ? "Billing keys aligned" : "Stripe partially or fully unset",
      lastCheckedAt: now,
    },
    {
      id: "resend",
      label: "Resend email",
      status: isResendConfigured() ? "operational" : "degraded",
      detail: isResendConfigured() ? "Outbound email API key present" : "Resend not configured",
      lastCheckedAt: now,
    },
    {
      id: "sentry",
      label: "Sentry error reporting",
      status: sentryConfigured ? "operational" : "degraded",
      detail: sentryConfigured
        ? "SENTRY_DSN set; errors route through captureErrorSafe when client initialized"
        : "SENTRY_DSN unset — captureErrorSafe is a no-op in production until configured",
      lastCheckedAt: now,
    },
    {
      id: "webhook_job_queue",
      label: "Webhook job queue (QUEUED + RETRYING)",
      status:
        webhookQueueDepth == null
          ? "degraded"
          : webhookQueueDepth > 5_000
            ? "degraded"
            : "operational",
      detail:
        webhookQueueDepth == null
          ? "Could not read webhook_processing_jobs"
          : `${webhookQueueDepth} job(s) waiting — investigate if sustained growth`,
      lastCheckedAt: now,
    },
    {
      id: "rate_limiting",
      label: "Distributed rate limiting",
      status: rateLimitWarning ? "degraded" : "operational",
      detail: rateLimitWarning ?? `Adapter: ${rateLimitAdapter.kind}`,
      lastCheckedAt: now,
    },
  ];

  const overall = worstPlatformStatus(checks.map((c) => c.status));

  return { overall, checks, dbLatencyMs };
}
