/**
 * E2E staging auth wiring — Evolution Era 12 Cycle 4.
 *
 * After secrets alignment (Cycle 2), the daily staging workflow runs Playwright
 * auth.setup and lightweight dashboard-authed smoke — not only unauthenticated specs.
 */

export const E2E_STAGING_AUTH_ERA12_POLICY_ID = "era12-e2e-staging-auth-wiring-v1" as const;

export const E2E_STAGING_AUTH_ERA12_EXTENDS_POLICY_ID =
  "era12-e2e-staging-secrets-align-v1" as const;

export const E2E_STAGING_AUTH_ERA12_WORKFLOW = ".github/workflows/e2e-staging.yml" as const;

export const E2E_STAGING_AUTH_ERA12_SETUP_STEP = {
  name: "Auth setup",
  command: "npx playwright test e2e/auth.setup.ts --project=setup",
} as const;

export const E2E_STAGING_AUTH_ERA12_AUTHED_SPECS = [
  "e2e/dashboard-auth.spec.ts",
] as const;

export const E2E_STAGING_AUTH_ERA12_AUTHED_PROJECT = "chromium-authed" as const;

export const E2E_STAGING_AUTH_ERA12_AUTHED_COMMAND =
  "npx playwright test e2e/dashboard-auth.spec.ts --project=chromium-authed" as const;

/** Read-only navigation smoke — no POS checkout or remediation IDOR in daily staging. */
export const E2E_STAGING_AUTH_ERA12_HONEST_SCOPE = {
  notInDefaultCi: true,
  requiresStagingSecrets: true,
  authedDashboardSmokeOnly: true,
  excludesPosCheckoutE2e: true,
  excludesRemediationIdor: true,
} as const;

export const E2E_STAGING_AUTH_ERA12_CI_SCRIPTS = [
  "test:ci:e2e-staging-auth-era12",
  "test:ci:e2e-staging-auth-era12:cert",
] as const;

export const E2E_STAGING_AUTH_ERA12_UNIT_TESTS = [
  "tests/unit/e2e-staging-auth-era12-policy.test.ts",
  "tests/unit/e2e-staging-auth-era12-cert-live.test.ts",
] as const;

export const E2E_STAGING_AUTH_ERA12_CANONICAL_DOC_PATHS = [
  "docs/GITHUB_E2E_STAGING_SECRETS.md",
  "docs/ci-e2e-tier-matrix.md",
  "docs/devops-release-enterprise-readiness.md",
  "docs/qa-master-test-plan.md",
] as const;

export const E2E_STAGING_AUTH_ERA12_CANONICAL_MARKERS = [
  E2E_STAGING_AUTH_ERA12_POLICY_ID,
  E2E_STAGING_AUTH_ERA12_EXTENDS_POLICY_ID,
  "e2e/auth.setup.ts",
  "--project=setup",
  "e2e/dashboard-auth.spec.ts",
  "chromium-authed",
] as const;
