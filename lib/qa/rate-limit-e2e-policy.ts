/**
 * Blueprint P1-53 — Rate limit E2E (101+ requests → 429).
 *
 * @see e2e/rate-limit.spec.ts
 * @see lib/api-public/public-api-rate-limit-e2e-policy.ts
 * @see scripts/smoke-remediation.ts
 */

export {
  PUBLIC_API_RATE_LIMIT_EXCEEDED_STATUS,
  PUBLIC_API_RATE_LIMIT_TOO_MANY_MESSAGE,
  PUBLIC_API_V1_BASE_PATH,
  policyMaxRequests,
  resolvePublicApiRateLimitPolicy,
  type PublicApiRateLimitRouteCase,
} from "@/lib/api-public/public-api-rate-limit-e2e-policy";

export const RATE_LIMIT_E2E_POLICY_ID = "rate-limit-e2e-v1" as const;

/** Minimum burst size per blueprint — prove limiter under sustained load. */
export const RATE_LIMIT_E2E_BURST_MIN_REQUESTS = 101 as const;

/** Route policy used for burst — orders GET (120/min per route bucket). */
export const RATE_LIMIT_E2E_BURST_ROUTE_ID = "orders-get" as const;
export const RATE_LIMIT_E2E_BURST_POLICY_KEY = "public_api_orders_get" as const;
export const RATE_LIMIT_E2E_BURST_ROUTE_PATH = "/api/public/v1/orders" as const;

/** Requests to send — strictly greater than min (101) and route max (120). */
export const RATE_LIMIT_E2E_BURST_TARGET_COUNT = 121 as const;

export const RATE_LIMIT_E2E_E2E_SPEC = "e2e/rate-limit.spec.ts" as const;
export const RATE_LIMIT_E2E_FLOW_HELPER = "e2e/helpers/rate-limit-flow.ts" as const;
export const RATE_LIMIT_E2E_READY_HELPER = "e2e/helpers/rate-limit-ready.ts" as const;
export const RATE_LIMIT_E2E_AUDIT_SCRIPT = "scripts/audit-rate-limit-e2e.ts" as const;
export const RATE_LIMIT_E2E_NPM_SCRIPT = "audit:rate-limit-e2e" as const;
export const RATE_LIMIT_E2E_UNIT_TEST = "tests/unit/rate-limit-e2e.test.ts" as const;
export const RATE_LIMIT_E2E_CI_WORKFLOW = ".github/workflows/deploy-prod-gate.yml" as const;

export const RATE_LIMIT_E2E_FLOW_STEPS = [
  "seed_api_key",
  "burst_requests",
  "assert_429_response",
] as const;

export type RateLimitE2EFlowStep = (typeof RATE_LIMIT_E2E_FLOW_STEPS)[number];

export function isRateLimit429Status(status: number): boolean {
  return status === 429;
}

export function resolveRateLimitBurstTargetCount(policyMax: number): number {
  return Math.max(RATE_LIMIT_E2E_BURST_MIN_REQUESTS + 1, policyMax + 1);
}

export function hasRateLimitE2ECredentials(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

export function isRateLimitE2EEnabled(): boolean {
  return process.env.E2E_RATE_LIMIT?.trim() === "true";
}

export function hasRateLimitHttpBaseUrl(): boolean {
  return Boolean(
    process.env.PLAYWRIGHT_BASE_URL?.trim() ||
      process.env.E2E_BASE_URL?.trim() ||
      process.env.SMOKE_BASE_URL?.trim(),
  );
}
