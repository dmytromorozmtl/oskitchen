import { expect, test } from "@playwright/test";

/**
 * Step 5 — staff must reach orders surfaces (workspace-scoped list).
 *
 *   E2E_STAFF_EMAIL=... E2E_STAFF_PASSWORD=... npx playwright test tests/e2e/staff-order-visibility.spec.ts --project=chromium-staff
 */
test.describe("staff order visibility", () => {
  test("staff can open orders list", async ({ page }) => {
    await page.goto("/dashboard/orders");
    await expect(page).toHaveURL(/\/dashboard\/orders/);
    await expect(page.getByRole("heading", { name: /orders/i })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(/access restricted|forbidden/i)).not.toBeVisible();
  });

  test("staff can open order hub", async ({ page }) => {
    await page.goto("/dashboard/order-hub");
    await expect(page).toHaveURL(/\/dashboard\/order-hub/);
    await expect(page.getByText(/access restricted|forbidden/i)).not.toBeVisible();
  });
});
