/**
 * KDS staging workflow secrets alignment — Evolution Era 13 Cycle 2.
 *
 * Aligns `playwright-kds-staging.yml` with Era 12 staging secret conventions
 * (`E2E_LOGIN_PASSWORD` canonical; legacy `E2E_PASSWORD` alias).
 */

export const KDS_STAGING_WORKFLOW_SECRETS_ERA13_POLICY_ID =
  "era13-kds-staging-workflow-secrets-align-v1" as const;

export const KDS_STAGING_WORKFLOW_SECRETS_ERA13_EXTENDS_POLICIES = [
  "era12-e2e-staging-secrets-align-v1",
  "era11-kds-realtime-e2e-staging-workflow-v1",
] as const;

export const KDS_STAGING_WORKFLOW_SECRETS_ERA13_WORKFLOW =
  ".github/workflows/playwright-kds-staging.yml" as const;

export const KDS_STAGING_WORKFLOW_SECRETS_PASSWORD_ENV_EXPRESSION =
  "${{ secrets.E2E_LOGIN_PASSWORD || secrets.E2E_PASSWORD }}" as const;

export const KDS_STAGING_WORKFLOW_SECRETS_CI_SCRIPTS = [
  "test:ci:kds-staging-workflow-secrets-era13",
  "test:ci:kds-staging-workflow-secrets-era13:cert",
] as const;

export const KDS_STAGING_WORKFLOW_SECRETS_UNIT_TESTS = [
  "tests/unit/kds-staging-workflow-secrets-era13-policy.test.ts",
  "tests/unit/kds-staging-workflow-secrets-era13-cert-live.test.ts",
] as const;

export const KDS_STAGING_WORKFLOW_SECRETS_CANONICAL_DOC_PATHS = [
  "docs/GITHUB_E2E_STAGING_SECRETS.md",
  "docs/kds-staging-smoke-checklist.md",
  "docs/ci-e2e-tier-matrix.md",
] as const;

export const KDS_STAGING_WORKFLOW_SECRETS_CANONICAL_MARKERS = [
  KDS_STAGING_WORKFLOW_SECRETS_ERA13_POLICY_ID,
  "E2E_LOGIN_PASSWORD",
  "E2E_PASSWORD",
  KDS_STAGING_WORKFLOW_SECRETS_PASSWORD_ENV_EXPRESSION,
] as const;
