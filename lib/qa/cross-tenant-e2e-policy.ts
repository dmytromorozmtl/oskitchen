/**
 * Blueprint P1-14 — Cross-tenant E2E IDOR (2 workspaces, all key API routes).
 *
 * @see e2e/cross-tenant-e2e.spec.ts
 * @see lib/qa/cross-tenant-e2e-contract.ts
 */

export const CROSS_TENANT_E2E_POLICY_ID = "cross-tenant-e2e-p1-14-v1" as const;

export const CROSS_TENANT_E2E_WORKSPACE_COUNT = 2 as const;

export const CROSS_TENANT_E2E_MIN_KEY_ROUTE_SCENARIOS = 10 as const;

export const CROSS_TENANT_E2E_ARTIFACT =
  "artifacts/cross-tenant-e2e-summary.json" as const;

export const CROSS_TENANT_E2E_BENCHMARK_SCRIPT =
  "scripts/run-cross-tenant-e2e-benchmark.ts" as const;

export const CROSS_TENANT_E2E_UNIT_TEST = "tests/unit/cross-tenant-e2e.test.ts" as const;

export const CROSS_TENANT_E2E_PLAYWRIGHT_SPEC = "e2e/cross-tenant-e2e.spec.ts" as const;

export const CROSS_TENANT_E2E_NPM_SCRIPT = "test:ci:cross-tenant-e2e" as const;

export const CROSS_TENANT_E2E_BENCHMARK_NPM_SCRIPT = "benchmark:cross-tenant-e2e" as const;

export const CROSS_TENANT_E2E_CONTRACT = "lib/qa/cross-tenant-e2e-contract.ts" as const;

/** Key API route families tenant A must not read from tenant B (403/404). */
export const CROSS_TENANT_E2E_KEY_API_ROUTES = [
  { family: "orders", method: "GET", path: "/api/public/v1/orders" },
  { family: "orders", method: "POST", path: "/api/public/v1/orders" },
  { family: "customers", method: "GET", path: "/api/public/v1/customers" },
  { family: "finance", method: "GET", path: "/api/dashboard/audit-logs/export" },
  { family: "marketplace", method: "GET", path: "/api/marketplace/orders/:id/invoice" },
  { family: "inventory", method: "GET", path: "/api/public/v1/inventory" },
  { family: "pos", method: "GET", path: "/api/pos/shifts/export" },
  { family: "kitchen", method: "GET", path: "/api/kitchen/tickets" },
  { family: "analytics", method: "GET", path: "/api/marketplace/analytics/export" },
  { family: "integrations", method: "POST", path: "/api/integrations/shopify/test" },
  { family: "staff", method: "GET", path: "/api/public/v1/staff" },
  { family: "products", method: "GET", path: "/api/public/v1/products" },
  { family: "locations", method: "GET", path: "/api/public/v1/locations" },
] as const;

export const CROSS_TENANT_E2E_WIRING_PATHS = [
  CROSS_TENANT_E2E_CONTRACT,
  CROSS_TENANT_E2E_BENCHMARK_SCRIPT,
  CROSS_TENANT_E2E_UNIT_TEST,
  CROSS_TENANT_E2E_PLAYWRIGHT_SPEC,
  "lib/qa/cross-tenant-api-idor-contract.ts",
  "lib/qa/cross-tenant-isolation-contract.ts",
  "e2e/cross-tenant-api-idor.spec.ts",
] as const;
