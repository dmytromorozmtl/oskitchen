import { test } from "@playwright/test";

/**
 * Cross-tenant staging E2E prerequisites — mirrors vault Phase 1 + DATABASE_URL.
 *
 * Mock contract tests in `cross-tenant-isolation-staging.spec.ts` always run.
 * Live staging HTTP proofs skip with reason until vault 11/11 env is present.
 *
 * @see docs/vault-one-pager.md
 * @see docs/pen-test-plan.md PT-01, PT-07
 */

export const CROSS_TENANT_STAGING_REQUIRED_ENV = [
  "DATABASE_URL",
  "E2E_STAGING_BASE_URL",
  "E2E_LOGIN_EMAIL",
  "E2E_LOGIN_PASSWORD",
] as const;

export function resolveCrossTenantStagingBaseUrl(): string | null {
  return (
    process.env.E2E_STAGING_BASE_URL?.trim() ||
    process.env.PLAYWRIGHT_BASE_URL?.trim() ||
    null
  );
}

export function getCrossTenantStagingMissingEnv(): string[] {
  const missing: string[] = [];
  if (!process.env.DATABASE_URL?.trim()) missing.push("DATABASE_URL");
  if (!resolveCrossTenantStagingBaseUrl()) missing.push("E2E_STAGING_BASE_URL");
  if (!process.env.E2E_LOGIN_EMAIL?.trim()) missing.push("E2E_LOGIN_EMAIL");
  if (!process.env.E2E_LOGIN_PASSWORD?.trim()) missing.push("E2E_LOGIN_PASSWORD");
  return missing;
}

export function getCrossTenantStagingSkipReason(): string | null {
  const missing = getCrossTenantStagingMissingEnv();
  if (missing.length === 0) return null;
  return `Cross-tenant staging E2E SKIPPED — missing vault env: ${missing.join(", ")} (see docs/vault-one-pager.md)`;
}

export function isCrossTenantStagingReady(): boolean {
  return getCrossTenantStagingMissingEnv().length === 0;
}

export function skipCrossTenantStagingIfNotReady(): void {
  const reason = getCrossTenantStagingSkipReason();
  if (reason) test.skip(true, reason);
}
