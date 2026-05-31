import { expect, test } from "@playwright/test";

import { skipIfLoginRedirect } from "./helpers/dashboard-smoke";

test.describe("Advanced reporting", () => {
  test("loads advanced reporting and benchmarks", async ({ page }) => {
    await page.goto("/dashboard/analytics/advanced");
    await skipIfLoginRedirect(page);
    await expect(page.getByRole("heading", { name: /Advanced reporting/i })).toBeVisible({
      timeout: 15_000,
    });
  });
});
