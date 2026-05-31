import { expect, test } from "@playwright/test";

import { skipIfLoginRedirect } from "./helpers/dashboard-smoke";

test.describe("Team communication", () => {
  test("loads staff operational communication feed", async ({ page }) => {
    await page.goto("/dashboard/staff/team");
    await skipIfLoginRedirect(page);
    await expect(page.getByRole("heading", { name: /Team communication/i })).toBeVisible({
      timeout: 15_000,
    });
  });
});
