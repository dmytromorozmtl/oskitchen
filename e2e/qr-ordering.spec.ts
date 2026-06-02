import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 375, height: 812 } });

test.describe("qr ordering", () => {
  test("qr codes dashboard loads", async ({ page }) => {
    await page.goto("/dashboard/qr-codes");
    if (page.url().includes("/login")) {
      test.skip(true, "Requires authenticated session");
    }
    await expect(page.getByRole("heading", { name: /table qr codes/i })).toBeVisible();
    await expect(page.getByTestId("qr-table-grid")).toBeVisible();
  });

  test("public qr page shows dark menu shell", async ({ page }) => {
    await page.goto("/q/demo-store/12");
    if (!page.url().includes("/q/")) {
      test.skip(true, "No published storefront at /q/demo-store/12");
    }
    await expect(page.getByTestId("qr-ordering-page")).toBeVisible({ timeout: 15_000 });
  });

  test("authenticated generate qr flow", async ({ page }) => {
    await page.goto("/dashboard/qr-codes");
    if (!page.url().includes("/dashboard/qr-codes")) {
      test.skip(true, "QR dashboard not available");
    }
    const generate = page.getByRole("button", { name: /^generate qr$/i }).first();
    if (!(await generate.isVisible())) {
      test.skip(true, "No tables configured");
    }
    await generate.click();
    await expect(page.locator('img[alt^="QR for table"]')).toBeVisible({ timeout: 30_000 });
  });
});
