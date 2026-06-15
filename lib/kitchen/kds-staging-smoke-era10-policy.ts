/**
 * KDS staging smoke Era 10 recertification — Evolution Era 10 Cycle 4.
 *
 * Re-validates Era 4/6/8 operational smoke honesty: queue→bump in CI, recall path
 * in integration, manual staging checklist; no Playwright Realtime in default CI.
 */

export const KDS_STAGING_SMOKE_ERA10_POLICY_ID =
  "era10-kds-staging-smoke-recert-v1" as const;

export const KDS_STAGING_SMOKE_ERA10_EXTENDS_POLICY_ID =
  "era4-kds-staging-smoke-v1" as const;

export const KDS_STAGING_SMOKE_ERA10_REALTIME_POLICY_ID =
  "era6-kds-realtime-smoke-v1" as const;

export const KDS_STAGING_SMOKE_ERA10_REALTIME_E2E_POLICY_ID =
  "era8-kds-realtime-e2e-staging-v1" as const;

/** Automated DB integration paths recertified in Era 10. */
export const KDS_STAGING_SMOKE_ERA10_INTEGRATION_TESTS = [
  "tests/integration/kds-daily-queue-bump.integration.test.ts",
] as const;

/** Stages proven in CI integration (bump + recall + allergen flag). */
export const KDS_STAGING_SMOKE_ERA10_INTEGRATION_STAGES = [
  "queue_ticket_visible",
  "bump_to_ready",
  "recall_to_preparing",
  "allergen_conflict_flag",
] as const;

/** Still manual or staging-only — not default CI browser certification. */
export const KDS_STAGING_SMOKE_ERA10_HONEST_GAPS = [
  "realtimePlaywrightInDefaultCi",
  "rushHourLoad",
  "multiStationRouting",
  "hardwareBumpBar",
] as const;

export const KDS_STAGING_SMOKE_ERA10_CI_SCRIPTS = [
  "test:ci:kds-staging-smoke-era10",
  "test:ci:kds-staging-smoke-era10:cert",
] as const;

export const KDS_STAGING_SMOKE_ERA10_UNIT_TESTS = [
  "tests/unit/kds-staging-smoke-era10-policy.test.ts",
  "tests/unit/kds-staging-smoke-era10-cert-live.test.ts",
] as const;

export const KDS_STAGING_SMOKE_ERA10_CANONICAL_DOC_PATHS = [
  "docs/kds-staging-smoke-checklist.md",
  "docs/feature-maturity-matrix.md",
  "docs/qa-master-test-plan.md",
  "docs/ci-e2e-tier-matrix.md",
] as const;

export const KDS_STAGING_SMOKE_ERA10_CANONICAL_MARKERS = [
  KDS_STAGING_SMOKE_ERA10_POLICY_ID,
  KDS_STAGING_SMOKE_ERA10_EXTENDS_POLICY_ID,
  "recall",
  "operational smoke",
] as const;
