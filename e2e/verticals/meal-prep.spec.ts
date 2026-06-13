import { test, expect } from "@playwright/test";

/**
 * Meal prep golden path — chromium-authed project (auth.setup.ts).
 * @tags vertical meal-prep
 */
test.describe("meal prep vertical", () => {
  test("today command center loads", async ({ page }) => {
    await page.goto("/dashboard/today");
    await expect(page.getByRole("heading", { name: /today/i })).toBeVisible();
  });
});
