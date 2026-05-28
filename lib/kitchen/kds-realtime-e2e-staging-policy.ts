/**
 * KDS Realtime Playwright E2E staging policy — Evolution Era 8 Cycle 2.
 *
 * Honest scope: Supabase Realtime browser verification is **staging-only** and
 * **not** in default CI. Unit-certified poll fallback remains `era6-kds-realtime-smoke-v1`.
 * Era 11 adds staging Playwright spec (`e2e/kds-realtime-staging.spec.ts`) with explicit
 * skip summary artifact — still **not** in default CI.
 */

export const KDS_REALTIME_E2E_STAGING_POLICY_ID = "era8-kds-realtime-e2e-staging-v1" as const;

export const KDS_REALTIME_E2E_STAGING_ERA11_POLICY_ID =
  "era11-kds-realtime-e2e-staging-v1" as const;

export const KDS_REALTIME_E2E_EXTENDS_POLICY_ID = "era6-kds-realtime-smoke-v1" as const;

export const KDS_REALTIME_E2E_STAGING_CHECKLIST_DOC =
  "docs/kds-staging-smoke-checklist.md" as const;

export const KDS_REALTIME_E2E_STAGING_TIER = "Tier E" as const;

/** Staging Playwright spec (Era 11 Cycle 3). */
export const KDS_REALTIME_E2E_PLAYWRIGHT_SPEC = "e2e/kds-realtime-staging.spec.ts" as const;

export const KDS_REALTIME_E2E_IN_DEFAULT_CI = false as const;

export const KDS_REALTIME_E2E_STAGING_ONLY = true as const;

export const KDS_REALTIME_E2E_REQUIRED_ENV = [
  "PLAYWRIGHT_BASE_URL",
  "E2E_LOGIN_EMAIL",
  "E2E_LOGIN_PASSWORD",
  "ENABLE_KDS_V1_CERTIFIED",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

export const KDS_REALTIME_E2E_OPTIONAL_ENV = ["DATABASE_URL", "DIRECT_URL"] as const;

export const KDS_REALTIME_E2E_HONEST_SCOPE = {
  pollFallbackUnitCertified: true,
  pollFallbackPolicyId: KDS_REALTIME_E2E_EXTENDS_POLICY_ID,
  stagingManualRealtimeChecklist: true,
  playwrightSpecImplemented: true,
  playwrightSpecEra11PolicyId: KDS_REALTIME_E2E_STAGING_ERA11_POLICY_ID,
  defaultCiPlaywrightJob: false,
  rushHourCertified: false,
  productionRealtimeTrafficCertified: false,
} as const;

export const KDS_REALTIME_E2E_FORBIDDEN_GTM_PHRASES = [
  "realtime playwright e2e certified in ci",
  "kds realtime e2e runs on every pr",
  "production realtime e2e certified",
  "rush-hour kds playwright certified",
  "toast-class kds realtime e2e",
] as const;

export const KDS_REALTIME_E2E_CI_SCRIPTS = [
  "test:ci:kds-realtime-e2e-staging",
  "test:ci:kds-realtime-e2e-staging:cert",
] as const;

export const KDS_REALTIME_E2E_UNIT_TESTS = [
  "tests/unit/kds-realtime-e2e-staging-policy.test.ts",
  "tests/unit/kds-realtime-e2e-staging-ci-live.test.ts",
  "tests/unit/kds-realtime-e2e-staging-era11-policy.test.ts",
  "tests/unit/kds-realtime-e2e-staging-era11-cert-live.test.ts",
  "tests/unit/kds-realtime-e2e-staging-summary-policy.test.ts",
] as const;

export const KDS_REALTIME_E2E_CANONICAL_DOC_PATHS = [
  "docs/kds-staging-smoke-checklist.md",
  "docs/ci-e2e-tier-matrix.md",
] as const;

export const KDS_REALTIME_E2E_CANONICAL_MARKERS = [
  KDS_REALTIME_E2E_STAGING_POLICY_ID,
  KDS_REALTIME_E2E_EXTENDS_POLICY_ID,
  "Tier E",
  "not in default CI",
] as const;
