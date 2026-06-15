import { expect, test } from "@playwright/test";

import {
  PUBLIC_API_RATE_LIMIT_E2E_POLICY_ID,
  PUBLIC_API_RATE_LIMIT_ROUTE_CASES,
  PUBLIC_API_RATE_LIMIT_SMOKE_ROUTES,
  PUBLIC_API_V1_BASE_PATH,
  isPublicApiRateLimitExceededStatus,
  policyMaxRequests,
  publicApiKeyBurstMax,
  resolvePublicApiRateLimitPolicy,
} from "@/lib/api-public/public-api-rate-limit-e2e-policy";
import { PUBLIC_API_V1_RESOURCES } from "@/lib/api-public/public-api-v1-registry";

import {
  assertGuardReturnsRateLimitHeaders,
  assertHttpReturnsRateLimitHeaders,
} from "./helpers/public-api-rate-limit-flow";
import {
  seedScopedPublicApiKey,
  skipPublicApiRateLimitHttpIfNoBaseUrl,
  skipPublicApiRateLimitIfNoDb,
} from "./helpers/public-api-rate-limit-ready";

/**
 * Public API rate limit E2E — dual-bucket 429 + X-RateLimit-* headers on public v1 routes.
 *
 * @see lib/api-public/guard.ts
 * @see docs/API_REFERENCE.md
 */

test.describe("public API rate limit policy", () => {
  test("exports route matrix and burst ceiling", () => {
    expect(PUBLIC_API_RATE_LIMIT_E2E_POLICY_ID).toBe("public-api-rate-limit-e2e-v1");
    expect(PUBLIC_API_V1_BASE_PATH).toBe("/api/public/v1");
    expect(PUBLIC_API_RATE_LIMIT_ROUTE_CASES.length).toBeGreaterThanOrEqual(
      PUBLIC_API_V1_RESOURCES.length,
    );
    expect(publicApiKeyBurstMax()).toBe(600);
    expect(isPublicApiRateLimitExceededStatus(429)).toBe(true);
    expect(isPublicApiRateLimitExceededStatus(200)).toBe(false);
  });

  test("maps orders GET/POST to distinct rate limit policies", () => {
    expect(resolvePublicApiRateLimitPolicy("orders", "GET")).toBe("public_api_orders_get");
    expect(resolvePublicApiRateLimitPolicy("orders", "POST")).toBe("public_api_orders_post");
    expect(resolvePublicApiRateLimitPolicy("customers", "GET")).toBe("public_api_customers_get");
    expect(policyMaxRequests("public_api_orders_get")).toBe(120);
  });

  test("every registered public v1 method has a route case", () => {
    for (const resource of PUBLIC_API_V1_RESOURCES) {
      for (const method of resource.methods) {
        const match = PUBLIC_API_RATE_LIMIT_ROUTE_CASES.find(
          (entry) => entry.resourceId === resource.id && entry.method === method,
        );
        expect(match).toBeDefined();
        expect(match?.path).toBe(resource.path);
      }
    }
  });
});

test.describe("public API rate limit guard (database)", () => {
  test.beforeEach(() => {
    skipPublicApiRateLimitIfNoDb();
  });

  test("guard attaches X-RateLimit headers on products GET", async () => {
    const routeCase = PUBLIC_API_RATE_LIMIT_SMOKE_ROUTES.find(
      (entry) => entry.id === "products-get",
    )!;
    const fixture = await seedScopedPublicApiKey("rl-products", ["products:read"]);
    try {
      const outcome = await assertGuardReturnsRateLimitHeaders(routeCase, fixture.rawKey);
      if (outcome === "billing_blocked") {
        test.skip(true, "Enterprise billing gate blocked credential — rate limit headers not reached.");
      }
      if (outcome === "misconfigured") {
        test.skip(true, "Distributed rate limiting misconfigured — guard returned 503.");
      }
    } finally {
      await fixture.cleanup();
    }
  });

  test("guard attaches X-RateLimit headers on orders GET", async () => {
    const routeCase = PUBLIC_API_RATE_LIMIT_SMOKE_ROUTES.find(
      (entry) => entry.id === "orders-get",
    )!;
    const fixture = await seedScopedPublicApiKey("rl-orders", ["orders:read"]);
    try {
      const outcome = await assertGuardReturnsRateLimitHeaders(routeCase, fixture.rawKey);
      if (outcome === "billing_blocked") {
        test.skip(true, "Enterprise billing gate blocked credential — rate limit headers not reached.");
      }
      if (outcome === "misconfigured") {
        test.skip(true, "Distributed rate limiting misconfigured — guard returned 503.");
      }
    } finally {
      await fixture.cleanup();
    }
  });
});

test.describe("public API rate limit HTTP", () => {
  test.beforeEach(() => {
    skipPublicApiRateLimitIfNoDb();
    skipPublicApiRateLimitHttpIfNoBaseUrl();
  });

  test("HTTP GET products returns X-RateLimit headers when authorized", async ({ request }) => {
    const routeCase = PUBLIC_API_RATE_LIMIT_SMOKE_ROUTES.find(
      (entry) => entry.id === "products-get",
    )!;
    const fixture = await seedScopedPublicApiKey("http-rl-products", ["products:read"]);
    try {
      const outcome = await assertHttpReturnsRateLimitHeaders(request, routeCase, fixture.rawKey);
      if (outcome === "billing_blocked") {
        test.skip(true, "Enterprise billing gate blocked credential on HTTP path.");
      }
      if (outcome === "misconfigured") {
        test.skip(true, "Distributed rate limiting misconfigured on HTTP path.");
      }
      if (outcome === "rate_limited") {
        test.skip(true, "Rate limit already exhausted for test key — retry later.");
      }
    } finally {
      await fixture.cleanup();
    }
  });
});
