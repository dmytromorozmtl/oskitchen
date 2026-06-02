import { expect, test } from "@playwright/test";

/**
 * Quick Start wizard — requires a user who has not completed onboarding.
 * Skips when authed storage state already completed onboarding (typical CI smoke user).
 */
test.describe("quick start wizard", () => {
  test("quick start page renders steps for incomplete onboarding", async ({ page }) => {
    await page.goto("/dashboard/quick-start");
    const url = page.url();
    if (url.includes("/onboarding") || url.includes("/login")) {
      test.skip(true, "Authed user already completed onboarding or session missing");
    }
    await expect(page.getByRole("heading", { name: /first order in about 15 minutes/i })).toBeVisible();
    await expect(page.getByText(/step 1 of 3/i)).toBeVisible();
    await expect(page.getByRole("heading", { name: /what type of restaurant/i })).toBeVisible();
  });

  test("can advance to channels step", async ({ page }) => {
    await page.goto("/dashboard/quick-start");
    if (!page.url().includes("/dashboard/quick-start")) {
      test.skip(true, "Quick start not available for this session");
    }
    await page.getByRole("button", { name: /quick service/i }).click();
    await page.getByRole("button", { name: /^continue$/i }).click();
    await expect(page.getByRole("heading", { name: /how do you take orders/i })).toBeVisible();
  });
});
