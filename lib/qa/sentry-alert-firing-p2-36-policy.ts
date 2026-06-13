/**
 * Blueprint P2-36 — Sentry alert firing (production verification).
 *
 * Trigger a safe cron_failure ops signal → confirm Sentry capture → alert within 5 minutes.
 *
 * @see docs/SENTRY_ALERT_RULES.md
 * @see docs/sentry-alert-firing-p2-36-runbook.md
 * @see app/api/cron/health-ping/route.ts
 */

export const SENTRY_ALERT_FIRING_P2_36_POLICY_ID = "sentry-alert-firing-p2-36-v1" as const;

/** Ops SLA — alert must fire within 5 minutes of trigger (Sentry issue alert). */
export const SENTRY_ALERT_FIRING_P2_36_ALERT_SLA_MS = 5 * 60 * 1000;

export const SENTRY_ALERT_FIRING_P2_36_TRIGGER_ROUTE = "/api/cron/health-ping" as const;

export const SENTRY_ALERT_FIRING_P2_36_TRIGGER_QUERY = "fail=1" as const;

export const SENTRY_ALERT_FIRING_P2_36_OPS_SIGNAL = "cron_failure" as const;

export const SENTRY_ALERT_FIRING_P2_36_ALERT_RULES_DOC = "docs/SENTRY_ALERT_RULES.md" as const;

export const SENTRY_ALERT_FIRING_P2_36_RUNBOOK_DOC =
  "docs/sentry-alert-firing-p2-36-runbook.md" as const;

export const SENTRY_ALERT_FIRING_P2_36_ARTIFACT =
  "artifacts/sentry-alert-firing-p2-36-summary.json" as const;

export const SENTRY_ALERT_FIRING_P2_36_RUN_SCRIPT =
  "scripts/run-sentry-alert-firing-p2-36.ts" as const;

export const SENTRY_ALERT_FIRING_P2_36_AUDIT_SCRIPT =
  "scripts/audit-sentry-alert-firing-p2-36.ts" as const;

export const SENTRY_ALERT_FIRING_P2_36_VERIFY_SCRIPT =
  "scripts/verify-sentry-production-health.ts" as const;

export const SENTRY_ALERT_FIRING_P2_36_NPM_SCRIPT = "audit:sentry-alert-firing-p2-36" as const;

export const SENTRY_ALERT_FIRING_P2_36_UNIT_TEST =
  "tests/unit/sentry-alert-firing-p2-36.test.ts" as const;

export const SENTRY_ALERT_FIRING_P2_36_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const SENTRY_ALERT_FIRING_P2_36_FLOW_STEPS = [
  "trigger_error",
  "verify_sentry_capture",
  "assert_alert_rules_doc",
  "verify_production_health",
] as const;

export type SentryAlertFiringP2_36FlowStep =
  (typeof SENTRY_ALERT_FIRING_P2_36_FLOW_STEPS)[number];

export function isWithinSentryAlertFiringP2_36Sla(elapsedMs: number): boolean {
  return elapsedMs >= 0 && elapsedMs <= SENTRY_ALERT_FIRING_P2_36_ALERT_SLA_MS;
}

export function buildSentryAlertFiringP2_36TriggerUrl(
  baseUrl: string,
  fail = true,
): string {
  const trimmed = baseUrl.replace(/\/+$/, "");
  const path = SENTRY_ALERT_FIRING_P2_36_TRIGGER_ROUTE;
  const query = fail ? `?${SENTRY_ALERT_FIRING_P2_36_TRIGGER_QUERY}` : "";
  return `${trimmed}${path}${query}`;
}

export function hasSentryAlertFiringP2_36LiveCredentials(): boolean {
  return Boolean(
    process.env.CRON_SECRET?.trim() &&
      (process.env.SENTRY_ALERT_FIRING_BASE_URL?.trim() ||
        process.env.STAGING_URL?.trim() ||
        process.env.SENTRY_VERIFY_HEALTH_URL?.trim()),
  );
}

export function isSentryAlertFiringP2_36LiveEnabled(): boolean {
  return process.env.SENTRY_ALERT_FIRING_LIVE?.trim() === "true";
}
