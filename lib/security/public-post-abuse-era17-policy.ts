/**
 * Public POST abuse review — Evolution Era 17 Workstream C Cycle 13 (engineering Cycle 23).
 *
 * Rate limits on high-risk public POST routes identified in the abuse matrix.
 * Does NOT claim DDoS immunity, WAF parity, or global POST rate limiting on webhooks.
 */

import { WEBHOOK_SECURITY_ERA16_POLICY_ID } from "@/lib/security/webhook-security-era16-policy";

export const PUBLIC_POST_ABUSE_ERA17_POLICY_ID = "era17-public-post-abuse-v1" as const;

export const PUBLIC_POST_ABUSE_ERA17_DECISION_DATE = "2026-05-28" as const;

export const PUBLIC_POST_ABUSE_ERA17_EXTENDS_POLICIES = [WEBHOOK_SECURITY_ERA16_POLICY_ID] as const;

export const PUBLIC_POST_ABUSE_ERA17_PROOF_STATUS = "p1_public_post_guards_expanded" as const;

export const PUBLIC_POST_ABUSE_ERA17_MATRIX_MODULE = "lib/security/public-post-abuse-matrix.ts" as const;

export const PUBLIC_POST_ABUSE_ERA17_GUARD_MODULE = "lib/api/public-post-guard.ts" as const;

export const PUBLIC_POST_ABUSE_ERA17_BILLING_RATE_MODULE = "lib/billing/billing-api-rate-limit.ts" as const;

export const PUBLIC_POST_ABUSE_ERA17_DOC = "docs/public-post-abuse-review-era17.md" as const;

export const PUBLIC_POST_ABUSE_ERA17_NEW_POLICIES = ["billing_portal", "iot_ingest"] as const;

export const PUBLIC_POST_ABUSE_ERA17_HARDENED_ROUTES = [
  "/api/storefront/experiment/auto-conclude/approve",
  "/api/storefront/experiment/auto-conclude/reject",
  "/api/storefront/experiment/orchestrator/approve",
  "/api/iot/temperature",
  "/api/billing/portal",
  "/api/billing-portal",
] as const;

export const PUBLIC_POST_ABUSE_ERA17_CANONICAL_MARKERS = [
  PUBLIC_POST_ABUSE_ERA17_POLICY_ID,
  "public-post-abuse-matrix",
  "p1_public_post_guards_expanded",
  "enforceIngestRateLimit",
  "billing_portal",
  "iot_ingest",
] as const;

export const PUBLIC_POST_ABUSE_ERA17_FORBIDDEN_CLAIMS = [
  "ddos immunity",
  "waf parity",
  "global webhook rate limiting",
  "unlimited public post throughput",
] as const;

export const PUBLIC_POST_ABUSE_ERA17_CI_SCRIPTS = [
  "test:ci:public-post-abuse-era17",
  "test:ci:public-post-abuse-era17:cert",
] as const;

export const PUBLIC_POST_ABUSE_ERA17_UNIT_TESTS = [
  "tests/unit/public-post-abuse-matrix.test.ts",
  "tests/unit/public-post-abuse-era17-policy.test.ts",
  "tests/unit/public-post-abuse-era17-cert-live.test.ts",
  "tests/unit/billing-api-rate-limit.test.ts",
  "tests/unit/public-post-fail-closed.test.ts",
] as const;

export const PUBLIC_POST_ABUSE_ERA17_CANONICAL_DOC_PATHS = [
  PUBLIC_POST_ABUSE_ERA17_DOC,
  "docs/PUBLIC_POST_RATE_LIMITING.md",
  "docs/commercial-pilot-runbook.md",
  "docs/feature-maturity-matrix.md",
  "docs/ci-e2e-tier-matrix.md",
  "docs/implementation-backlog.md",
  "docs/canonical-doc-index.md",
] as const;

export const PUBLIC_POST_ABUSE_ERA17_REVIEW_SECTION =
  "Era 17 public POST abuse review (2026-05-28)" as const;

export const PUBLIC_POST_ABUSE_ERA17_BACKLOG_ID = "KOS-E17-023" as const;
