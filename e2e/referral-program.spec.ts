import { expect, test } from "@playwright/test";

/**
 * Referral program — public /r/{code} redirect and settings dashboard.
 */
test.describe("referral program", () => {
  test("invalid referral code redirects to signup without error", async ({ page }) => {
    await page.goto("/r/INVALID-CODE-XYZ");
    await expect(page).toHaveURL(/\/signup/);
  });

  test("settings referrals page shows program copy when authed", async ({ page }) => {
    await page.goto("/dashboard/settings/referrals");
    await expect(page.getByRole("heading", { name: /referral program/i })).toBeVisible();
    await expect(page.getByText(/both get/i)).toBeVisible();
    await expect(page.getByText(/your referral link/i)).toBeVisible();
  });
});
