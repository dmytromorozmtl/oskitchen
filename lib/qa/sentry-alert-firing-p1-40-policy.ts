/**
 * P1-40 — Sentry alert firing: error → Sentry dashboard → alert notification <5min.
 *
 * @see docs/sentry-alert-firing-p1-40.md
 * @see docs/SENTRY_ALERT_RULES.md
 */

export {
  SENTRY_ALERT_FIRING_P2_36_ALERT_SLA_MS,
  SENTRY_ALERT_FIRING_P2_36_ALERT_RULES_DOC,
  SENTRY_ALERT_FIRING_P2_36_FLOW_STEPS,
  SENTRY_ALERT_FIRING_P2_36_OPS_SIGNAL,
  SENTRY_ALERT_FIRING_P2_36_RUN_SCRIPT,
  SENTRY_ALERT_FIRING_P2_36_RUNBOOK_DOC,
  SENTRY_ALERT_FIRING_P2_36_TRIGGER_ROUTE,
  SENTRY_ALERT_FIRING_P2_36_VERIFY_SCRIPT,
  buildSentryAlertFiringP2_36TriggerUrl,
  hasSentryAlertFiringP2_36LiveCredentials,
  isSentryAlertFiringP2_36LiveEnabled,
  isWithinSentryAlertFiringP2_36Sla,
} from "@/lib/qa/sentry-alert-firing-p2-36-policy";

export const SENTRY_ALERT_FIRING_P1_40_POLICY_ID = "sentry-alert-firing-p1-40-v1" as const;

export const SENTRY_ALERT_FIRING_P1_40_DOC = "docs/sentry-alert-firing-p1-40.md" as const;

export const SENTRY_ALERT_FIRING_P1_40_ARTIFACT =
  "artifacts/sentry-alert-firing-p1-40.json" as const;

export const SENTRY_ALERT_FIRING_P1_40_AUDIT_MODULE =
  "lib/qa/sentry-alert-firing-p1-40-audit.ts" as const;

export const SENTRY_ALERT_FIRING_P1_40_CHECK_NPM_SCRIPT =
  "check:sentry-alert-firing-p1-40" as const;

export const SENTRY_ALERT_FIRING_P1_40_CI_NPM_SCRIPT =
  "test:ci:sentry-alert-firing-p1-40" as const;

export const SENTRY_ALERT_FIRING_P1_40_UNIT_TEST =
  "tests/unit/sentry-alert-firing-p1-40.test.ts" as const;

export const SENTRY_ALERT_FIRING_P1_40_CI_WORKFLOW = ".github/workflows/ci.yml" as const;

export const SENTRY_ALERT_FIRING_P1_40_RUN_NPM_SCRIPT = "run:sentry-alert-firing-p2-36" as const;

/** Gap-closure chain: error → Sentry capture → alert notification within 5 minutes. */
export const SENTRY_ALERT_FIRING_P1_40_CHAIN = [
  "error",
  "sentry_capture",
  "alert_notification",
] as const;

export const SENTRY_ALERT_FIRING_P1_40_ALERT_SLA_MS = 5 * 60 * 1000 as const;

export const SENTRY_ALERT_FIRING_P1_40_WIRING_PATHS = [
  SENTRY_ALERT_FIRING_P1_40_DOC,
  SENTRY_ALERT_FIRING_P1_40_AUDIT_MODULE,
  SENTRY_ALERT_FIRING_P1_40_UNIT_TEST,
  SENTRY_ALERT_FIRING_P1_40_ARTIFACT,
  SENTRY_ALERT_FIRING_P1_40_CI_WORKFLOW,
  "lib/qa/sentry-alert-firing-p2-36-policy.ts",
  "lib/qa/sentry-alert-firing-p2-36-audit.ts",
  "app/api/cron/health-ping/route.ts",
  "services/observability/ops-signals.ts",
  "docs/SENTRY_ALERT_RULES.md",
  "scripts/run-sentry-alert-firing-p2-36.ts",
] as const;

export function isSentryAlertFiringP140WithinSla(elapsedMs: number): boolean {
  return elapsedMs >= 0 && elapsedMs <= SENTRY_ALERT_FIRING_P1_40_ALERT_SLA_MS;
}
