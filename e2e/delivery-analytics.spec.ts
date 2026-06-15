import { expect, test } from "@playwright/test";

import { skipIfLoginRedirect } from "./helpers/dashboard-smoke";

test.describe("Delivery channel analytics", () => {
  test("loads unified delivery analytics dashboard", async ({ page }) => {
    await page.goto("/dashboard/analytics/delivery-channels");
    await skipIfLoginRedirect(page);
    await expect(page.getByRole("heading", { name: /Delivery channel analytics/i })).toBeVisible({
      timeout: 15_000,
    });
  });
});
