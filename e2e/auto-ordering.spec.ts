import { expect, test } from "@playwright/test";

import { skipIfLoginRedirect } from "./helpers/dashboard-smoke";

test.describe("inventory auto-ordering", () => {
  test("auto-ordering page shows panel and controls", async ({ page }) => {
    await page.goto("/dashboard/inventory/auto-ordering");
    await skipIfLoginRedirect(page);
    await expect(page.getByRole("heading", { name: /Advanced inventory auto-ordering/i })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId("auto-ordering-panel")).toBeVisible();
    await expect(page.getByTestId("auto-ordering-enabled")).toBeVisible();
    await expect(page.getByTestId("auto-ordering-dry-run")).toBeVisible();
  });
});
