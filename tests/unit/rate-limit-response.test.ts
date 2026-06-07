import { describe, expect, it, vi, beforeEach } from "vitest";

const consumeRateLimitToken = vi.hoisted(() => vi.fn());

vi.mock("@/services/security/rate-limit-service", () => ({
  consumeRateLimitToken,
}));

vi.mock("@/lib/rate-limit/client-ip", () => ({
  getClientIpFromRequest: () => "198.51.100.10",
}));

import {
  apiRateLimitExceededResponse,
  enforceApiMutationRateLimitMiddleware,
  enforceApiRateLimitOrNull,
} from "@/lib/api/middleware-api-rate-limit";
import { rateLimitedJsonResponse } from "@/lib/rate-limit";
import {
  auditRateLimitHeaders,
  auditRateLimitJsonBody,
  auditRateLimitResponse,
  limitedEnforceResult,
} from "@/lib/testing/rate-limit-response-harness";
import {
  RATE_LIMIT_EXCEEDED_USER_MESSAGE,
  RATE_LIMIT_RESPONSE_POLICY_ID,
  RATE_LIMIT_SMOKE_MUTATION_PATH,
  RATE_LIMIT_UNAVAILABLE_USER_MESSAGE,
  isRateLimitExceededStatus,
} from "@/lib/testing/rate-limit-response-policy";

describe("rate limit response contract (Task 20)", () => {
  beforeEach(() => {
    consumeRateLimitToken.mockReset();
    consumeRateLimitToken.mockResolvedValue({ ok: true });
  });

  it("locks rate limit response policy", () => {
    expect(RATE_LIMIT_RESPONSE_POLICY_ID).toBe("absolute-final-rate-limit-response-v1");
    expect(isRateLimitExceededStatus(429)).toBe(true);
    expect(isRateLimitExceededStatus(503)).toBe(false);
  });

  it("audit helpers require Retry-After and X-RateLimit-* headers", () => {
    const audit = auditRateLimitHeaders({
      "Retry-After": "4",
      "X-RateLimit-Limit": "120",
      "X-RateLimit-Remaining": "0",
      "X-RateLimit-Reset": "1700000060",
    });
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
  });

  it("audit helpers reject missing Retry-After", () => {
    const audit = auditRateLimitHeaders({
      "X-RateLimit-Limit": "120",
      "X-RateLimit-Remaining": "0",
      "X-RateLimit-Reset": "1700000060",
    });
    expect(audit.ok).toBe(false);
    expect(audit.failures.some((f) => f.includes("Retry-After"))).toBe(true);
  });

  it("audit helpers require user-friendly JSON error message", () => {
    const ok = auditRateLimitJsonBody({ error: RATE_LIMIT_EXCEEDED_USER_MESSAGE });
    expect(ok.ok).toBe(true);
    const bad = auditRateLimitJsonBody({ error: "nope" });
    expect(bad.ok).toBe(false);
  });

  it("apiRateLimitExceededResponse returns 429 with Retry-After and clear message", async () => {
    const response = apiRateLimitExceededResponse(limitedEnforceResult(5_000));
    const audit = await auditRateLimitResponse(response.clone(), RATE_LIMIT_EXCEEDED_USER_MESSAGE);

    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("5");
    const body = await response.json();
    expect(body.error).toBe(RATE_LIMIT_EXCEEDED_USER_MESSAGE);
  });

  it("apiRateLimitExceededResponse returns 503 when backend unavailable", async () => {
    const response = apiRateLimitExceededResponse({
      ...limitedEnforceResult(2_000),
      reason: "backend_unavailable",
    });
    expect(response.status).toBe(503);
    const body = await response.json();
    expect(body.error).toBe(RATE_LIMIT_UNAVAILABLE_USER_MESSAGE);
  });

  it("rateLimitedJsonResponse forwards rate limit headers on 429", () => {
    const headers = limitedEnforceResult(3_000).headers;
    const response = rateLimitedJsonResponse(
      { error: RATE_LIMIT_EXCEEDED_USER_MESSAGE },
      429,
      headers,
    );
    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("3");
    expect(response.headers.get("X-RateLimit-Limit")).toBe("120");
  });

  it("enforceApiRateLimitOrNull returns 429 when bucket is exhausted", async () => {
    consumeRateLimitToken.mockResolvedValueOnce({
      ok: false,
      retryAfterMs: 6_000,
      reason: "limited",
    });

    const response = await enforceApiRateLimitOrNull(
      new Request(`https://example.com${RATE_LIMIT_SMOKE_MUTATION_PATH}`, {
        method: "POST",
      }),
      "mutation:accounting.ocr",
    );

    expect(response).not.toBeNull();
    const audit = await auditRateLimitResponse(response!, RATE_LIMIT_EXCEEDED_USER_MESSAGE);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
  });

  it("enforceApiMutationRateLimitMiddleware returns 429 for POST mutations", async () => {
    consumeRateLimitToken.mockResolvedValueOnce({
      ok: false,
      retryAfterMs: 2_500,
      reason: "limited",
    });

    const { NextRequest } = await import("next/server");
    const request = new NextRequest(`https://example.com${RATE_LIMIT_SMOKE_MUTATION_PATH}`, {
      method: "POST",
    });

    const response = await enforceApiMutationRateLimitMiddleware(request);
    expect(response).not.toBeNull();
    const audit = await auditRateLimitResponse(response!, RATE_LIMIT_EXCEEDED_USER_MESSAGE);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    expect(response!.headers.get("Retry-After")).toBeTruthy();
  });

  it("enforceApiMutationRateLimitMiddleware skips GET requests", async () => {
    const { NextRequest } = await import("next/server");
    const request = new NextRequest(`https://example.com${RATE_LIMIT_SMOKE_MUTATION_PATH}`, {
      method: "GET",
    });
    const response = await enforceApiMutationRateLimitMiddleware(request);
    expect(response).toBeNull();
    expect(consumeRateLimitToken).not.toHaveBeenCalled();
  });
});
