import { test } from "@playwright/test";

import { hasPosShiftCheckoutReceiptCredentials } from "@/lib/pos/pos-shift-checkout-receipt-e2e-policy";

export function skipPosShiftCheckoutReceiptIfNotAuthed(): void {
  if (!hasPosShiftCheckoutReceiptCredentials()) {
    test.skip(
      true,
      "POS shift → checkout → receipt E2E SKIPPED — missing E2E_LOGIN_EMAIL / E2E_LOGIN_PASSWORD",
    );
  }
}
