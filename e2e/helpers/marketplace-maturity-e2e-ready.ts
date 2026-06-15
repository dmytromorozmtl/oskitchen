import { test } from "@playwright/test";

import { hasMarketplaceMaturityE2ECredentials } from "@/lib/marketplace/marketplace-maturity-e2e-policy";

export function skipMarketplaceMaturityE2EIfNotAuthed(): void {
  if (!hasMarketplaceMaturityE2ECredentials()) {
    test.skip(
      true,
      "Marketplace maturity E2E SKIPPED — missing E2E_LOGIN_EMAIL / E2E_LOGIN_PASSWORD",
    );
  }
}
