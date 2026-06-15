import { test } from "@playwright/test";

/**
 * Cross-channel inventory **live** sync staging prerequisites.
 *
 * Engine + mock UI tests in `cross-channel-inventory-live-sync.spec.ts` always run.
 * Staging pull proofs skip until vault auth + optional channel connection id exist.
 *
 * @see docs/cross-channel-inventory-sales-one-pager.md
 * @see docs/vault-one-pager.md
 */

export const CROSS_CHANNEL_INVENTORY_LIVE_REQUIRED_ENV = [
  "DATABASE_URL",
  "E2E_STAGING_BASE_URL",
  "E2E_LOGIN_EMAIL",
  "E2E_LOGIN_PASSWORD",
] as const;

export function resolveCrossChannelInventoryLiveBaseUrl(): string | null {
  return (
    process.env.E2E_STAGING_BASE_URL?.trim() ||
    process.env.PLAYWRIGHT_BASE_URL?.trim() ||
    null
  );
}

export function getCrossChannelInventoryLiveMissingEnv(): string[] {
  const missing: string[] = [];
  if (!process.env.DATABASE_URL?.trim()) missing.push("DATABASE_URL");
  if (!resolveCrossChannelInventoryLiveBaseUrl()) missing.push("E2E_STAGING_BASE_URL");
  if (!process.env.E2E_LOGIN_EMAIL?.trim()) missing.push("E2E_LOGIN_EMAIL");
  if (!process.env.E2E_LOGIN_PASSWORD?.trim()) missing.push("E2E_LOGIN_PASSWORD");
  return missing;
}

export function getCrossChannelInventoryLiveSkipReason(): string | null {
  const missing = getCrossChannelInventoryLiveMissingEnv();
  if (missing.length === 0) return null;
  return `Cross-channel inventory live sync SKIPPED — missing vault env: ${missing.join(", ")}`;
}

export function isCrossChannelInventoryLiveReady(): boolean {
  return getCrossChannelInventoryLiveMissingEnv().length === 0;
}

export function skipCrossChannelInventoryLiveIfNotReady(): void {
  const reason = getCrossChannelInventoryLiveSkipReason();
  if (reason) test.skip(true, reason);
}
