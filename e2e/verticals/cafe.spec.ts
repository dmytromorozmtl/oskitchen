import { test, expect } from "@playwright/test";

test.describe("cafe / restaurant vertical", () => {
  test.skip(!process.env.E2E_SESSION_COOKIE, "Set E2E_SESSION_COOKIE for authed vertical flows");

  test("POS terminal page loads", async ({ page }) => {
    await page.goto("/dashboard/pos");
    await expect(page.locator("body")).toBeVisible();
  });
});
