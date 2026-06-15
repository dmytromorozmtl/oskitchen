import { expect, test } from "@playwright/test";

import {
  MARKETPLACE_BUYER_ORDERS_PATH,
  MARKETPLACE_CATALOG_CHECKOUT_VENDOR_ORDER_E2E_POLICY_ID,
  MARKETPLACE_CATALOG_PATH,
  MARKETPLACE_CHECKOUT_PATH,
  VENDOR_ORDERS_PATH,
  vendorOrderPath,
} from "@/lib/marketplace/marketplace-catalog-checkout-vendor-order-e2e-policy";

import { mockVendorStripeConnectAPI } from "./helpers/marketplace-vendor-mock";
import {
  assertBuyerPurchaseOrderListed,
  assertVendorIncomingOrder,
  completeMarketplaceCatalogCheckout,
} from "./helpers/marketplace-catalog-checkout-vendor-order-flow";
import { skipMarketplaceCatalogCheckoutVendorOrderIfNotAuthed } from "./helpers/marketplace-catalog-checkout-vendor-order-ready";

/**
 * Marketplace catalog → checkout → vendor order E2E.
 *
 * Buyer net-terms checkout creates a purchase order visible to buyer and vendor cabinet.
 *
 * @see e2e/marketplace-checkout.spec.ts — buyer-only baseline
 * @see e2e/marketplace-checkout-fulfill-payout.spec.ts — fulfill + payout extension
 */

test.describe("marketplace catalog checkout vendor order policy", () => {
  test("exports route and label contract", () => {
    expect(MARKETPLACE_CATALOG_CHECKOUT_VENDOR_ORDER_E2E_POLICY_ID).toBe(
      "marketplace-catalog-checkout-vendor-order-e2e-v1",
    );
    expect(MARKETPLACE_CATALOG_PATH).toBe("/dashboard/marketplace/catalog");
    expect(MARKETPLACE_CHECKOUT_PATH).toBe("/dashboard/marketplace/checkout");
    expect(MARKETPLACE_BUYER_ORDERS_PATH).toBe("/dashboard/marketplace/orders");
    expect(VENDOR_ORDERS_PATH).toBe("/vendor/orders");
    expect(vendorOrderPath("ord-1")).toBe("/vendor/orders/ord-1");
  });
});

test.describe("marketplace catalog checkout vendor order (chromium-authed)", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium-authed",
      "Marketplace catalog→vendor order runs in chromium-authed project only",
    );
    skipMarketplaceCatalogCheckoutVendorOrderIfNotAuthed();
    await mockVendorStripeConnectAPI(page);
  });

  test("catalog checkout creates buyer PO and vendor incoming order", async ({ page }) => {
    await completeMarketplaceCatalogCheckout(page);
    const orderId = await assertBuyerPurchaseOrderListed(page);
    await assertVendorIncomingOrder(page, orderId);
  });
});
