import { expect, test } from "@playwright/test";

import { skipIfLoginRedirect } from "./helpers/dashboard-smoke";

test.describe("Reservations full", () => {
  test("loads reservations calendar and management UI", async ({ page }) => {
    await page.goto("/dashboard/reservations");
    await skipIfLoginRedirect(page);
    await expect(page.getByRole("heading", { name: /Reservations/i })).toBeVisible({
      timeout: 15_000,
    });
  });
});
