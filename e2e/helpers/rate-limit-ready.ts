import { test } from "@playwright/test";

import {
  hasRateLimitE2ECredentials,
  hasRateLimitHttpBaseUrl,
  isRateLimitE2EEnabled,
} from "@/lib/qa/rate-limit-e2e-policy";

export {
  seedScopedPublicApiKey,
} from "./public-api-key-scope-ready";

export function skipRateLimitIfGateDisabled(): void {
  if (!isRateLimitE2EEnabled()) {
    test.skip(true, "Rate limit E2E SKIPPED — set E2E_RATE_LIMIT=true");
  }
}

export function skipRateLimitIfNoDb(): void {
  if (!hasRateLimitE2ECredentials()) {
    test.skip(true, "Rate limit E2E SKIPPED — missing DATABASE_URL");
  }
}

export function skipRateLimitHttpIfNoBaseUrl(): void {
  if (!hasRateLimitHttpBaseUrl()) {
    test.skip(true, "Rate limit HTTP burst SKIPPED — set PLAYWRIGHT_BASE_URL or E2E_BASE_URL");
  }
}

export function resolveRateLimitHttpBaseUrl(): string {
  return (
    process.env.PLAYWRIGHT_BASE_URL?.trim() ||
    process.env.E2E_BASE_URL?.trim() ||
    process.env.SMOKE_BASE_URL?.trim() ||
    ""
  );
}
