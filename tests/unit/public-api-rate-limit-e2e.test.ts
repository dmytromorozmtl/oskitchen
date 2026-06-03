import { beforeEach, describe, expect, it, vi } from "vitest";

const resolveEnterpriseApiCredential = vi.hoisted(() => vi.fn());
const consumeRateLimitToken = vi.hoisted(() => vi.fn());

vi.mock("@/lib/api-public/resolve-enterprise-api", () => ({
  resolveEnterpriseApiCredential,
}));

vi.mock("@/services/security/rate-limit-service", () => ({
  consumeRateLimitToken,
}));

vi.mock("@/lib/rate-limit/client-ip", () => ({
  getClientIpFromRequest: () => "203.0.113.55",
}));

import {
  PUBLIC_API_RATE_LIMIT_E2E_POLICY_ID,
  PUBLIC_API_RATE_LIMIT_ROUTE_CASES,
  PUBLIC_API_RATE_LIMIT_SMOKE_ROUTES,
  hasPublicApiRateLimitHeaders,
  isPublicApiRateLimitExceededStatus,
  policyMaxRequests,
  publicApiKeyBurstMax,
  resolvePublicApiRateLimitPolicy,
} from "@/lib/api-public/public-api-rate-limit-e2e-policy";
import { guardPublicApiV1Resource, isGuardError } from "@/lib/api-public/guard";

describe("public API rate limit E2E policy (QA-27)", () => {
  it("exports policy id, route cases, and burst ceiling", () => {
    expect(PUBLIC_API_RATE_LIMIT_E2E_POLICY_ID).toBe("public-api-rate-limit-e2e-v1");
    expect(PUBLIC_API_RATE_LIMIT_ROUTE_CASES.length).toBeGreaterThanOrEqual(10);
    expect(PUBLIC_API_RATE_LIMIT_SMOKE_ROUTES.length).toBe(4);
    expect(publicApiKeyBurstMax()).toBe(600);
    expect(isPublicApiRateLimitExceededStatus(429)).toBe(true);
  });

  it("resolves distinct policies for orders read vs write", () => {
    expect(resolvePublicApiRateLimitPolicy("orders", "GET")).toBe("public_api_orders_get");
    expect(resolvePublicApiRateLimitPolicy("orders", "POST")).toBe("public_api_orders_post");
    expect(policyMaxRequests("public_api_customers_get")).toBe(60);
  });

  it("recognizes rate limit header shape", () => {
    expect(
      hasPublicApiRateLimitHeaders({
        "X-RateLimit-Limit": "120",
        "X-RateLimit-Remaining": "119",
        "X-RateLimit-Reset": "1710000000",
      }),
    ).toBe(true);
    expect(hasPublicApiRateLimitHeaders({ "X-RateLimit-Limit": "120" })).toBe(false);
  });
});

describe("public API rate limit guard 429 (QA-27)", () => {
  beforeEach(() => {
    resolveEnterpriseApiCredential.mockReset();
    consumeRateLimitToken.mockReset();
    resolveEnterpriseApiCredential.mockResolvedValue({
      userId: "owner-1",
      scopes: ["products:read"],
    });
  });

  it("returns 429 with Retry-After when key burst bucket is exhausted", async () => {
    consumeRateLimitToken.mockResolvedValueOnce({
      ok: false,
      retryAfterMs: 4000,
      reason: "limited",
    });

    const routeCase = PUBLIC_API_RATE_LIMIT_SMOKE_ROUTES.find(
      (entry) => entry.id === "products-get",
    )!;

    const result = await guardPublicApiV1Resource(
      new Request(`https://example.com${routeCase.path}`, {
        headers: { Authorization: "Bearer kos_e2e_rate_limit_test_key" },
      }),
      routeCase.resourceId,
      routeCase.method,
      routeCase.routeKey,
    );

    expect(isGuardError(result)).toBe(true);
    if (!isGuardError(result)) throw new Error("expected guard error");
    expect(result.response.status).toBe(429);
    expect(result.response.headers.get("Retry-After")).toBeTruthy();
    expect(consumeRateLimitToken.mock.calls[0]?.[1]).toBe("public_api_key_burst");
  });

  it("returns 429 when route policy bucket is exhausted after burst passes", async () => {
    resolveEnterpriseApiCredential.mockResolvedValue({
      userId: "owner-1",
      scopes: ["orders:read"],
    });
    consumeRateLimitToken
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({
        ok: false,
        retryAfterMs: 3000,
        reason: "limited",
      });

    const routeCase = PUBLIC_API_RATE_LIMIT_SMOKE_ROUTES.find(
      (entry) => entry.id === "orders-get",
    )!;

    const result = await guardPublicApiV1Resource(
      new Request(`https://example.com${routeCase.path}`, {
        headers: { Authorization: "Bearer kos_e2e_rate_limit_test_key" },
      }),
      routeCase.resourceId,
      routeCase.method,
      routeCase.routeKey,
    );

    expect(isGuardError(result)).toBe(true);
    if (!isGuardError(result)) throw new Error("expected guard error");
    expect(result.response.status).toBe(429);
    expect(consumeRateLimitToken).toHaveBeenCalledTimes(2);
    expect(consumeRateLimitToken.mock.calls[1]?.[1]).toBe("public_api_orders_get");
  });
});
