import { expect, test } from "@playwright/test";

import { skipIfLoginRedirect } from "./helpers/dashboard-smoke";

test.describe("Labor cost realtime", () => {
  test("loads realtime labor cost tracker", async ({ page }) => {
    await page.goto("/dashboard/staff/labor-realtime");
    await skipIfLoginRedirect(page);
    await expect(page.getByRole("heading", { name: /Labor cost tracker/i })).toBeVisible({
      timeout: 15_000,
    });
  });
});
