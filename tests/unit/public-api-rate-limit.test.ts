import { describe, expect, it, vi } from "vitest";

const consumeRateLimitToken = vi.hoisted(() => vi.fn());

vi.mock("@/services/security/rate-limit-service", () => ({
  consumeRateLimitToken,
}));

vi.mock("@/lib/rate-limit/client-ip", () => ({
  getClientIpFromRequest: () => "203.0.113.10",
}));

import {
  PUBLIC_API_RATE_LIMIT_DOC,
  enforcePublicApiRateLimits,
  fingerprintPublicApiBearer,
} from "@/lib/api-public/public-api-rate-limit";

describe("public API rate limit", () => {
  it("fingerprints bearer tokens without exposing raw secrets", () => {
    const a = fingerprintPublicApiBearer("Bearer kos_live_abc123");
    const b = fingerprintPublicApiBearer("Bearer kos_live_abc123");
    const c = fingerprintPublicApiBearer("Bearer kos_live_other");
    expect(a).toHaveLength(24);
    expect(a).toBe(b);
    expect(a).not.toBe(c);
    expect(fingerprintPublicApiBearer(null)).toBe("anonymous");
  });

  it("enforces per-key burst before route policy", async () => {
    consumeRateLimitToken.mockReset();
    consumeRateLimitToken
      .mockResolvedValueOnce({ ok: false, retryAfterMs: 5000, reason: "limited" });

    const request = new Request("https://example.com/api/public/v1/products", {
      headers: { Authorization: "Bearer kos_live_test" },
    });

    const result = await enforcePublicApiRateLimits({
      request,
      routeKey: "public_api_products_get",
      userId: "owner-1",
      policyKey: "public_api_v1_get",
    });

    expect(result.ok).toBe(false);
    expect(consumeRateLimitToken).toHaveBeenCalledTimes(1);
    expect(consumeRateLimitToken.mock.calls[0]?.[0]).toContain("public_api:key:");
    expect(consumeRateLimitToken.mock.calls[0]?.[1]).toBe("public_api_key_burst");
  });

  it("applies route policy when key burst passes", async () => {
    consumeRateLimitToken.mockReset();
    consumeRateLimitToken.mockResolvedValue({ ok: true });

    const request = new Request("https://example.com/api/public/v1/orders", {
      headers: { Authorization: "Bearer kos_live_test" },
    });

    const result = await enforcePublicApiRateLimits({
      request,
      routeKey: "public_api_orders_get",
      userId: "owner-1",
      policyKey: "public_api_orders_get",
    });

    expect(result.ok).toBe(true);
    expect(consumeRateLimitToken).toHaveBeenCalledTimes(2);
    expect(consumeRateLimitToken.mock.calls[1]?.[0]).toContain("api:public_api_orders_get:");
    expect(result.headers["X-RateLimit-Limit"]).toBeDefined();
  });

  it("documents rate limit policies for partners", () => {
    expect(PUBLIC_API_RATE_LIMIT_DOC.burstMax).toBe(600);
    expect(PUBLIC_API_RATE_LIMIT_DOC.headers).toContain("Retry-After");
  });
});
