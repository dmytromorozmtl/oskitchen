import { expect, test } from "@playwright/test";

import {
  MARKETPLACE_MATURITY_E2E_FLOW_STEPS,
  MARKETPLACE_MATURITY_E2E_POLICY_ID,
  MARKETPLACE_VENDOR_FINANCE_PATH,
  isMarketplacePayoutEligible,
} from "@/lib/marketplace/marketplace-maturity-e2e-policy";

import { runMarketplaceMaturityE2EFlow } from "./helpers/marketplace-maturity-e2e-flow";
import { skipMarketplaceMaturityE2EIfNotAuthed } from "./helpers/marketplace-maturity-e2e-ready";
import { mockVendorStripeConnectAPI } from "./helpers/marketplace-vendor-mock";

/**
 * Marketplace maturity E2E — buyer → cart → PO → fulfill → payout.
 *
 * Buyer: catalog → cart → net-terms checkout → purchase order.
 * Vendor: confirm → start processing → mark shipped (tracking required).
 * Finance: pending balance releases after ship → request payout.
 *
 * Runs in `chromium-authed` only. Honest skips when marketplace migration,
 * vendor approval, catalog, or RBAC prerequisites are missing.
 *
 * @see e2e/marketplace-cart-po-fulfill.spec.ts — cart → PO → fulfill baseline
 * @see services/marketplace/vendor-finance-service.ts — pending → available sync
 */

test.describe("marketplace maturity e2e policy", () => {
  test("exports maturity flow routes and five steps", () => {
    expect(MARKETPLACE_MATURITY_E2E_POLICY_ID).toBe("marketplace-maturity-e2e-v1");
    expect(MARKETPLACE_VENDOR_FINANCE_PATH).toBe("/vendor/finance");
    expect(MARKETPLACE_MATURITY_E2E_FLOW_STEPS).toEqual([
      "cart_add",
      "checkout_po",
      "buyer_po",
      "vendor_fulfill",
      "vendor_payout",
    ]);
  });

  test("payout eligibility requires positive balance", () => {
    expect(isMarketplacePayoutEligible(12.5)).toBe(true);
    expect(isMarketplacePayoutEligible(0)).toBe(false);
  });
});

test.describe("marketplace checkout → fulfill → payout (chromium-authed)", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium-authed",
      "Marketplace maturity E2E runs in chromium-authed project only",
    );
    skipMarketplaceMaturityE2EIfNotAuthed();
    await mockVendorStripeConnectAPI(page);
  });

  test("buyer checkout, vendor ship, and payout request", async ({ page }) => {
    const result = await runMarketplaceMaturityE2EFlow(page);
    expect(result.steps).toEqual(MARKETPLACE_MATURITY_E2E_FLOW_STEPS);
    expect(result.orderId.length).toBeGreaterThan(0);
  });
});
