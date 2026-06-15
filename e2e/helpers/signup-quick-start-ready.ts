import { test } from "@playwright/test";

/**
 * Staging prerequisites for full signup → quick start → today browser proof.
 * Engine + authed quick-start paths run without these vars.
 */
export function getSignupQuickStartSkipReason(): string | null {
  if (process.env.E2E_SIGNUP_AUTO_CONFIRM?.trim() !== "true") {
    return "Full signup E2E SKIPPED — set E2E_SIGNUP_AUTO_CONFIRM=true on staging with auto-confirm enabled";
  }
  if (!process.env.DATABASE_URL?.trim()) {
    return "Full signup E2E SKIPPED — DATABASE_URL required for fresh workspace bootstrap proof";
  }
  return null;
}

export function skipSignupQuickStartIfNotReady(): void {
  const reason = getSignupQuickStartSkipReason();
  if (reason) test.skip(true, reason);
}

export function uniqueSignupEmail(prefix = "e2e-signup"): string {
  return `${prefix}-${Date.now().toString(36)}@e2e.kitchenos.test`;
}
