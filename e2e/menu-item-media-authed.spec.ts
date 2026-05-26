import { expect, test } from "@playwright/test";

/**
 * Phase 4 — menu item image from media library → dashboard + optional public product page.
 */
test.describe("Menu item media (authed)", () => {
  test.beforeEach(() => {
    test.skip(
      !process.env.E2E_LOGIN_EMAIL?.trim(),
      "Set E2E_LOGIN_EMAIL and E2E_LOGIN_PASSWORD",
    );
  });

  test("table quick-pick or edit dialog sets product image", async ({ page, request }) => {
    await page.goto("/dashboard/products");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 60_000 });

    await page.getByRole("button", { name: "Table", exact: true }).click();

    const pickBtn = page.getByRole("button", { name: /^pick$/i }).first();
    const hasLibrary = (await pickBtn.count()) > 0;

    if (hasLibrary) {
      await pickBtn.click();
      await page.getByText(/pick from media library/i).waitFor();
      await page
        .locator('[role="dialog"] button')
        .filter({ has: page.locator("img") })
        .first()
        .click();
      await expect(page.getByText(/image updated/i)).toBeVisible({ timeout: 20_000 });
      await expect(
        page.locator("table tbody tr").first().locator("img[src^='http']"),
      ).toBeVisible({ timeout: 15_000 });
    } else {
      const editBtn = page.getByRole("button", { name: /^edit$/i }).first();
      test.skip((await editBtn.count()) === 0, "No products to edit");
      await editBtn.click();
      const testUrl = "https://placehold.co/400x300/png?text=KitchenOS-E2E";
      await page.getByLabel(/storefront image/i).fill(testUrl);
      await page.getByRole("button", { name: /save changes/i }).click();
      await expect(page.getByText(/item updated|added/i)).toBeVisible({ timeout: 20_000 });
    }

    const slug = process.env.E2E_STORE_SLUG?.trim();
    const productRef = process.env.E2E_PRODUCT_REF?.trim();
    if (slug && productRef) {
      const res = await request.get(`/s/${slug}/products/${encodeURIComponent(productRef)}`);
      if (res.ok()) {
        await page.goto(`/s/${slug}/products/${encodeURIComponent(productRef)}`);
        await expect(page.locator("main img[src^='http']").first()).toBeVisible({ timeout: 30_000 });
      }
    }
  });

  test("storefront product page shows image when configured", async ({ page, request }) => {
    const slug = process.env.E2E_STORE_SLUG?.trim();
    const productRef = process.env.E2E_PRODUCT_REF?.trim();
    test.skip(!slug || !productRef, "Set E2E_STORE_SLUG and E2E_PRODUCT_REF");

    const res = await request.get(`/s/${slug}/products/${encodeURIComponent(productRef)}`);
    test.skip(!res.ok(), "Product page not reachable");
    await page.goto(`/s/${slug}/products/${encodeURIComponent(productRef)}`);
    await expect(page.locator("main img[src^='http']").first()).toBeVisible({ timeout: 30_000 });
  });
});
