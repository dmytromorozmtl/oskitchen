import { expect, test } from "@playwright/test";

import { skipIfLoginRedirect } from "./helpers/dashboard-smoke";

test.describe("camera live", () => {
  test("live camera page shows CV panel and refresh", async ({ page }) => {
    await page.goto("/dashboard/kitchen/cameras/live");
    await skipIfLoginRedirect(page);
    await expect(page.getByRole("heading", { name: /AI Camera LIVE/i })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId("camera-live-panel")).toBeVisible();
    await expect(page.getByTestId("camera-live-refresh")).toBeVisible();
  });
});
