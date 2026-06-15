import { test } from "@playwright/test";

/**
 * Stripe Terminal **staging** E2E prerequisites — vault auth + optional live Stripe secret.
 *
 * Mock + engine tests in `stripe-terminal-staging.spec.ts` always run.
 * Live connection-token proofs skip until vault env and `STRIPE_SECRET_KEY` are present.
 *
 * @see docs/stripe-terminal-hardware-test-plan.md
 * @see docs/vault-one-pager.md
 */

export const STRIPE_TERMINAL_STAGING_REQUIRED_ENV = [
  "DATABASE_URL",
  "E2E_STAGING_BASE_URL",
  "E2E_LOGIN_EMAIL",
  "E2E_LOGIN_PASSWORD",
] as const;

export const STRIPE_TERMINAL_LIVE_REQUIRED_ENV = ["STRIPE_SECRET_KEY"] as const;

export function resolveStripeTerminalStagingBaseUrl(): string | null {
  return (
    process.env.E2E_STAGING_BASE_URL?.trim() ||
    process.env.PLAYWRIGHT_BASE_URL?.trim() ||
    null
  );
}

export function getStripeTerminalStagingMissingEnv(): string[] {
  const missing: string[] = [];
  if (!process.env.DATABASE_URL?.trim()) missing.push("DATABASE_URL");
  if (!resolveStripeTerminalStagingBaseUrl()) missing.push("E2E_STAGING_BASE_URL");
  if (!process.env.E2E_LOGIN_EMAIL?.trim()) missing.push("E2E_LOGIN_EMAIL");
  if (!process.env.E2E_LOGIN_PASSWORD?.trim()) missing.push("E2E_LOGIN_PASSWORD");
  return missing;
}

export function getStripeTerminalLiveMissingEnv(): string[] {
  const missing = getStripeTerminalStagingMissingEnv();
  if (!process.env.STRIPE_SECRET_KEY?.trim()) missing.push("STRIPE_SECRET_KEY");
  return missing;
}

export function getStripeTerminalStagingSkipReason(): string | null {
  const missing = getStripeTerminalStagingMissingEnv();
  if (missing.length === 0) return null;
  return `Stripe Terminal staging E2E SKIPPED — missing vault env: ${missing.join(", ")}`;
}

export function getStripeTerminalLiveSkipReason(): string | null {
  const missing = getStripeTerminalLiveMissingEnv();
  if (missing.length === 0) return null;
  return `Stripe Terminal live token probe SKIPPED — missing: ${missing.join(", ")}`;
}

export function isStripeTerminalStagingReady(): boolean {
  return getStripeTerminalStagingMissingEnv().length === 0;
}

export function isStripeTerminalLiveReady(): boolean {
  return getStripeTerminalLiveMissingEnv().length === 0;
}

export function skipStripeTerminalStagingIfNotReady(): void {
  const reason = getStripeTerminalStagingSkipReason();
  if (reason) test.skip(true, reason);
}

export function skipStripeTerminalLiveIfNotReady(): void {
  const reason = getStripeTerminalLiveSkipReason();
  if (reason) test.skip(true, reason);
}
