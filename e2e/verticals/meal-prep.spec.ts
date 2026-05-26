import { test, expect } from "@playwright/test";

/**
 * Meal prep golden path — requires E2E auth env (see npm run test:e2e:pilot).
 * @tags vertical meal-prep
 */
test.describe("meal prep vertical", () => {
  test.skip(!process.env.E2E_SESSION_COOKIE, "Set E2E_SESSION_COOKIE for authed vertical flows");

  test("today command center loads", async ({ page }) => {
    await page.goto("/dashboard/today");
    await expect(page.getByRole("heading", { name: /today/i })).toBeVisible();
  });
});
