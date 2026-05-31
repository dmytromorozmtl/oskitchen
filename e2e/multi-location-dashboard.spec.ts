import { expect, test } from "@playwright/test";

import { skipIfLoginRedirect } from "./helpers/dashboard-smoke";

test.describe("Multi-location dashboard", () => {
  test("loads multi-location rollup dashboard", async ({ page }) => {
    await page.goto("/dashboard/locations/dashboard");
    await skipIfLoginRedirect(page);
    await expect(page.getByRole("heading", { name: /Multi-location dashboard/i })).toBeVisible({
      timeout: 15_000,
    });
  });
});
