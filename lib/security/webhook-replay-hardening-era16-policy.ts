/**
 * Webhook replay hardening — Evolution Era 16 Cycle 7.
 *
 * Adds ingress dedupe for highest-risk P1/P2 platform webhook routes identified
 * in era16-webhook-security-matrix-v1. Does NOT claim full replay monitoring ops.
 */

export const WEBHOOK_REPLAY_HARDENING_ERA16_POLICY_ID =
  "era16-webhook-replay-hardening-v1" as const;

export const WEBHOOK_REPLAY_HARDENING_ERA16_DECISION_DATE = "2026-05-28" as const;

export const WEBHOOK_REPLAY_HARDENING_ERA16_EXTENDS_POLICIES = [
  "era16-webhook-security-matrix-v1",
] as const;

export const WEBHOOK_REPLAY_HARDENING_ERA16_GUARD_MODULE =
  "lib/webhooks/webhook-ingress-replay-guard.ts" as const;

export const WEBHOOK_REPLAY_HARDENING_ERA16_HARDENED_ROUTES = [
  "/api/webhooks/uber-direct",
  "/api/webhooks/slack/experiment-interactive",
] as const;

export const WEBHOOK_REPLAY_HARDENING_ERA16_HONEST_SCOPE = {
  ingressDedupeForPlatformRoutes: true,
  fullReplayMonitoringOps: false,
  uberDirectStillPlaceholder: true,
  invalidSignatureTestsAdded: true,
} as const;

export const WEBHOOK_REPLAY_HARDENING_ERA16_CANONICAL_MARKERS = [
  WEBHOOK_REPLAY_HARDENING_ERA16_POLICY_ID,
  WEBHOOK_REPLAY_HARDENING_ERA16_GUARD_MODULE,
  "webhook_ingress_dedupe",
  "ingress dedupe",
  "duplicate: true",
] as const;

export const WEBHOOK_REPLAY_HARDENING_ERA16_FORBIDDEN_CLAIMS = [
  "full webhook replay monitoring",
  "live uber direct delivery",
] as const;

export const WEBHOOK_REPLAY_HARDENING_ERA16_CI_SCRIPTS = [
  "test:ci:webhook-replay-hardening-era16",
  "test:ci:webhook-replay-hardening-era16:cert",
] as const;

export const WEBHOOK_REPLAY_HARDENING_ERA16_UNIT_TESTS = [
  "tests/unit/webhook-ingress-replay-guard.test.ts",
  "tests/unit/webhook-replay-hardening-era16-policy.test.ts",
  "tests/unit/webhook-replay-hardening-era16-cert-live.test.ts",
  "tests/unit/webhook-uber-direct-route-security.test.ts",
] as const;

export const WEBHOOK_REPLAY_HARDENING_ERA16_CANONICAL_DOC_PATHS = [
  "docs/cron-webhook-surface.md",
  "docs/ci-e2e-tier-matrix.md",
  "docs/commercial-pilot-runbook.md",
] as const;

export const WEBHOOK_REPLAY_HARDENING_ERA16_REVIEW_SECTION =
  "Era 16 webhook replay hardening (2026-05-28)" as const;
