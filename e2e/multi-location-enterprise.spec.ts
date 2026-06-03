import { expect, test } from "@playwright/test";

import { skipIfLoginRedirect } from "./helpers/dashboard-smoke";

test.describe("enterprise multi-location", () => {
  test("enterprise page shows panel and comparison", async ({ page }) => {
    await page.goto("/dashboard/enterprise/multi-location");
    await skipIfLoginRedirect(page);
    await expect(page.getByRole("heading", { name: /Multi-location enterprise/i })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId("enterprise-multi-location-panel")).toBeVisible();
    await expect(page.getByTestId("multi-location-comparison-table")).toBeVisible();
  });
});
