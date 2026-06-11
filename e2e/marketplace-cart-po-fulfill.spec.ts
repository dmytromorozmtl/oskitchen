import { expect, test } from "@playwright/test";

import {
  MARKETPLACE_CART_PATH,
  MARKETPLACE_CART_PO_FULFILL_E2E_POLICY_ID,
  MARKETPLACE_CART_PO_FULFILL_FLOW_STEPS,
  MARKETPLACE_PO_CHECKOUT_PATH,
  MARKETPLACE_PO_ORDERS_PATH,
  isMarketplaceFulfillmentTerminalStatus,
  vendorOrderPath,
} from "@/lib/marketplace/marketplace-cart-po-fulfill-e2e-policy";
import { vendorOrderFanoutCount } from "@/lib/marketplace/marketplace-catalog-checkout-vendor-order-e2e-policy";
import { splitByVendor } from "@/services/marketplace/checkout-service";

import { runMarketplaceCartPoFulfillFlow } from "./helpers/marketplace-cart-po-fulfill-flow";
import { skipMarketplaceCartPoFulfillIfNotAuthed } from "./helpers/marketplace-cart-po-fulfill-ready";
import { mockVendorStripeConnectAPI } from "./helpers/marketplace-vendor-mock";

/**
 * Marketplace cart → PO → fulfill golden path.
 *
 * Catalog quick add → net-terms checkout → buyer PO → vendor ship.
 *
 * @see e2e/marketplace-catalog-checkout-vendor-order.spec.ts
 * @see e2e/marketplace-checkout-fulfill-payout.spec.ts
 */

test.describe("marketplace cart po fulfill policy", () => {
  test("exports marketplace money path routes and flow steps", () => {
    expect(MARKETPLACE_CART_PO_FULFILL_E2E_POLICY_ID).toBe(
      "marketplace-cart-po-fulfill-e2e-v1",
    );
    expect(MARKETPLACE_CART_PATH).toBe("/dashboard/marketplace/catalog");
    expect(MARKETPLACE_PO_CHECKOUT_PATH).toBe("/dashboard/marketplace/checkout");
    expect(MARKETPLACE_PO_ORDERS_PATH).toBe("/dashboard/marketplace/orders");
    expect(vendorOrderPath("ord-1")).toBe("/vendor/orders/ord-1");
    expect(MARKETPLACE_CART_PO_FULFILL_FLOW_STEPS).toEqual([
      "cart_add",
      "checkout_po",
      "buyer_po",
      "vendor_fulfill",
    ]);
  });

  test("single-vendor checkout fans out one PO", () => {
    const groups = splitByVendor([
      {
        productId: "p1",
        slug: "gloves",
        name: "Gloves",
        sku: "GL-1",
        vendorId: "v1",
        vendorName: "Vendor A",
        quantity: 1,
        unitPrice: 12,
        currency: "USD",
      },
    ]);
    expect(vendorOrderFanoutCount(groups.length)).toBe(1);
  });

  test("SHIPPED is a terminal fulfillment status", () => {
    expect(isMarketplaceFulfillmentTerminalStatus("SHIPPED")).toBe(true);
    expect(isMarketplaceFulfillmentTerminalStatus("SUBMITTED")).toBe(false);
  });
});

test.describe("marketplace cart po fulfill (chromium-authed)", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium-authed",
      "Marketplace cart → PO → fulfill runs in chromium-authed project only",
    );
    skipMarketplaceCartPoFulfillIfNotAuthed();
    await mockVendorStripeConnectAPI(page);
  });

  test("catalog cart checkout creates PO and vendor marks shipped", async ({ page }) => {
    const result = await runMarketplaceCartPoFulfillFlow(page);
    expect(result.steps).toEqual(MARKETPLACE_CART_PO_FULFILL_FLOW_STEPS);
    expect(result.orderId.length).toBeGreaterThan(0);
  });
});
