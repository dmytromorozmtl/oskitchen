import { test, expect } from "@playwright/test";

test.describe("ghost kitchen vertical", () => {
  test("brands command center reachable", async ({ page }) => {
    await page.goto("/dashboard/brands/command-center");
    await expect(page.locator("body")).toContainText(/brand/i);
  });
});
