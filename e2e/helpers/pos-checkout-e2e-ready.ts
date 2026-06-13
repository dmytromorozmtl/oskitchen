import { test } from "@playwright/test";

import {
  hasPosCheckoutE2ECredentials,
  isPosCheckoutE2EEnabled,
} from "@/lib/pos/pos-checkout-e2e-policy";

export function skipPosCheckoutE2EIfNotAuthed(): void {
  if (!hasPosCheckoutE2ECredentials()) {
    test.skip(
      true,
      "POS checkout E2E SKIPPED — missing E2E_LOGIN_EMAIL / E2E_LOGIN_PASSWORD",
    );
  }
}

export function skipPosCheckoutE2EIfGateDisabled(): void {
  if (!isPosCheckoutE2EEnabled()) {
    test.skip(true, "POS checkout E2E SKIPPED — set E2E_POS_CHECKOUT=true");
  }
}

export function skipPosCheckoutE2EIfNoDb(): void {
  if (!process.env.DATABASE_URL?.trim()) {
    test.skip(true, "POS checkout E2E SKIPPED — DATABASE_URL required for refund/void probes");
  }
}
