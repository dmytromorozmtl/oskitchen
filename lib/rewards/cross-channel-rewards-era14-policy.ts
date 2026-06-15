/**
 * Cross-channel rewards Era 14 recertification — Evolution Era 14 Cycle 2.
 *
 * Re-validates dual-ledger honesty after Era 13/14 operator and nav maturity work.
 * Does **not** implement unified ledger or cross-channel Playwright E2E.
 */

export const CROSS_CHANNEL_REWARDS_ERA14_POLICY_ID =
  "era14-cross-channel-rewards-recert-v1" as const;

export const CROSS_CHANNEL_REWARDS_ERA14_EXTENDS_POLICIES = [
  "era4-cross-channel-rewards-v1",
  "era6-dual-ledger-gtm-lock-v1",
  "era10-cross-channel-rewards-recert-v1",
] as const;

export const CROSS_CHANNEL_REWARDS_ERA14_UNIFICATION_STATUS = "deferred_locked" as const;

export const CROSS_CHANNEL_REWARDS_ERA14_UNIFIED_PLAYWRIGHT_E2E = {
  inDefaultCi: false,
  inStagingWorkflows: false,
  certified: false,
} as const;

export const CROSS_CHANNEL_REWARDS_ERA14_PILOT_HONESTY_CHECKLIST = [
  "Confirm POS checkout can redeem kitchen-ledger gift card + loyalty (unit/integration cert only).",
  "Confirm storefront gift/loyalty tables are separate — codes from POS are not valid online and vice versa.",
  "Do not demo interchangeable balances across POS and storefront in sales materials.",
  "Do not claim unified cross-channel rewards E2E — unification remains deferred_locked.",
] as const;

export const CROSS_CHANNEL_REWARDS_ERA14_OPS_DOC =
  "docs/cross-channel-rewards-honesty-checklist.md" as const;

export const CROSS_CHANNEL_REWARDS_ERA14_SMOKE_SCRIPT =
  "scripts/smoke-cross-channel-rewards-honesty.ts" as const;

export const CROSS_CHANNEL_REWARDS_ERA14_SMOKE_NPM_SCRIPT =
  "smoke:cross-channel-rewards" as const;

export const CROSS_CHANNEL_REWARDS_ERA14_CI_SCRIPTS = [
  "test:ci:cross-channel-rewards-era14",
  "test:ci:cross-channel-rewards-era14:cert",
] as const;

export const CROSS_CHANNEL_REWARDS_ERA14_UNIT_TESTS = [
  "tests/unit/cross-channel-rewards-era14-policy.test.ts",
  "tests/unit/cross-channel-rewards-era14-cert-live.test.ts",
] as const;

export const CROSS_CHANNEL_REWARDS_ERA14_CANONICAL_DOC_PATHS = [
  CROSS_CHANNEL_REWARDS_ERA14_OPS_DOC,
  "docs/feature-maturity-matrix.md",
  "docs/commercial-pilot-runbook.md",
  "docs/ci-e2e-tier-matrix.md",
  "docs/implementation-backlog.md",
] as const;

export const CROSS_CHANNEL_REWARDS_ERA14_CANONICAL_MARKERS = [
  CROSS_CHANNEL_REWARDS_ERA14_POLICY_ID,
  CROSS_CHANNEL_REWARDS_ERA14_UNIFICATION_STATUS,
  "deferred_locked",
  "dual ledger",
  "not interchangeable",
] as const;
