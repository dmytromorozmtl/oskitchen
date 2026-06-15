import { expect, test } from "@playwright/test";

test("support inbox requires authentication", async ({ page }) => {
  await page.goto("/dashboard/support");
  await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
});
