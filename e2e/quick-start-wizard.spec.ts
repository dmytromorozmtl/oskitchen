import { expect, test } from "@playwright/test";

/**
 * Quick Start wizard — requires a user who has not completed onboarding.
 */
test.describe("quick start wizard", () => {
  test("quick start page renders 15-minute 4-step flow", async ({ page }) => {
    await page.goto("/dashboard/quick-start");
    const url = page.url();
    if (url.includes("/onboarding") || url.includes("/login")) {
      test.skip(true, "Authed user already completed onboarding or session missing");
    }
    await expect(page.getByRole("heading", { name: /first order in about 15 minutes/i })).toBeVisible();
    await expect(page.getByText(/step 1 of 4/i)).toBeVisible();
    await expect(page.getByRole("heading", { name: /what's your restaurant called/i })).toBeVisible();
    await expect(page.getByTestId("quick-start-timer")).toBeVisible();
  });

  test("can advance to menu step", async ({ page }) => {
    await page.goto("/dashboard/quick-start");
    if (!page.url().includes("/dashboard/quick-start")) {
      test.skip(true, "Quick start not available for this session");
    }
    await page.getByTestId("quick-start-business-name").fill("Test Bistro");
    await page.getByRole("button", { name: /quick service/i }).click();
    await page.getByRole("button", { name: /^continue$/i }).click();
    await expect(page.getByRole("heading", { name: /add your first menu item/i })).toBeVisible();
    await expect(page.getByTestId("quick-start-menu-preview")).toBeVisible();
  });
});
