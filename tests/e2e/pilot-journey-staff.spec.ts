import { expect, test, type Page } from "@playwright/test";

/**
 * Staff member in the same workspace as the pilot owner fixture.
 * Project: `pilot-staff` (see playwright.config.ts).
 */
async function expectNoAccessDenied(page: Page) {
  await expect(page.getByText(/access restricted|forbidden|not found/i)).not.toBeVisible();
}

async function expectRoleDenied(page: Page) {
  await expect(page.getByText(/you do not have access/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /go to today/i })).toBeVisible();
}

test.describe("Pilot journey — staff workspace visibility", () => {
  test("staff reaches orders and order hub", async ({ page }) => {
    await page.goto("/dashboard/orders");
    await expect(page).toHaveURL(/\/dashboard\/orders/);
    await expect(page.getByRole("heading", { name: /orders/i })).toBeVisible({ timeout: 30_000 });
    await expectNoAccessDenied(page);

    await page.goto("/dashboard/order-hub");
    await expect(page).toHaveURL(/\/dashboard\/order-hub/);
    await expectNoAccessDenied(page);
  });

  test("staff cannot open platform admin", async ({ page }) => {
    await page.goto("/platform");
    await expect(page).not.toHaveURL(/\/platform\/?$/);
  });

  test("staff navigation surfaces operational modules but suppresses billing and developer entries", async ({
    page,
  }) => {
    await page.goto("/dashboard/orders");
    await expect(page.getByRole("heading", { name: /orders/i })).toBeVisible({ timeout: 30_000 });

    const navFilter = page.getByLabel(/filter navigation/i);
    await expect(navFilter).toBeVisible();

    await navFilter.fill("orders");
    await expect(page.locator('aside a[href="/dashboard/orders"]').first()).toBeVisible();

    await navFilter.fill("billing");
    await expect(page.locator('aside a[href="/dashboard/billing"]')).toHaveCount(0);

    await navFilter.fill("developer");
    await expect(page.locator('aside a[href="/dashboard/developer"]')).toHaveCount(0);

    await page.getByRole("button", { name: /open account menu/i }).click();
    await expect(page.getByRole("link", { name: /profile/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /^billing$/i })).toHaveCount(0);
    await expect(page.getByRole("link", { name: /api keys/i })).toHaveCount(0);
  });

  test("staff receives role-denied recovery states on restricted admin routes", async ({ page }) => {
    for (const path of ["/dashboard/billing", "/dashboard/developer"]) {
      await page.goto(path);
      await expectRoleDenied(page);
    }
  });
});
