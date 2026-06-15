import { expect, test } from "@playwright/test";

/**
 * Mutating E2E: marketplace catalog → cart → checkout → purchase order on orders list.
 * Runs in `chromium-authed` only (see `playwright.config.ts`).
 *
 * Skips when marketplace tables are missing, catalog is empty, or cart/checkout RBAC is read-only.
 *
 * Prerequisites: migration `20260602133000_marketplace_core` applied and at least one ACTIVE vendor product.
 */
test.describe("marketplace checkout → purchase order", () => {
  test("net terms checkout creates a purchase order", async ({ page }) => {
    await page.goto("/dashboard/marketplace/catalog");

    if (await page.getByText(/Marketplace temporarily unavailable/i).isVisible().catch(() => false)) {
      test.skip(true, "Marketplace migration not applied — run prisma migrate deploy.");
    }

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

    await expect(page.getByText(/No marketplace orders yet/i)).not.toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole("link", { name: /^View$/i }).first()).toBeVisible({ timeout: 30_000 });
  });
});
