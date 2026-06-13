import { test } from "@playwright/test";

import {
  hasLoyaltyEarnRedeemE2ECredentials,
  isLoyaltyEarnRedeemE2EEnabled,
} from "@/lib/loyalty/loyalty-earn-redeem-e2e-policy";

export function skipLoyaltyEarnRedeemE2EIfNotAuthed(): void {
  if (!hasLoyaltyEarnRedeemE2ECredentials()) {
    test.skip(
      true,
      "Loyalty earn/redeem E2E SKIPPED — missing E2E_LOGIN_EMAIL / E2E_LOGIN_PASSWORD",
    );
  }
}

export function skipLoyaltyEarnRedeemE2EIfGateDisabled(): void {
  if (!isLoyaltyEarnRedeemE2EEnabled()) {
    test.skip(true, "Loyalty earn/redeem E2E SKIPPED — set E2E_LOYALTY_EARN_REDEEM=true");
  }
}

export function skipLoyaltyEarnRedeemE2EIfNoDb(): void {
  if (!process.env.DATABASE_URL?.trim()) {
    test.skip(true, "Loyalty earn/redeem E2E SKIPPED — DATABASE_URL required for balance probes");
  }
}
