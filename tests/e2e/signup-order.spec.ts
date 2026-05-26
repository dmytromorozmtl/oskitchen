import { expect, test } from "@playwright/test";

test("signup page is reachable (smoke)", async ({ page }) => {
  await page.goto("/signup");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 15_000 });
});
