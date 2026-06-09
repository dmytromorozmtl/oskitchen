/**
 * Blueprint P0-20 — Cross-tenant isolation E2E (Tenant A must not access Tenant B; assert 403/404).
 */

export const CROSS_TENANT_ISOLATION_E2E_POLICY_ID =
  "cross-tenant-isolation-e2e-v1" as const;

export const CROSS_TENANT_ISOLATION_MIN_SCENARIOS = 6 as const;

export const CROSS_TENANT_ISOLATION_BENCHMARK_ARTIFACT =
  "artifacts/cross-tenant-isolation-e2e-benchmark-summary.json" as const;

export const CROSS_TENANT_ISOLATION_BENCHMARK_SCRIPT =
  "scripts/run-cross-tenant-isolation-e2e-benchmark.ts" as const;

export const CROSS_TENANT_ISOLATION_BENCHMARK_UNIT_TEST =
  "tests/unit/cross-tenant-isolation-e2e.test.ts" as const;

export const CROSS_TENANT_ISOLATION_BENCHMARK_NPM_SCRIPT =
  "test:ci:cross-tenant-isolation-e2e" as const;

export const CROSS_TENANT_ISOLATION_E2E_SPEC =
  "e2e/cross-tenant-isolation.spec.ts" as const;

export const CROSS_TENANT_ISOLATION_STAGING_SPEC =
  "e2e/cross-tenant-isolation-staging.spec.ts" as const;

/** HTTP statuses that prove tenant isolation (403 forbidden, 404 not found). */
export const CROSS_TENANT_ACCEPTED_DENIAL_STATUSES = [403, 404] as const;
