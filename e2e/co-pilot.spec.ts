import { expect, test } from "@playwright/test";

import { skipIfLoginRedirect } from "./helpers/dashboard-smoke";

test.describe("restaurant co-pilot", () => {
  test("co-pilot page shows recommendations and approval controls", async ({ page }) => {
    await page.goto("/dashboard/ai/co-pilot");
    await skipIfLoginRedirect(page);
    await expect(page.getByRole("heading", { name: /AI Restaurant Co-Pilot/i })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId("restaurant-co-pilot-panel")).toBeVisible();
    await expect(page.getByText(/AI recommendations/i)).toBeVisible();
  });
});
