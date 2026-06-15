import { expect, test } from "@playwright/test";

import { skipIfLoginRedirect } from "./helpers/dashboard-smoke";

test.describe("Tip pooling", () => {
  test("loads tip pool rules and weekly report", async ({ page }) => {
    await page.goto("/dashboard/staff/tip-pooling");
    await skipIfLoginRedirect(page);
    await expect(page.getByRole("heading", { name: /Tip pooling/i })).toBeVisible({
      timeout: 15_000,
    });
  });
});
