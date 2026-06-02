import { expect, test } from "@playwright/test";

import { skipIfLoginRedirect } from "./helpers/dashboard-smoke";

test.describe("auto vendor marketplace", () => {
  test("auto vendor page shows savings summary", async ({ page }) => {
    await page.goto("/dashboard/marketplace/auto-vendor");
    await skipIfLoginRedirect(page);
    await expect(page.getByRole("heading", { name: /Automated vendor marketplace/i })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId("auto-vendor-panel")).toBeVisible();
    await expect(page.getByText(/Potential savings/i)).toBeVisible();
  });
});
