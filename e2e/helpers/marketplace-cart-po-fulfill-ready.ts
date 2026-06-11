import { test } from "@playwright/test";

import { hasMarketplaceCartPoFulfillCredentials } from "@/lib/marketplace/marketplace-cart-po-fulfill-e2e-policy";

export function skipMarketplaceCartPoFulfillIfNotAuthed(): void {
  if (!hasMarketplaceCartPoFulfillCredentials()) {
    test.skip(
      true,
      "Marketplace cart → PO → fulfill E2E SKIPPED — missing E2E_LOGIN_EMAIL / E2E_LOGIN_PASSWORD",
    );
  }
}
