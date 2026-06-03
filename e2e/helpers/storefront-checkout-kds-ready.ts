import type { APIRequestContext } from "@playwright/test";
import { test } from "@playwright/test";

import { defaultStorefrontE2ESlug } from "@/lib/storefront/storefront-checkout-kds-e2e-policy";

export async function ensureStorefrontDevServer(request: APIRequestContext): Promise<void> {
  try {
    const res = await request.get("/api/health", { timeout: 3_000 });
    if (res.ok()) return;
  } catch {
    /* fall through */
  }
  test.skip(true, "Dev server not running — start with: npm run dev:safe");
}

export function skipStorefrontCheckoutIfTurnstileEnabled(): void {
  test.skip(
    Boolean(process.env.TURNSTILE_SECRET_KEY?.trim()),
    "Run with TURNSTILE_SECRET_KEY unset so captcha is a no-op",
  );
}

export function getStorefrontCheckoutKdsAuthedSkipReason(): string | null {
  if (!process.env.E2E_LOGIN_EMAIL?.trim() || !process.env.E2E_LOGIN_PASSWORD?.trim()) {
    return "Storefront→KDS E2E SKIPPED — missing E2E_LOGIN_EMAIL / E2E_LOGIN_PASSWORD";
  }
  return null;
}

export function skipStorefrontCheckoutKdsAuthedIfNotReady(): void {
  const reason = getStorefrontCheckoutKdsAuthedSkipReason();
  if (reason) test.skip(true, reason);
}

export { defaultStorefrontE2ESlug };
