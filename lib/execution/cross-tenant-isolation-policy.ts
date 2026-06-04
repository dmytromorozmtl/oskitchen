/**
 * FINAL-16 — Cross-tenant isolation staging policy constants.
 */

export const CROSS_TENANT_ISOLATION_POLICY_ID = "final-16-cross-tenant-v1" as const;

export const CROSS_TENANT_ISOLATION_SUMMARY_ARTIFACT =
  "artifacts/cross-tenant-isolation-staging-summary.json" as const;

export const CROSS_TENANT_ISOLATION_SUMMARY_VERSION = "final-16-cross-tenant-v1" as const;

export const CROSS_TENANT_E2E_SPEC = "e2e/cross-tenant-isolation-staging.spec.ts" as const;

export const CROSS_TENANT_E2E_PROJECT = "chromium-authed" as const;

export const CROSS_TENANT_RUNNER_SCRIPT =
  "scripts/ops/run-cross-tenant-isolation-audit.ts" as const;

export const CROSS_TENANT_MOCK_VITEST_SPEC =
  "tests/unit/cross-tenant-denial.test.ts" as const;

export const CROSS_TENANT_STAGING_REQUIRED_ENV = [
  "DATABASE_URL",
  "E2E_STAGING_BASE_URL",
  "E2E_LOGIN_EMAIL",
  "E2E_LOGIN_PASSWORD",
] as const;

/** Contract markers — tenant A must not access tenant B resources (403/404). */
export const CROSS_TENANT_CONTRACT_MARKERS = [
  "cross_tenant_workspace_forbidden",
  "cross_tenant_location_rejected",
  "status: 403",
  "Tenant A → tenant B",
] as const;
