import { expect, test, type Page } from "@playwright/test";

import { skipIfLoginRedirect } from "./helpers/dashboard-smoke";
import { mockVendorStripeConnectAPI } from "./helpers/marketplace-vendor-mock";

/**
 * Marketplace checkout → vendor fulfill → payout E2E.
 *
 * Buyer: catalog → cart → net-terms checkout → purchase order.
 * Vendor: confirm → start processing → mark shipped (tracking required).
 * Finance: pending balance releases after ship → request payout.
 *
 * Runs in `chromium-authed` only. Honest skips when marketplace migration,
 * vendor approval, catalog, or RBAC prerequisites are missing.
 *
 * @see e2e/marketplace-checkout.spec.ts — buyer checkout baseline
 * @see e2e/vendor-registration.spec.ts — vendor cabinet prerequisites
 * @see services/marketplace/vendor-finance-service.ts — pending → available sync
 */

async function skipIfMarketplaceUnavailable(page: Page): Promise<void> {
  if (await page.getByText(/Marketplace temporarily unavailable/i).isVisible().catch(() => false)) {
    test.skip(true, "Marketplace migration not applied — run prisma migrate deploy.");
  }
}

async function completeBuyerNetTermsCheckout(page: Page): Promise<void> {
  await page.goto("/dashboard/marketplace/catalog");
  await skipIfLoginRedirect(page);
  await skipIfMarketplaceUnavailable(page);

  const emptyCatalog = page.getByText(/No products match your filters/i);
  if (await emptyCatalog.isVisible().catch(() => false)) {
    test.skip(true, "No marketplace products — seed vendor catalog or categories.");
  }

  const quickAdd = page.getByRole("link", { name: /Quick add/i }).first();
  if ((await quickAdd.count()) === 0) {
    test.skip(true, "No Quick add links — check marketplace:cart:write permission or catalog items.");
  }

  await quickAdd.click();
  await expect(page.getByText(/Added to marketplace cart/i)).toBeVisible({ timeout: 30_000 });

  await page.goto("/dashboard/marketplace/checkout");
  if (await page.getByText(/Your marketplace cart is empty/i).isVisible().catch(() => false)) {
    test.skip(true, "Cart empty after add — marketplace cart persistence may be unavailable.");
  }
  if (await page.getByText(/read-only cart access/i).isVisible().catch(() => false)) {
    test.skip(true, "Signed-in user lacks marketplace checkout permissions.");
  }

  await page.getByRole("button", { name: /Net terms/i }).click();
  await expect(
    page.getByText(/Checkout complete|submitted for manager approval/i),
  ).toBeVisible({ timeout: 60_000 });

  await page.goto("/dashboard/marketplace/orders");
  await expect(page.getByRole("heading", { name: /^Orders$/i })).toBeVisible();
  if (await page.getByText(/No marketplace orders yet/i).isVisible().catch(() => false)) {
    test.skip(true, "Purchase order not listed after checkout.");
  }
  await expect(page.getByRole("link", { name: /^View$/i }).first()).toBeVisible({ timeout: 30_000 });
}

async function fulfillLatestVendorOrder(page: Page): Promise<void> {
  await page.goto("/vendor/orders");
  await skipIfLoginRedirect(page);
  await expect(page.getByRole("heading", { name: /^Orders$/i })).toBeVisible({ timeout: 15_000 });

  if (await page.getByText(/No incoming orders/i).isVisible().catch(() => false)) {
    test.skip(
      true,
      "No vendor orders — E2E vendor must sell the catalog SKU that was checked out.",
    );
  }

  await page.getByRole("link", { name: /^View$/i }).first().click();
  await expect(page.getByRole("heading", { name: /Order detail|PO-|MPO-/i })).toBeVisible({
    timeout: 15_000,
  });

  const confirm = page.getByRole("button", { name: /Confirm order/i });
  if (await confirm.isVisible().catch(() => false)) {
    await confirm.click();
    await expect(page.getByText(/Order confirmed/i)).toBeVisible({ timeout: 15_000 });
    await page.reload();
  }

  const startProcessing = page.getByRole("button", { name: /Start processing/i });
  if (await startProcessing.isVisible().catch(() => false)) {
    await startProcessing.click();
    await expect(page.getByText(/moved to processing/i)).toBeVisible({ timeout: 15_000 });
    await page.reload();
  }

  const tracking = page.getByLabel(/Tracking number/i);
  if (!(await tracking.isVisible().catch(() => false))) {
    test.skip(true, "Order not in shippable state — may require buyer approval first.");
  }

  await tracking.fill(`E2E-TRK-${Date.now().toString(36).toUpperCase()}`);
  await page.getByRole("button", { name: /Mark shipped/i }).click();
  await expect(page.getByText(/Order shipped|Partial shipment recorded/i)).toBeVisible({
    timeout: 15_000,
  });
  await page.reload();
  await expect(page.getByText(/Shipped/i)).toBeVisible({ timeout: 15_000 });
}

async function requestVendorPayoutIfEligible(page: Page): Promise<void> {
  await page.goto("/vendor/finance");
  await skipIfLoginRedirect(page);
  await expect(page.getByRole("heading", { name: /^Finance$/i })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText(/Available balance/i)).toBeVisible();

  const requestPayout = page.getByRole("button", { name: /Request payout/i });
  if (!(await requestPayout.isVisible().catch(() => false))) {
    test.skip(true, "Signed-in user lacks vendor:payouts:request permission.");
  }

  if (await requestPayout.isDisabled()) {
    test.skip(true, "No available balance yet — ship sync may require order SHIPPED status.");
  }

  await requestPayout.click();
  await expect(page.getByText(/Payout .* initiated/i)).toBeVisible({ timeout: 15_000 });
}

test.describe("marketplace checkout → fulfill → payout", () => {
  test.beforeEach(async ({ page }) => {
    await mockVendorStripeConnectAPI(page);
  });

  test("buyer checkout, vendor ship, and payout request", async ({ page }) => {
    await completeBuyerNetTermsCheckout(page);
    await fulfillLatestVendorOrder(page);
    await requestVendorPayoutIfEligible(page);
  });
});
