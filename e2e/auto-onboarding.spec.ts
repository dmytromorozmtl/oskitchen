import { expect, test } from "@playwright/test";

test.describe("automated onboarding", () => {
  test("auto onboarding page renders chat wizard", async ({ page }) => {
    await page.goto("/dashboard/onboarding/auto");
    if (page.url().includes("/login")) {
      test.skip(true, "No authed session");
    }
    if (page.url().includes("/dashboard/today")) {
      test.skip(true, "Onboarding already completed for this user");
    }
    await expect(page.getByRole("heading", { name: /ai setup assistant/i })).toBeVisible();
    await expect(page.getByText(/ai-assisted/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /continue/i })).toBeVisible();
  });
});
