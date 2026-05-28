/**
 * E2E staging secrets alignment — Evolution Era 12 Cycle 2.
 *
 * Playwright and `e2e/auth.setup.ts` use `E2E_LOGIN_PASSWORD`. Staging workflows
 * previously required a misnamed `E2E_PASSWORD` secret and passed it incorrectly.
 * Canonical secret: `E2E_LOGIN_PASSWORD`. Legacy alias `E2E_PASSWORD` accepted in CI only.
 */

export const E2E_STAGING_SECRETS_ERA12_POLICY_ID = "era12-e2e-staging-secrets-align-v1" as const;

export const E2E_STAGING_SECRETS_CANONICAL_PASSWORD_SECRET = "E2E_LOGIN_PASSWORD" as const;

export const E2E_STAGING_SECRETS_LEGACY_PASSWORD_SECRET = "E2E_PASSWORD" as const;

export const E2E_STAGING_SECRETS_CANONICAL_BASE_URL_SECRET = "E2E_STAGING_BASE_URL" as const;

export const E2E_STAGING_SECRETS_CANONICAL_EMAIL_SECRET = "E2E_LOGIN_EMAIL" as const;

export const E2E_STAGING_SECRETS_REQUIRED = [
  E2E_STAGING_SECRETS_CANONICAL_BASE_URL_SECRET,
  E2E_STAGING_SECRETS_CANONICAL_EMAIL_SECRET,
  E2E_STAGING_SECRETS_CANONICAL_PASSWORD_SECRET,
] as const;

/** GitHub Actions expression: password secret present (canonical or legacy). */
export const E2E_STAGING_SECRETS_PASSWORD_JOB_IF_FRAGMENT =
  "(secrets.E2E_LOGIN_PASSWORD != '' || secrets.E2E_PASSWORD != '')" as const;

/** GitHub Actions expression: map canonical password env from either secret. */
export const E2E_STAGING_SECRETS_PASSWORD_ENV_EXPRESSION =
  "${{ secrets.E2E_LOGIN_PASSWORD || secrets.E2E_PASSWORD }}" as const;

export const E2E_STAGING_SECRETS_WORKFLOWS = [
  ".github/workflows/e2e-staging.yml",
  ".github/workflows/closed-beta-gate.yml",
] as const;

export const E2E_STAGING_SECRETS_PLAYWRIGHT_CONFIG_MARKERS = [
  "E2E_LOGIN_EMAIL",
  "E2E_LOGIN_PASSWORD",
] as const;

export const E2E_STAGING_SECRETS_CI_SCRIPTS = [
  "test:ci:e2e-staging-secrets-era12",
  "test:ci:e2e-staging-secrets-era12:cert",
] as const;

export const E2E_STAGING_SECRETS_UNIT_TESTS = [
  "tests/unit/e2e-staging-secrets-era12-policy.test.ts",
  "tests/unit/e2e-staging-secrets-era12-cert-live.test.ts",
] as const;

export const E2E_STAGING_SECRETS_CANONICAL_DOC_PATHS = [
  "docs/GITHUB_E2E_STAGING_SECRETS.md",
  "docs/ci-e2e-tier-matrix.md",
  "docs/devops-release-enterprise-readiness.md",
] as const;

export const E2E_STAGING_SECRETS_CANONICAL_MARKERS = [
  E2E_STAGING_SECRETS_ERA12_POLICY_ID,
  E2E_STAGING_SECRETS_CANONICAL_PASSWORD_SECRET,
  E2E_STAGING_SECRETS_LEGACY_PASSWORD_SECRET,
] as const;
