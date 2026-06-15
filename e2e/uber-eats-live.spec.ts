import { expect, test } from "@playwright/test";

import { skipIfLoginRedirect } from "./helpers/dashboard-smoke";

test.describe("uber eats live", () => {
  test("live dashboard shows OAuth and sync controls", async ({ page }) => {
    await page.goto("/dashboard/integrations/uber-eats/live");
    await skipIfLoginRedirect(page);
    await expect(page.getByRole("heading", { name: /Uber Eats LIVE/i })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId("uber-eats-live-panel")).toBeVisible();
    await expect(page.getByTestId("uber-eats-sync-menu")).toBeVisible();
    await expect(page.getByTestId("uber-eats-import-orders")).toBeVisible();
  });
});
