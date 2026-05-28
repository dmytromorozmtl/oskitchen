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
  getClientIpFromRequest: () => "127.0.0.1",
}));

import {
  guardPublicApi,
  guardPublicApiV1Resource,
  isGuardError,
} from "@/lib/api-public/guard";

describe("public API scope guard", () => {
  beforeEach(() => {
    resolveEnterpriseApiCredential.mockReset();
    consumeRateLimitToken.mockReset();
    consumeRateLimitToken.mockResolvedValue({ ok: true });
  });

  it("returns 403 when required scope is missing from API key", async () => {
    resolveEnterpriseApiCredential.mockResolvedValue({
      userId: "owner-1",
      scopes: ["orders:read", "products:read"],
    });

    const result = await guardPublicApi(
      new Request("https://example.com/api/public/v1/orders", { method: "POST" }),
      "public_api_orders_post",
      "public_api_orders_post",
      "orders:write",
    );

    expect(isGuardError(result)).toBe(true);
    if (!isGuardError(result)) throw new Error("expected guard error");
    expect(result.response.status).toBe(403);
    const body = await result.response.json();
    expect(body.requiredScope).toBe("orders:write");
    expect(consumeRateLimitToken).not.toHaveBeenCalled();
  });

  it("allows request when scope is granted", async () => {
    resolveEnterpriseApiCredential.mockResolvedValue({
      userId: "owner-1",
      scopes: ["orders:write"],
    });

    const result = await guardPublicApi(
      new Request("https://example.com/api/public/v1/orders", { method: "POST" }),
      "public_api_orders_post",
      "public_api_orders_post",
      "orders:write",
    );

    expect(result).toEqual({ userId: "owner-1" });
    expect(consumeRateLimitToken).toHaveBeenCalled();
  });

  it("guardPublicApiV1Resource enforces orders write on POST orders", async () => {
    resolveEnterpriseApiCredential.mockResolvedValue({
      userId: "owner-1",
      scopes: ["integrations:read"],
    });

    const result = await guardPublicApiV1Resource(
      new Request("https://example.com/api/public/v1/orders", { method: "POST" }),
      "orders",
      "POST",
      "public_api_orders_post",
    );

    expect(isGuardError(result)).toBe(true);
    if (!isGuardError(result)) throw new Error("expected guard error");
    expect(result.response.status).toBe(403);
  });

  it("returns 401 when credential is missing", async () => {
    resolveEnterpriseApiCredential.mockResolvedValue(null);

    const result = await guardPublicApi(
      new Request("https://example.com/api/public/v1/products"),
      "public_api_products_get",
    );

    expect(isGuardError(result)).toBe(true);
    if (!isGuardError(result)) throw new Error("expected guard error");
    expect(result.response.status).toBe(401);
  });
});
