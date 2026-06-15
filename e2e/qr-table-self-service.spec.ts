import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 375, height: 812 } });

test.describe("qr table self-service", () => {
  test("table page requires query params", async ({ page }) => {
    await page.goto("/q/table");
    await expect(page.getByRole("heading", { name: /invalid table link/i })).toBeVisible();
  });

  test("full self-service shell when storefront exists", async ({ page }) => {
    await page.goto("/q/table?store=demo-store&table=12");
    if (page.url().includes("Invalid") || page.url().includes("unavailable")) {
      test.skip(true, "No published storefront for demo-store");
    }
    await expect(page.getByTestId("qr-table-self-service-page")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/table service/i)).toBeVisible();
  });
});
