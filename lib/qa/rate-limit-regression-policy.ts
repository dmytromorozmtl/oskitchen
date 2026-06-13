/**
 * Blueprint P1-18 — Rate-limit regression (POST/PUT/DELETE → N+1 requests → 429).
 *
 * @see lib/qa/rate-limit-regression-scoring.ts
 * @see tests/unit/rate-limit-regression.test.ts
 */

export const RATE_LIMIT_REGRESSION_POLICY_ID = "rate-limit-regression-p1-18-v1" as const;

export const RATE_LIMIT_REGRESSION_MUTATION_METHODS = ["POST", "PUT", "DELETE"] as const;

export type RateLimitRegressionMutationMethod =
  (typeof RATE_LIMIT_REGRESSION_MUTATION_METHODS)[number];

/** Simulated bucket max for fast CI regression (production api_mutation max is 120). */
export const RATE_LIMIT_REGRESSION_SIMULATED_MAX = 5 as const;

/** Burst size — strictly greater than simulated max (N+1). */
export const RATE_LIMIT_REGRESSION_BURST_COUNT = 6 as const;

export const RATE_LIMIT_REGRESSION_ARTIFACT =
  "artifacts/rate-limit-regression-summary.json" as const;

export const RATE_LIMIT_REGRESSION_SCRIPT =
  "scripts/run-rate-limit-regression-benchmark.ts" as const;

export const RATE_LIMIT_REGRESSION_UNIT_TEST =
  "tests/unit/rate-limit-regression.test.ts" as const;

export const RATE_LIMIT_REGRESSION_NPM_SCRIPT = "test:ci:rate-limit-regression" as const;

export const RATE_LIMIT_REGRESSION_RUN_NPM_SCRIPT = "benchmark:rate-limit-regression" as const;

export const RATE_LIMIT_REGRESSION_CI_WORKFLOW = ".github/workflows/ci.yml" as const;

/** Priority mutation routes from P0-7 — webhooks, POS, orders. */
export const RATE_LIMIT_REGRESSION_MUTATION_TARGETS = [
  {
    id: "pos-terminal-post",
    method: "POST" as const,
    pathname: "/api/pos/terminal",
    kind: "middleware" as const,
  },
  {
    id: "pos-offline-sync-post",
    method: "POST" as const,
    pathname: "/api/pos/offline-card/sync",
    kind: "middleware" as const,
  },
  {
    id: "webhook-shopify-orders-post",
    method: "POST" as const,
    pathname: "/api/webhooks/shopify/orders-create",
    kind: "webhook" as const,
  },
  {
    id: "webhook-doordash-orders-post",
    method: "POST" as const,
    pathname: "/api/webhooks/doordash/orders",
    kind: "webhook" as const,
  },
  {
    id: "orders-public-v1-post",
    method: "POST" as const,
    pathname: "/api/public/v1/orders",
    kind: "exempt_dedicated" as const,
  },
  {
    id: "integrations-uber-eats-menu-put",
    method: "PUT" as const,
    pathname: "/api/integrations/uber-eats/menu",
    kind: "middleware" as const,
  },
  {
    id: "scim-user-delete",
    method: "DELETE" as const,
    pathname: "/api/scim/v2/Users/usr_regression_test",
    kind: "middleware" as const,
  },
] as const;

export type RateLimitRegressionTarget =
  (typeof RATE_LIMIT_REGRESSION_MUTATION_TARGETS)[number];

export function isRateLimitRegression429(status: number): boolean {
  return status === 429;
}
