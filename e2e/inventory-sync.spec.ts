import { expect, test } from "@playwright/test";

import { skipIfLoginRedirect } from "./helpers/dashboard-smoke";

test.describe("Inventory sync", () => {
  test("loads bidirectional inventory sync panel", async ({ page }) => {
    await page.goto("/dashboard/integrations/inventory-sync");
    await skipIfLoginRedirect(page);
    await expect(page.getByRole("heading", { name: /Inventory sync/i })).toBeVisible({
      timeout: 15_000,
    });
  });
});
