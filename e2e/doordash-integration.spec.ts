import { test, expect } from "@playwright/test";

/**
 * DoorDash BETA integration smoke — requires staging credentials and connection id.
 * Skips when DOORDASH_E2E_CONNECTION_ID is unset.
 */
const connectionId = process.env.DOORDASH_E2E_CONNECTION_ID?.trim();

test.describe("DoorDash integration", () => {
  test.skip(!connectionId, "Set DOORDASH_E2E_CONNECTION_ID for live DoorDash E2E");

  test("integration dashboard shows BETA readiness", async ({ page }) => {
    await page.goto("/dashboard/integrations/doordash");
    await expect(page.getByRole("heading", { name: /DoorDash integration/i })).toBeVisible();
    await expect(page.getByText(/webhook/i)).toBeVisible();
  });
});
