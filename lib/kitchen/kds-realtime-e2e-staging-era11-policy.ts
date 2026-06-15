/**
 * KDS Realtime Playwright staging Era 11 extension — Evolution Era 11 Cycle 3.
 *
 * Ships staging-only Playwright spec + explicit skip artifact; does not add default CI job.
 */

export const KDS_REALTIME_E2E_STAGING_ERA11_POLICY_ID =
  "era11-kds-realtime-e2e-staging-v1" as const;

export const KDS_REALTIME_E2E_STAGING_ERA11_EXTENDS_POLICY_ID =
  "era8-kds-realtime-e2e-staging-v1" as const;

export const KDS_REALTIME_E2E_STAGING_ERA11_SUMMARY_POLICY_ID =
  "era11-kds-realtime-e2e-staging-v1" as const;

export const KDS_REALTIME_E2E_STAGING_ERA11_PLAYWRIGHT_SPEC =
  "e2e/kds-realtime-staging.spec.ts" as const;

export const KDS_REALTIME_E2E_STAGING_ERA11_IN_DEFAULT_CI = false as const;

export const KDS_REALTIME_E2E_STAGING_ERA11_CI_SCRIPTS = [
  "test:ci:kds-realtime-e2e-staging-era11",
  "test:ci:kds-realtime-e2e-staging-era11:cert",
  "test:ci:kds-realtime-e2e-staging:policy",
] as const;

export const KDS_REALTIME_E2E_STAGING_ERA11_UNIT_TESTS = [
  "tests/unit/kds-realtime-e2e-staging-era11-policy.test.ts",
  "tests/unit/kds-realtime-e2e-staging-era11-cert-live.test.ts",
  "e2e/kds-realtime-staging.spec.ts",
] as const;
