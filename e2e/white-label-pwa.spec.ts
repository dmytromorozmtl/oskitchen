import { expect, test } from "@playwright/test";

test.describe("white-label PWA", () => {
  test("branding install page without slug shows help", async ({ page }) => {
    await page.goto("/branding");
    await expect(page.getByRole("heading", { name: /install your restaurant app/i })).toBeVisible();
  });

  test("settings branding shows PWA studio when authed", async ({ page }) => {
    await page.goto("/dashboard/settings/branding");
    if (page.url().includes("/login")) {
      test.skip(true, "No authed session");
    }
    await expect(page.getByRole("heading", { name: /branded mobile app/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /publish branded pwa/i })).toBeVisible();
  });
});
