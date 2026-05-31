import { test, expect } from "@playwright/test";

const connectionId = process.env.GRUBHUB_E2E_CONNECTION_ID?.trim();

test.describe("Grubhub integration", () => {
  test.skip(!connectionId, "Set GRUBHUB_E2E_CONNECTION_ID for live Grubhub E2E");

  test("integration dashboard shows BETA readiness", async ({ page }) => {
    await page.goto("/dashboard/integrations/grubhub");
    await expect(page.getByRole("heading", { name: /Grubhub integration/i })).toBeVisible();
    await expect(page.getByText(/webhook/i)).toBeVisible();
  });
});
