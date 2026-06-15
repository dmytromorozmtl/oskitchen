import { expect, test } from "@playwright/test";

import { skipIfLoginRedirect } from "./helpers/dashboard-smoke";

test.describe("Restaurant loyalty", () => {
  test("loads restaurant loyalty program dashboard", async ({ page }) => {
    await page.goto("/dashboard/customers/loyalty");
    await skipIfLoginRedirect(page);
    await expect(page.getByRole("heading", { name: /Loyalty program/i })).toBeVisible({
      timeout: 15_000,
    });
  });
});
