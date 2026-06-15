import { expect, test } from "@playwright/test";

import { skipIfLoginRedirect } from "./helpers/dashboard-smoke";

test.describe("grubhub live", () => {
  test("live dashboard shows OAuth and sync controls", async ({ page }) => {
    await page.goto("/dashboard/integrations/grubhub/live");
    await skipIfLoginRedirect(page);
    await expect(page.getByRole("heading", { name: /Grubhub LIVE/i })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId("grubhub-live-panel")).toBeVisible();
    await expect(page.getByTestId("grubhub-sync-menu")).toBeVisible();
    await expect(page.getByTestId("grubhub-import-orders")).toBeVisible();
  });
});
