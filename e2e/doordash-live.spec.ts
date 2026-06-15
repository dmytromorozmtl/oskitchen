import { expect, test } from "@playwright/test";

import { skipIfLoginRedirect } from "./helpers/dashboard-smoke";

test.describe("doordash live", () => {
  test("live dashboard shows OAuth and sync controls", async ({ page }) => {
    await page.goto("/dashboard/integrations/doordash/live");
    await skipIfLoginRedirect(page);
    await expect(page.getByRole("heading", { name: /DoorDash LIVE/i })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId("doordash-live-panel")).toBeVisible();
    await expect(page.getByTestId("doordash-sync-menu")).toBeVisible();
    await expect(page.getByTestId("doordash-import-orders")).toBeVisible();
  });
});
