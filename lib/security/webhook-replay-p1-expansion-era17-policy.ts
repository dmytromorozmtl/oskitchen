/**
 * Webhook replay P1 expansion — Evolution Era 17 Workstream C Cycle 11.
 *
 * Extends Era 16 ingress dedupe to additional matrix P1 routes (Resend + Uber Eats).
 * Does NOT claim full replay monitoring ops for all webhook routes.
 */

import {
  WEBHOOK_REPLAY_HARDENING_ERA16_POLICY_ID,
} from "@/lib/security/webhook-replay-hardening-era16-policy";

export const WEBHOOK_REPLAY_P1_EXPANSION_ERA17_POLICY_ID =
  "era17-webhook-replay-p1-expansion-v1" as const;

export const WEBHOOK_REPLAY_P1_EXPANSION_ERA17_DECISION_DATE = "2026-05-28" as const;

export const WEBHOOK_REPLAY_P1_EXPANSION_ERA17_EXTENDS_POLICIES = [
  "era16-webhook-security-matrix-v1",
  WEBHOOK_REPLAY_HARDENING_ERA16_POLICY_ID,
] as const;

/** P1 routes expanded in Era 17 — not full matrix replay ops. */
export const WEBHOOK_REPLAY_P1_EXPANSION_ERA17_PROOF_STATUS =
  "p1_ingress_dedupe_expanded" as const;

export const WEBHOOK_REPLAY_P1_EXPANSION_ERA17_GUARD_MODULE =
  "lib/webhooks/webhook-ingress-replay-guard.ts" as const;

/** Era 17 adds Resend ingress dedupe; Uber Eats retains webhook_event_store with cert tests. */
export const WEBHOOK_REPLAY_P1_EXPANSION_ERA17_EXPANDED_ROUTES = [
  {
    apiPath: "/api/webhooks/resend",
    riskTier: "P1" as const,
    replayLayer: "ingress_dedupe_plus_provider_event_id",
    routeKey: "resend",
  },
  {
    apiPath: "/api/webhooks/uber-eats/orders",
    riskTier: "P1" as const,
    replayLayer: "webhook_event_store",
    routeKey: null,
  },
] as const;

export const WEBHOOK_REPLAY_P1_EXPANSION_ERA17_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-webhook-replay-p1-expansion-era17.ts" as const;

export const WEBHOOK_REPLAY_P1_EXPANSION_ERA17_SUMMARY_ARTIFACT =
  "artifacts/webhook-replay-p1-expansion-summary.json" as const;

export const WEBHOOK_REPLAY_P1_EXPANSION_ERA17_NPM_SCRIPT =
  "smoke:webhook-replay-p1-expansion" as const;

export const WEBHOOK_REPLAY_P1_EXPANSION_ERA17_CYCLE_RUNBOOK_STEPS = [
  "Review matrix P1 routes in lib/security/webhook-security-matrix.ts.",
  "Confirm Resend uses ingress dedupe + notificationEvent providerEventId idempotency.",
  "Confirm Uber Eats orders uses webhook_event_store duplicate short-circuit.",
  "Run npm run smoke:webhook-replay-p1-expansion — review cert chain PASS.",
  "Do not claim full webhook replay monitoring ops or live marketplace integrations.",
] as const;

export const WEBHOOK_REPLAY_P1_EXPANSION_ERA17_CANONICAL_MARKERS = [
  WEBHOOK_REPLAY_P1_EXPANSION_ERA17_POLICY_ID,
  "smoke:webhook-replay-p1-expansion",
  "p1_ingress_dedupe_expanded",
  "/api/webhooks/resend",
] as const;

export const WEBHOOK_REPLAY_P1_EXPANSION_ERA17_FORBIDDEN_CLAIMS = [
  "full webhook replay monitoring",
  "all p1 routes replay hardened",
  "live uber eats marketplace",
] as const;

export const WEBHOOK_REPLAY_P1_EXPANSION_ERA17_CI_SCRIPTS = [
  "test:ci:webhook-replay-p1-expansion-era17",
  "test:ci:webhook-replay-p1-expansion-era17:cert",
] as const;

export const WEBHOOK_REPLAY_P1_EXPANSION_ERA17_UNIT_TESTS = [
  "tests/unit/webhook-replay-p1-expansion-era17-policy.test.ts",
  "tests/unit/webhook-resend-route-security.test.ts",
  "tests/unit/webhook-uber-eats-route-security.test.ts",
  "tests/unit/webhook-replay-p1-expansion-era17-cert-live.test.ts",
] as const;

export const WEBHOOK_REPLAY_P1_EXPANSION_ERA17_CANONICAL_DOC_PATHS = [
  "docs/cron-webhook-surface.md",
  "docs/ci-e2e-tier-matrix.md",
  "docs/commercial-pilot-runbook.md",
  "docs/enterprise-procurement-pack.md",
  "docs/implementation-backlog.md",
  "docs/canonical-doc-index.md",
] as const;

export const WEBHOOK_REPLAY_P1_EXPANSION_ERA17_REVIEW_SECTION =
  "Era 17 webhook replay P1 expansion (2026-05-28)" as const;

export const WEBHOOK_REPLAY_P1_EXPANSION_ERA17_BACKLOG_ID = "KOS-E17-018" as const;
