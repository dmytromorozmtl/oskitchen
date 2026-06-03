/**
 * Public API rate limit E2E policy (QA-27).
 *
 * Dual-bucket enforcement: per-key burst (600/min) + per-route user+IP windows.
 *
 * @see e2e/public-api-rate-limit.spec.ts
 * @see lib/api-public/public-api-rate-limit.ts
 * @see docs/API_REFERENCE.md
 */

import type { RateLimitPolicyKey } from "@/lib/rate-limit/rate-limit-policies";
import { RATE_LIMIT_POLICIES } from "@/lib/rate-limit/rate-limit-policies";

import {
  PUBLIC_API_V1_RESOURCES,
  type PublicApiV1HttpMethod,
  type PublicApiV1ResourceId,
} from "@/lib/api-public/public-api-v1-registry";

export const PUBLIC_API_RATE_LIMIT_E2E_POLICY_ID = "public-api-rate-limit-e2e-v1" as const;

export const PUBLIC_API_V1_BASE_PATH = "/api/public/v1" as const;

export const PUBLIC_API_RATE_LIMIT_EXCEEDED_STATUS = 429 as const;
export const PUBLIC_API_RATE_LIMIT_MISCONFIGURED_STATUS = 503 as const;
export const PUBLIC_API_RATE_LIMIT_UNAUTHORIZED_STATUS = 401 as const;

export const PUBLIC_API_RATE_LIMIT_TOO_MANY_MESSAGE = "Too many requests. Please slow down." as const;

export const PUBLIC_API_RATE_LIMIT_RESPONSE_HEADERS = [
  "X-RateLimit-Limit",
  "X-RateLimit-Remaining",
  "X-RateLimit-Reset",
  "Retry-After",
] as const;

export type PublicApiRateLimitRouteCase = {
  id: string;
  resourceId: PublicApiV1ResourceId;
  method: PublicApiV1HttpMethod;
  path: string;
  routeKey: string;
  policyKey: RateLimitPolicyKey;
};

function routeKeyFor(resourceId: PublicApiV1ResourceId, method: PublicApiV1HttpMethod): string {
  return `public_api_${resourceId}_${method.toLowerCase()}`;
}

export function resolvePublicApiRateLimitPolicy(
  resourceId: PublicApiV1ResourceId,
  method: PublicApiV1HttpMethod,
): RateLimitPolicyKey {
  const resource = PUBLIC_API_V1_RESOURCES.find((entry) => entry.id === resourceId);
  if (!resource) throw new Error(`Unknown public API resource: ${resourceId}`);
  if (method === "POST") {
    return resource.postRateLimitPolicy ?? "public_api_v1_post";
  }
  return resource.rateLimitPolicy;
}

export const PUBLIC_API_RATE_LIMIT_ROUTE_CASES: readonly PublicApiRateLimitRouteCase[] =
  PUBLIC_API_V1_RESOURCES.flatMap((resource) =>
    resource.methods.map((method) => ({
      id: `${resource.id}-${method.toLowerCase()}`,
      resourceId: resource.id,
      method,
      path: resource.path,
      routeKey: routeKeyFor(resource.id, method),
      policyKey: resolvePublicApiRateLimitPolicy(resource.id, method),
    })),
  );

/** Smoke subset — one GET per distinct policy bucket for guard/header proofs. */
export const PUBLIC_API_RATE_LIMIT_SMOKE_ROUTES = [
  PUBLIC_API_RATE_LIMIT_ROUTE_CASES.find((entry) => entry.id === "products-get")!,
  PUBLIC_API_RATE_LIMIT_ROUTE_CASES.find((entry) => entry.id === "orders-get")!,
  PUBLIC_API_RATE_LIMIT_ROUTE_CASES.find((entry) => entry.id === "customers-get")!,
  PUBLIC_API_RATE_LIMIT_ROUTE_CASES.find((entry) => entry.id === "orders-post")!,
] as const;

export function isPublicApiRateLimitExceededStatus(status: number): boolean {
  return status === PUBLIC_API_RATE_LIMIT_EXCEEDED_STATUS;
}

export function policyMaxRequests(policyKey: RateLimitPolicyKey): number {
  return RATE_LIMIT_POLICIES[policyKey].max;
}

export function policyWindowMs(policyKey: RateLimitPolicyKey): number {
  return RATE_LIMIT_POLICIES[policyKey].windowMs;
}

export function publicApiKeyBurstMax(): number {
  return RATE_LIMIT_POLICIES.public_api_key_burst.max;
}

export function hasPublicApiRateLimitHeaders(
  headers: Record<string, string>,
): boolean {
  return (
    typeof headers["X-RateLimit-Limit"] === "string" &&
    typeof headers["X-RateLimit-Remaining"] === "string" &&
    typeof headers["X-RateLimit-Reset"] === "string"
  );
}
