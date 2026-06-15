import { expect, type APIRequestContext } from "@playwright/test";

import {
  PUBLIC_API_RATE_LIMIT_EXCEEDED_STATUS,
  PUBLIC_API_RATE_LIMIT_MISCONFIGURED_STATUS,
  PUBLIC_API_RATE_LIMIT_TOO_MANY_MESSAGE,
  PUBLIC_API_RATE_LIMIT_UNAUTHORIZED_STATUS,
  hasPublicApiRateLimitHeaders,
  type PublicApiRateLimitRouteCase,
} from "@/lib/api-public/public-api-rate-limit-e2e-policy";
import { guardPublicApiV1Resource, isGuardError } from "@/lib/api-public/guard";

function authRequest(path: string, method: "GET" | "POST", bearerRawKey: string): Request {
  return new Request(`https://example.com${path}`, {
    method,
    headers: { Authorization: `Bearer ${bearerRawKey}` },
  });
}

export async function assertGuardReturnsRateLimitHeaders(
  routeCase: PublicApiRateLimitRouteCase,
  bearerRawKey: string,
): Promise<"headers" | "billing_blocked" | "misconfigured"> {
  const result = await guardPublicApiV1Resource(
    authRequest(routeCase.path, routeCase.method, bearerRawKey),
    routeCase.resourceId,
    routeCase.method,
    routeCase.routeKey,
  );

  if (isGuardError(result) && result.response.status === PUBLIC_API_RATE_LIMIT_UNAUTHORIZED_STATUS) {
    return "billing_blocked";
  }

  if (
    isGuardError(result) &&
    result.response.status === PUBLIC_API_RATE_LIMIT_MISCONFIGURED_STATUS
  ) {
    return "misconfigured";
  }

  expect(isGuardError(result)).toBe(false);
  if (isGuardError(result)) {
    throw new Error(
      `expected rate-limit headers for ${routeCase.id}, got ${result.response.status}`,
    );
  }

  expect(hasPublicApiRateLimitHeaders(result.rateLimitHeaders)).toBe(true);
  expect(Number(result.rateLimitHeaders["X-RateLimit-Limit"])).toBeGreaterThan(0);
  return "headers";
}

export async function assertGuardReturns429WhenLimited(
  routeCase: PublicApiRateLimitRouteCase,
  bearerRawKey: string,
): Promise<void> {
  const result = await guardPublicApiV1Resource(
    authRequest(routeCase.path, routeCase.method, bearerRawKey),
    routeCase.resourceId,
    routeCase.method,
    routeCase.routeKey,
  );

  expect(isGuardError(result)).toBe(true);
  if (!isGuardError(result)) {
    throw new Error(`expected 429 for ${routeCase.id}`);
  }

  expect(result.response.status).toBe(PUBLIC_API_RATE_LIMIT_EXCEEDED_STATUS);
  const body = (await result.response.json()) as { error?: string };
  expect(body.error).toBe(PUBLIC_API_RATE_LIMIT_TOO_MANY_MESSAGE);
  expect(result.response.headers.get("Retry-After")).toBeTruthy();
}

export async function assertHttpReturnsRateLimitHeaders(
  request: APIRequestContext,
  routeCase: PublicApiRateLimitRouteCase,
  bearerRawKey: string,
): Promise<"headers" | "billing_blocked" | "misconfigured" | "rate_limited"> {
  const response = await request.get(routeCase.path, {
    headers: { Authorization: `Bearer ${bearerRawKey}` },
  });

  if (response.status() === PUBLIC_API_RATE_LIMIT_UNAUTHORIZED_STATUS) {
    return "billing_blocked";
  }

  if (response.status() === PUBLIC_API_RATE_LIMIT_MISCONFIGURED_STATUS) {
    return "misconfigured";
  }

  if (response.status() === PUBLIC_API_RATE_LIMIT_EXCEEDED_STATUS) {
    return "rate_limited";
  }

  expect(response.status()).not.toBe(PUBLIC_API_RATE_LIMIT_EXCEEDED_STATUS);
  expect(response.headers()["x-ratelimit-limit"]).toBeTruthy();
  expect(response.headers()["x-ratelimit-remaining"]).toBeTruthy();
  return "headers";
}
