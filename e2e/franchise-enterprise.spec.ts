import { expect, test } from "@playwright/test";

import { skipIfLoginRedirect } from "./helpers/dashboard-smoke";

test.describe("enterprise franchise suite", () => {
  test("franchise page shows suite panel and controls", async ({ page }) => {
    await page.goto("/dashboard/enterprise/franchise");
    await skipIfLoginRedirect(page);
    await expect(page.getByRole("heading", { name: /Franchise management suite/i })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId("franchise-suite-panel")).toBeVisible();
    await expect(page.getByTestId("franchise-menu-save")).toBeVisible();
  });
});
