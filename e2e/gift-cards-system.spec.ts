import { expect, test } from "@playwright/test";

test.describe("gift cards system", () => {
  test("loyalty gift cards hub renders when authed", async ({ page }) => {
    await page.goto("/dashboard/loyalty/gift-cards");
    if (page.url().includes("/login")) {
      test.skip(true, "No authed session");
    }
    await expect(page.getByRole("heading", { name: /gift cards system/i })).toBeVisible();
    await expect(page.getByText(/digital gift cards/i).first()).toBeVisible();
    await expect(page.getByText(/physical gift cards/i).first()).toBeVisible();
  });
});
