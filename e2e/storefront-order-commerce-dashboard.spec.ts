import { expect, test } from "@playwright/test";

/**
 * Dashboard order detail — storefront market + tax card (authed).
 * Requires a recent STOREFRONT order linked to internal Order row.
 */
test.describe("Storefront order commerce — dashboard", () => {
  test.beforeEach(() => {
    test.skip(
      !process.env.E2E_LOGIN_EMAIL?.trim(),
      "Set E2E_LOGIN_EMAIL and E2E_LOGIN_PASSWORD",
    );
  });

  test("order detail shows Storefront preorder card when commerce snapshot exists", async ({ page }) => {
    await page.goto("/dashboard/orders");
    await expect(page.getByRole("heading", { name: /orders/i }).first()).toBeVisible({ timeout: 60_000 });

    const storefrontLink = page.getByRole("link", { name: /storefront|SF-/i }).first();
    if ((await storefrontLink.count()) === 0) {
      test.skip(true, "No storefront orders in list — place one via /s/hello/checkout first");
    }

    await storefrontLink.click();
    await expect(page).toHaveURL(/\/dashboard\/orders\//, { timeout: 30_000 });

    const card = page.getByTestId("order-storefront-commerce-card");
    if ((await card.count()) === 0) {
      test.skip(true, "Order is not a storefront preorder or uses legacy cart without commerce card data");
    }

    await expect(card.first()).toBeVisible();
    await expect(page.getByText("Checkout totals")).toBeVisible();
    await expect(page.getByText("Market").first()).toBeVisible();
  });

  test("fulfillment tab includes storefront commerce block", async ({ page }) => {
    await page.goto("/dashboard/orders");
    const storefrontLink = page.getByRole("link", { name: /storefront|SF-/i }).first();
    if ((await storefrontLink.count()) === 0) {
      test.skip(true, "No storefront orders");
    }
    await storefrontLink.click();
    await page.getByRole("link", { name: /fulfillment/i }).click();
    const card = page.getByTestId("order-storefront-commerce-card");
    if ((await card.count()) === 0) test.skip(true, "Not a storefront order with v2 snapshot");
    await expect(card.first()).toBeVisible();
  });
});
