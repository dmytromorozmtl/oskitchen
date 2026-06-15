import { expect, test } from "@playwright/test";

import { skipIfLoginRedirect } from "./helpers/dashboard-smoke";

test.describe("kitchen voice", () => {
  test("kitchen voice page shows simulator", async ({ page }) => {
    await page.goto("/dashboard/kitchen/voice");
    await skipIfLoginRedirect(page);
    await expect(page.getByRole("heading", { name: /Voice-Activated Kitchen/i })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId("kitchen-voice-panel")).toBeVisible();
    await expect(page.getByTestId("kitchen-voice-ask")).toBeVisible();
  });
});
