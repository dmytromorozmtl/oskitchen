/**
 * KDS Realtime Playwright staging workflow policy — Evolution Era 11 Cycle 4.
 *
 * Optional GitHub Actions workflow for Tier E browser smoke against staging.
 * Does NOT add a job to default `ci.yml`.
 */

export const KDS_REALTIME_E2E_STAGING_WORKFLOW_ERA11_POLICY_ID =
  "era11-kds-realtime-e2e-staging-workflow-v1" as const;

export const KDS_REALTIME_E2E_STAGING_WORKFLOW_EXTENDS_POLICY_ID =
  "era11-kds-realtime-e2e-staging-v1" as const;

export const KDS_REALTIME_E2E_STAGING_WORKFLOW_FILE =
  ".github/workflows/playwright-kds-staging.yml" as const;

export const KDS_REALTIME_E2E_STAGING_WORKFLOW_JOB_ID = "kds-realtime-staging" as const;

export const KDS_REALTIME_E2E_STAGING_WORKFLOW_PLAYWRIGHT_STEP_ID = "kds_realtime_e2e" as const;

export const KDS_REALTIME_E2E_STAGING_WORKFLOW_POLICY_STEP_ID = "kds_realtime_e2e_policy" as const;

export const KDS_REALTIME_E2E_STAGING_WORKFLOW_ARTIFACT_NAME =
  "kds-realtime-e2e-staging-summary" as const;

export const KDS_REALTIME_E2E_STAGING_WORKFLOW_REQUIRED_SECRETS = [
  "E2E_STAGING_BASE_URL",
  "E2E_LOGIN_EMAIL",
  "E2E_LOGIN_PASSWORD",
] as const;

export const KDS_REALTIME_E2E_STAGING_WORKFLOW_OPTIONAL_SECRETS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

export const KDS_REALTIME_E2E_STAGING_WORKFLOW_ENV_MARKERS = [
  "ENABLE_KDS_V1_CERTIFIED",
  "KDS_REALTIME_E2E_STEP_OUTCOME",
  "PLAYWRIGHT_BASE_URL",
] as const;

export const KDS_REALTIME_E2E_STAGING_WORKFLOW_SCRIPT_MARKERS = [
  "test:ci:kds-realtime-e2e-staging:playwright",
  "test:ci:kds-realtime-e2e-staging:policy",
] as const;

export const KDS_REALTIME_E2E_STAGING_WORKFLOW_IN_DEFAULT_CI = false as const;

export const KDS_REALTIME_E2E_STAGING_WORKFLOW_CI_SCRIPTS = [
  "test:ci:kds-realtime-e2e-staging-workflow-era11",
  "test:ci:kds-realtime-e2e-staging-workflow-era11:cert",
] as const;

export const KDS_REALTIME_E2E_STAGING_WORKFLOW_UNIT_TESTS = [
  "tests/unit/kds-realtime-e2e-staging-workflow-era11-policy.test.ts",
  "tests/unit/kds-realtime-e2e-staging-workflow-era11-cert-live.test.ts",
] as const;

export const KDS_REALTIME_E2E_STAGING_WORKFLOW_CANONICAL_DOC_PATHS = [
  "docs/kds-staging-smoke-checklist.md",
  "docs/ci-e2e-tier-matrix.md",
  "docs/qa-master-test-plan.md",
] as const;

export const KDS_REALTIME_E2E_STAGING_WORKFLOW_CANONICAL_MARKERS = [
  KDS_REALTIME_E2E_STAGING_WORKFLOW_ERA11_POLICY_ID,
  KDS_REALTIME_E2E_STAGING_WORKFLOW_EXTENDS_POLICY_ID,
  "playwright-kds-staging.yml",
  KDS_REALTIME_E2E_STAGING_WORKFLOW_ARTIFACT_NAME,
] as const;
