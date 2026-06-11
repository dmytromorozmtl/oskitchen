import { expect, type APIRequestContext } from "@playwright/test";

import { guardPublicApiV1Resource, isGuardError } from "@/lib/api-public/guard";
import {
  PUBLIC_API_RATE_LIMIT_EXCEEDED_STATUS,
  PUBLIC_API_RATE_LIMIT_ROUTE_CASES,
  PUBLIC_API_RATE_LIMIT_TOO_MANY_MESSAGE,
  type PublicApiRateLimitRouteCase,
} from "@/lib/api-public/public-api-rate-limit-e2e-policy";
import { auditRateLimitResponse } from "@/lib/testing/rate-limit-response-harness";
import {
  RATE_LIMIT_E2E_BURST_MIN_REQUESTS,
  RATE_LIMIT_E2E_BURST_ROUTE_ID,
  RATE_LIMIT_E2E_BURST_TARGET_COUNT,
  RATE_LIMIT_E2E_FLOW_STEPS,
  isRateLimit429Status,
  type RateLimitE2EFlowStep,
} from "@/lib/qa/rate-limit-e2e-policy";

export type RateLimitBurstResult = {
  requestCount: number;
  limitedAt: number;
  steps: RateLimitE2EFlowStep[];
};

function authRequest(path: string, method: "GET" | "POST", bearerRawKey: string): Request {
  return new Request(`https://example.com${path}`, {
    method,
    headers: { Authorization: `Bearer ${bearerRawKey}` },
  });
}

export function resolveRateLimitBurstRouteCase(): PublicApiRateLimitRouteCase {
  const routeCase = PUBLIC_API_RATE_LIMIT_ROUTE_CASES.find(
    (entry) => entry.id === RATE_LIMIT_E2E_BURST_ROUTE_ID,
  );
  if (!routeCase) {
    throw new Error(`Missing rate limit burst route case: ${RATE_LIMIT_E2E_BURST_ROUTE_ID}`);
  }
  return routeCase;
}

export async function assertRateLimit429GuardResponse(
  routeCase: PublicApiRateLimitRouteCase,
  bearerRawKey: string,
): Promise<number> {
  const result = await guardPublicApiV1Resource(
    authRequest(routeCase.path, routeCase.method, bearerRawKey),
    routeCase.resourceId,
    routeCase.method,
    routeCase.routeKey,
  );

  expect(isGuardError(result)).toBe(true);
  if (!isGuardError(result)) {
    throw new Error(`Expected 429 guard error for ${routeCase.id}`);
  }

  expect(result.response.status).toBe(PUBLIC_API_RATE_LIMIT_EXCEEDED_STATUS);
  const audit = await auditRateLimitResponse(
    result.response,
    PUBLIC_API_RATE_LIMIT_TOO_MANY_MESSAGE,
  );
  expect(audit.ok, audit.failures.join("; ")).toBe(true);

  return result.response.status;
}

export async function burstGuardUntil429(
  routeCase: PublicApiRateLimitRouteCase,
  bearerRawKey: string,
  maxRequests = RATE_LIMIT_E2E_BURST_TARGET_COUNT,
): Promise<{ requestCount: number; limitedAt: number }> {
  let limitedAt = 0;

  for (let requestCount = 1; requestCount <= maxRequests; requestCount += 1) {
    const result = await guardPublicApiV1Resource(
      authRequest(routeCase.path, routeCase.method, bearerRawKey),
      routeCase.resourceId,
      routeCase.method,
      routeCase.routeKey,
    );

    if (isGuardError(result) && isRateLimit429Status(result.response.status)) {
      limitedAt = requestCount;
      const audit = await auditRateLimitResponse(
        result.response,
        PUBLIC_API_RATE_LIMIT_TOO_MANY_MESSAGE,
      );
      expect(audit.ok, audit.failures.join("; ")).toBe(true);
      return { requestCount, limitedAt };
    }

    expect(isGuardError(result)).toBe(false);
  }

  throw new Error(
    `No 429 after ${maxRequests} requests (min required ${RATE_LIMIT_E2E_BURST_MIN_REQUESTS})`,
  );
}

export async function burstHttpUntil429(
  request: APIRequestContext,
  routeCase: PublicApiRateLimitRouteCase,
  bearerRawKey: string,
  baseUrl: string,
  maxRequests = RATE_LIMIT_E2E_BURST_TARGET_COUNT,
): Promise<{ requestCount: number; limitedAt: number }> {
  let limitedAt = 0;

  for (let requestCount = 1; requestCount <= maxRequests; requestCount += 1) {
    const response = await request.fetch(`${baseUrl}${routeCase.path}`, {
      method: routeCase.method,
      headers: { Authorization: `Bearer ${bearerRawKey}` },
    });

    if (isRateLimit429Status(response.status())) {
      limitedAt = requestCount;
      const audit = await auditRateLimitResponse(
        response,
        PUBLIC_API_RATE_LIMIT_TOO_MANY_MESSAGE,
      );
      expect(audit.ok, audit.failures.join("; ")).toBe(true);
      return { requestCount, limitedAt };
    }

    expect(response.status()).not.toBe(PUBLIC_API_RATE_LIMIT_EXCEEDED_STATUS);
  }

  throw new Error(
    `No HTTP 429 after ${maxRequests} requests (min required ${RATE_LIMIT_E2E_BURST_MIN_REQUESTS})`,
  );
}

export async function runRateLimitBurstFlow(
  bearerRawKey: string,
  request?: APIRequestContext,
  baseUrl?: string,
): Promise<RateLimitBurstResult> {
  const steps: RateLimitE2EFlowStep[] = ["seed_api_key"];
  const routeCase = resolveRateLimitBurstRouteCase();

  let burst: { requestCount: number; limitedAt: number };
  if (request && baseUrl) {
    burst = await burstHttpUntil429(request, routeCase, bearerRawKey, baseUrl);
  } else {
    burst = await burstGuardUntil429(routeCase, bearerRawKey);
  }

  steps.push("burst_requests");
  expect(burst.requestCount).toBeGreaterThanOrEqual(RATE_LIMIT_E2E_BURST_MIN_REQUESTS);
  expect(burst.limitedAt).toBeGreaterThan(0);
  steps.push("assert_429_response");

  if (steps.length !== RATE_LIMIT_E2E_FLOW_STEPS.length) {
    throw new Error(`Flow step mismatch: ${steps.join(" → ")}`);
  }

  return {
    requestCount: burst.requestCount,
    limitedAt: burst.limitedAt,
    steps,
  };
}
