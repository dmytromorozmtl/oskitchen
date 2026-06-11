import { expect, test } from "@playwright/test";

import {
  PUBLIC_API_RATE_LIMIT_EXCEEDED_STATUS,
  policyMaxRequests,
  resolvePublicApiRateLimitPolicy,
} from "@/lib/api-public/public-api-rate-limit-e2e-policy";
import {
  RATE_LIMIT_E2E_BURST_MIN_REQUESTS,
  RATE_LIMIT_E2E_BURST_POLICY_KEY,
  RATE_LIMIT_E2E_BURST_ROUTE_ID,
  RATE_LIMIT_E2E_BURST_TARGET_COUNT,
  RATE_LIMIT_E2E_POLICY_ID,
  RATE_LIMIT_E2E_FLOW_STEPS,
  resolveRateLimitBurstTargetCount,
} from "@/lib/qa/rate-limit-e2e-policy";

import {
  resolveRateLimitBurstRouteCase,
  runRateLimitBurstFlow,
} from "./helpers/rate-limit-flow";
import {
  resolveRateLimitHttpBaseUrl,
  seedScopedPublicApiKey,
  skipRateLimitHttpIfNoBaseUrl,
  skipRateLimitIfGateDisabled,
  skipRateLimitIfNoDb,
} from "./helpers/rate-limit-ready";

/**
 * Rate limit E2E — 101+ requests → 429 with Retry-After + X-RateLimit-* headers.
 *
 * @see e2e/public-api-rate-limit.spec.ts
 * @see scripts/smoke-remediation.ts
 */

test.describe("rate limit policy", () => {
  test("exports burst thresholds and orders GET route case", () => {
    expect(RATE_LIMIT_E2E_POLICY_ID).toBe("rate-limit-e2e-v1");
    expect(RATE_LIMIT_E2E_BURST_MIN_REQUESTS).toBe(101);
    expect(RATE_LIMIT_E2E_BURST_ROUTE_ID).toBe("orders-get");
    expect(RATE_LIMIT_E2E_BURST_POLICY_KEY).toBe("public_api_orders_get");
    expect(RATE_LIMIT_E2E_FLOW_STEPS).toEqual([
      "seed_api_key",
      "burst_requests",
      "assert_429_response",
    ]);

    const routeCase = resolveRateLimitBurstRouteCase();
    expect(routeCase.id).toBe("orders-get");
    expect(resolvePublicApiRateLimitPolicy("orders", "GET")).toBe(
      RATE_LIMIT_E2E_BURST_POLICY_KEY,
    );
    expect(policyMaxRequests(RATE_LIMIT_E2E_BURST_POLICY_KEY)).toBe(120);
    expect(RATE_LIMIT_E2E_BURST_TARGET_COUNT).toBe(
      resolveRateLimitBurstTargetCount(120),
    );
    expect(PUBLIC_API_RATE_LIMIT_EXCEEDED_STATUS).toBe(429);
  });
});

test.describe("rate limit guard burst (database)", () => {
  test.beforeEach(() => {
    skipRateLimitIfGateDisabled();
    skipRateLimitIfNoDb();
  });

  test("101+ guard requests return 429 on orders GET bucket", async () => {
    const fixture = await seedScopedPublicApiKey(`rl-burst-${Date.now()}`, ["orders:read"]);
    try {
      const result = await runRateLimitBurstFlow(fixture.rawKey);
      expect(result.steps).toEqual(RATE_LIMIT_E2E_FLOW_STEPS);
      expect(result.requestCount).toBeGreaterThanOrEqual(RATE_LIMIT_E2E_BURST_MIN_REQUESTS);
      expect(result.limitedAt).toBeGreaterThan(0);
    } finally {
      await fixture.cleanup();
    }
  });
});

test.describe("rate limit HTTP burst", () => {
  test.beforeEach(() => {
    skipRateLimitIfGateDisabled();
    skipRateLimitIfNoDb();
    skipRateLimitHttpIfNoBaseUrl();
  });

  test("101+ HTTP requests return 429 on orders GET", async ({ request }) => {
    const fixture = await seedScopedPublicApiKey(`http-rl-burst-${Date.now()}`, ["orders:read"]);
    const baseUrl = resolveRateLimitHttpBaseUrl();
    try {
      const result = await runRateLimitBurstFlow(fixture.rawKey, request, baseUrl);
      expect(result.steps).toEqual(RATE_LIMIT_E2E_FLOW_STEPS);
      expect(result.requestCount).toBeGreaterThanOrEqual(RATE_LIMIT_E2E_BURST_MIN_REQUESTS);
    } finally {
      await fixture.cleanup();
    }
  });
});
