import { expect, test } from "@playwright/test";

import { skipIfLoginRedirect } from "./helpers/dashboard-smoke";

test.describe("AI scheduling", () => {
  test("loads AI-assisted staffing suggestions", async ({ page }) => {
    await page.goto("/dashboard/staff/ai-scheduling");
    await skipIfLoginRedirect(page);
    await expect(page.getByRole("heading", { name: /AI scheduling/i })).toBeVisible({
      timeout: 15_000,
    });
  });
});
