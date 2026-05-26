import * as Sentry from "@sentry/nextjs";

import { logger } from "@/lib/logger";
import { resolveObservabilityBackend } from "@/lib/observability/observability-config";
import { captureErrorSafe } from "@/services/observability/error-reporting-service";

export type OpsSignalKind =
  | "cron_failure"
  | "cron_escalation"
  | "cron_escalation_follow_up"
  | "incident_remediation_follow_up"
  | "cron_slow"
  | "webhook_signature_invalid"
  | "webhook_ingest_rate_limited"
  | "api_5xx";

/** Structured ops signal — always logs; Sentry message when DSN configured. */
export function emitOpsSignal(
  kind: OpsSignalKind,
  detail: Record<string, string | number | boolean | null | undefined>,
): void {
  const payload = { kind, ...detail };
  logger.warn("ops_signal", payload);

  if (resolveObservabilityBackend() !== "SENTRY" || !process.env.SENTRY_DSN?.trim()) {
    return;
  }
  if (!Sentry.getClient()) return;

  Sentry.withScope((scope) => {
    scope.setTag("ops_signal", kind);
    for (const [k, v] of Object.entries(detail)) {
      if (v != null) scope.setTag(k, String(v).slice(0, 200));
    }
    scope.setLevel(
      kind === "api_5xx" || kind === "cron_failure" || kind === "cron_escalation"
        ? "error"
        : "warning",
    );
    Sentry.captureMessage(`ops:${kind}`, "warning");
  });
}

export function emitCronFailure(route: string, err: unknown, durationMs?: number): void {
  emitOpsSignal("cron_failure", { route, durationMs: durationMs ?? null });
  captureErrorSafe(err, { module: "cron", route });
}

export function emitWebhookSignatureInvalid(input: {
  provider: string;
  connectionId?: string;
  topic?: string;
}): void {
  emitOpsSignal("webhook_signature_invalid", {
    provider: input.provider,
    connectionId: input.connectionId ?? null,
    topic: input.topic ?? null,
  });
}
