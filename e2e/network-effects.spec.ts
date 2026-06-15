import { expect, test } from "@playwright/test";

import { skipIfLoginRedirect } from "./helpers/dashboard-smoke";

test.describe("network effects", () => {
  test("network page shows intelligence panel and contribute CTA", async ({ page }) => {
    await page.goto("/dashboard/analytics/network");
    await skipIfLoginRedirect(page);
    await expect(page.getByRole("heading", { name: /Restaurant Network Effects/i })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId("network-effects-panel")).toBeVisible();
    await expect(page.getByTestId("network-effects-contribute")).toBeVisible();
  });
});
