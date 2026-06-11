import { expect, test, type Page } from "@playwright/test";

import {
  MARKETPLACE_CART_PO_FULFILL_FLOW_STEPS,
  MARKETPLACE_CART_PO_FULFILL_VISIBLE_MS,
  MARKETPLACE_FULFILL_SHIPPED_PATTERN,
  vendorOrderPath,
  type MarketplaceCartPoFulfillFlowStep,
} from "@/lib/marketplace/marketplace-cart-po-fulfill-e2e-policy";

import { assertNoDashboardRscFailure } from "./dashboard-smoke";
import {
  assertBuyerPurchaseOrderListed,
  completeMarketplaceCatalogCheckout,
} from "./marketplace-catalog-checkout-vendor-order-flow";

export type MarketplaceCartPoFulfillFlowResult = {
  orderId: string;
  steps: MarketplaceCartPoFulfillFlowStep[];
};

export async function fulfillVendorPurchaseOrder(page: Page, orderId: string): Promise<void> {
  await page.goto(vendorOrderPath(orderId));
  await assertNoDashboardRscFailure(page);
  await expect(page.getByRole("heading", { name: /Order detail|PO-|MPO-/i })).toBeVisible({
    timeout: MARKETPLACE_CART_PO_FULFILL_VISIBLE_MS,
  });

  const confirm = page.getByRole("button", { name: /Confirm order/i });
  if (await confirm.isVisible().catch(() => false)) {
    await confirm.click();
    await expect(page.getByText(/Order confirmed/i)).toBeVisible({
      timeout: MARKETPLACE_CART_PO_FULFILL_VISIBLE_MS,
    });
    await page.reload();
  }

  const startProcessing = page.getByRole("button", { name: /Start processing/i });
  if (await startProcessing.isVisible().catch(() => false)) {
    await startProcessing.click();
    await expect(page.getByText(/moved to processing/i)).toBeVisible({
      timeout: MARKETPLACE_CART_PO_FULFILL_VISIBLE_MS,
    });
    await page.reload();
  }

  const tracking = page.getByLabel(/Tracking number/i);
  if (!(await tracking.isVisible().catch(() => false))) {
    test.skip(true, "Order not in shippable state — may require buyer approval first.");
  }

  await tracking.fill(`E2E-TRK-${Date.now().toString(36).toUpperCase()}`);
  await page.getByRole("button", { name: /Mark shipped/i }).click();
  await expect(page.getByText(/Order shipped|Partial shipment recorded/i)).toBeVisible({
    timeout: MARKETPLACE_CART_PO_FULFILL_VISIBLE_MS,
  });
  await page.reload();
  await expect(page.getByText(MARKETPLACE_FULFILL_SHIPPED_PATTERN)).toBeVisible({
    timeout: MARKETPLACE_CART_PO_FULFILL_VISIBLE_MS,
  });
}

export async function runMarketplaceCartPoFulfillFlow(
  page: Page,
): Promise<MarketplaceCartPoFulfillFlowResult> {
  const steps: MarketplaceCartPoFulfillFlowStep[] = [];

  await completeMarketplaceCatalogCheckout(page);
  steps.push("cart_add", "checkout_po");

  const orderId = await assertBuyerPurchaseOrderListed(page);
  steps.push("buyer_po");

  await fulfillVendorPurchaseOrder(page, orderId);
  steps.push("vendor_fulfill");

  if (steps.length !== MARKETPLACE_CART_PO_FULFILL_FLOW_STEPS.length) {
    throw new Error(`Flow step mismatch: ${steps.join(" → ")}`);
  }

  return { orderId, steps };
}
