/**
 * Absolute Final Task 20 — rate limit HTTP response contract.
 */

export const RATE_LIMIT_RESPONSE_POLICY_ID = "absolute-final-rate-limit-response-v1" as const;

/** User-facing copy when dashboard/API mutation bucket is exhausted. */
export const RATE_LIMIT_EXCEEDED_USER_MESSAGE =
  "Too many requests. Please slow down." as const;

export const RATE_LIMIT_UNAVAILABLE_USER_MESSAGE =
  "Rate limiting is temporarily unavailable." as const;

export const RATE_LIMIT_REQUIRED_HEADERS = [
  "Retry-After",
  "X-RateLimit-Limit",
  "X-RateLimit-Remaining",
  "X-RateLimit-Reset",
] as const;

export const RATE_LIMIT_RESPONSE_UNIT_TESTS = [
  "tests/unit/rate-limit-response.test.ts",
  "tests/unit/rate-limit-facade.test.ts",
  "tests/unit/api-mutation-rate-limit.test.ts",
] as const;

export const RATE_LIMIT_RESPONSE_CI_SCRIPTS = ["test:ci:rate-limit"] as const;

export const RATE_LIMIT_RESPONSE_HARNESS_MODULE =
  "lib/testing/rate-limit-response-harness.ts" as const;

/** Representative dashboard mutation route for middleware smoke tests. */
export const RATE_LIMIT_SMOKE_MUTATION_PATH = "/api/accounting/ocr" as const;

export function isRateLimitExceededStatus(status: number): boolean {
  return status === 429;
}
