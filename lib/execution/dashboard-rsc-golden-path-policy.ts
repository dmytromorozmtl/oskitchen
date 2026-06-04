/**
 * FINAL-15 — Dashboard RSC golden path policy constants.
 */

export const DASHBOARD_RSC_GOLDEN_PATH_POLICY_ID = "final-15-e2e-golden-path-v1" as const;

export const DASHBOARD_RSC_GOLDEN_PATH_SUMMARY_ARTIFACT =
  "artifacts/dashboard-rsc-golden-path-summary.json" as const;

export const DASHBOARD_RSC_GOLDEN_PATH_SUMMARY_VERSION = "final-15-e2e-golden-path-v1" as const;

export const DASHBOARD_RSC_E2E_SPEC = "e2e/dashboard-rsc-regression.spec.ts" as const;

export const DASHBOARD_RSC_E2E_PROJECT = "chromium-authed" as const;

export const DASHBOARD_RSC_RUNNER_SCRIPT =
  "scripts/ops/run-dashboard-rsc-golden-path-audit.ts" as const;

/** Critical operator routes — must not return HTTP 500 / RSC crash. */
export const DASHBOARD_RSC_GOLDEN_PATH_ROUTES = [
  "/dashboard/today",
  "/dashboard/marketplace",
  "/dashboard/pos/terminal",
] as const;

export const DASHBOARD_RSC_REQUIRED_E2E_ENV = [
  "E2E_STAGING_BASE_URL",
  "E2E_LOGIN_EMAIL",
  "E2E_LOGIN_PASSWORD",
] as const;
