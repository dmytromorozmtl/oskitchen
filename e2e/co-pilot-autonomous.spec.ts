import { expect, test } from "@playwright/test";

import { skipIfLoginRedirect } from "./helpers/dashboard-smoke";

test.describe("co-pilot autonomous", () => {
  test("autonomous page shows digest and controls", async ({ page }) => {
    await page.goto("/dashboard/ai/co-pilot/autonomous");
    await skipIfLoginRedirect(page);
    await expect(page.getByRole("heading", { name: /AI Co-Pilot 2\.0/i })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId("co-pilot-autonomous-panel")).toBeVisible();
    await expect(page.getByTestId("co-pilot-autonomous-run")).toBeVisible();
  });
});
