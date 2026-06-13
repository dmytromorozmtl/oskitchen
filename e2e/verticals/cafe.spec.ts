import { test, expect } from "@playwright/test";

test.describe("cafe / restaurant vertical", () => {
  test("POS terminal page loads", async ({ page }) => {
    await page.goto("/dashboard/pos");
    await expect(page.locator("body")).toBeVisible();
  });
});
