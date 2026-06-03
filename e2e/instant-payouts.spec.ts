import { expect, test } from "@playwright/test";

test.describe("instant payouts", () => {
  test("instant payouts page renders when authed", async ({ page }) => {
    await page.goto("/vendor/finance/instant-payouts");
    if (page.url().includes("/login")) {
      test.skip(true, "No authed session");
    }
    await expect(page.getByRole("heading", { name: /instant payouts/i })).toBeVisible();
    await expect(page.getByText(/instant payout to debit card/i)).toBeVisible();
    await expect(page.getByText(/30 minutes/i).first()).toBeVisible();
  });
});
