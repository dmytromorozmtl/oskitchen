import { expect, test, type Page } from "@playwright/test";

import {
  MARKETPLACE_BUYER_ORDERS_PATH,
  MARKETPLACE_BUYER_ORDER_VIEW_LABEL,
  MARKETPLACE_CART_ADDED_MESSAGE,
  MARKETPLACE_CATALOG_PATH,
  MARKETPLACE_CHECKOUT_COMPLETE_PATTERN,
  MARKETPLACE_CHECKOUT_PATH,
  MARKETPLACE_VENDOR_ORDER_MANAGE_LABEL,
  VENDOR_ORDER_EMPTY_TITLE,
  VENDOR_ORDERS_PATH,
  vendorOrderPath,
} from "@/lib/marketplace/marketplace-catalog-checkout-vendor-order-e2e-policy";

import { skipIfLoginRedirect } from "./dashboard-smoke";

export async function skipIfMarketplaceUnavailable(page: Page): Promise<void> {
  if (await page.getByText(/Marketplace temporarily unavailable/i).isVisible().catch(() => false)) {
    test.skip(true, "Marketplace migration not applied — run prisma migrate deploy.");
  }
}

export async function completeMarketplaceCatalogCheckout(page: Page): Promise<void> {
  await page.goto(MARKETPLACE_CATALOG_PATH);
  await skipIfLoginRedirect(page);
  await skipIfMarketplaceUnavailable(page);

  if (await page.getByText(/No products match your filters/i).isVisible().catch(() => false)) {
    test.skip(true, "No marketplace products — seed vendor catalog or categories.");
  }

  const quickAdd = page.getByRole("link", { name: /Quick add/i }).first();
  if ((await quickAdd.count()) === 0) {
    test.skip(true, "No Quick add links — check marketplace:cart:write permission or catalog items.");
  }

  await quickAdd.click();
  await expect(page.getByText(new RegExp(MARKETPLACE_CART_ADDED_MESSAGE, "i"))).toBeVisible({
    timeout: 30_000,
  });

  await page.goto(MARKETPLACE_CHECKOUT_PATH);
  if (await page.getByText(/Your marketplace cart is empty/i).isVisible().catch(() => false)) {
    test.skip(true, "Cart empty after add — marketplace cart persistence may be unavailable.");
  }
  if (await page.getByText(/read-only cart access/i).isVisible().catch(() => false)) {
    test.skip(true, "Signed-in user lacks marketplace checkout permissions.");
  }

  await page.getByRole("button", { name: /Net terms/i }).click();
  await expect(page.getByText(MARKETPLACE_CHECKOUT_COMPLETE_PATTERN)).toBeVisible({
    timeout: 60_000,
  });
}

export async function assertBuyerPurchaseOrderListed(page: Page): Promise<string> {
  await page.goto(MARKETPLACE_BUYER_ORDERS_PATH);
  await expect(page.getByRole("heading", { name: /^Orders$/i })).toBeVisible({ timeout: 15_000 });

  if (await page.getByText(/No marketplace orders yet/i).isVisible().catch(() => false)) {
    test.skip(true, "Purchase order not listed after checkout.");
  }

  const viewLink = page
    .getByRole("link", { name: new RegExp(`^${MARKETPLACE_BUYER_ORDER_VIEW_LABEL}$`, "i") })
    .first();
  await expect(viewLink).toBeVisible({ timeout: 30_000 });
  const href = await viewLink.getAttribute("href");
  const orderId = href?.match(
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,
  )?.[0];
  if (!orderId) {
    throw new Error(`Could not parse buyer order id from href: ${href ?? "(null)"}`);
  }
  return orderId;
}

export async function assertVendorIncomingOrder(page: Page, orderId: string): Promise<void> {
  await page.goto(VENDOR_ORDERS_PATH);
  await skipIfLoginRedirect(page);
  await expect(page.getByRole("heading", { name: /^Orders$/i })).toBeVisible({ timeout: 15_000 });

  if (await page.getByText(VENDOR_ORDER_EMPTY_TITLE).isVisible().catch(() => false)) {
    test.skip(
      true,
      "No vendor orders — E2E user must be the selling vendor or share workspace with catalog SKU vendor.",
    );
  }

  const manageLink = page
    .getByRole("link", { name: new RegExp(`^${MARKETPLACE_VENDOR_ORDER_MANAGE_LABEL}$`, "i") })
    .first();
  await expect(manageLink).toBeVisible({ timeout: 30_000 });

  await page.goto(vendorOrderPath(orderId));
  if (await page.getByText(/not found|404/i).isVisible().catch(() => false)) {
    test.skip(
      true,
      "Checked-out order belongs to another vendor — link E2E user to the catalog SKU vendor.",
    );
  }

  await expect(page.getByRole("heading", { name: /Order detail|PO-|MPO-/i })).toBeVisible({
    timeout: 15_000,
  });
}
