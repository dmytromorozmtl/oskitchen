import { expect, test } from "@playwright/test";

import { skipIfLoginRedirect } from "./helpers/dashboard-smoke";

test.describe("api marketplace", () => {
  test("developers page shows marketplace panel", async ({ page }) => {
    await page.goto("/dashboard/developers");
    await skipIfLoginRedirect(page);
    await expect(page.getByRole("heading", { name: /API Marketplace/i })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId("app-marketplace-panel")).toBeVisible();
    await expect(page.getByTestId("marketplace-submit-app")).toBeVisible();
  });
});
