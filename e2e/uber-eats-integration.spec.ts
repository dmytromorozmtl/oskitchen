import { test, expect } from "@playwright/test";

const connectionId = process.env.UBER_EATS_E2E_CONNECTION_ID?.trim();

test.describe("Uber Eats integration", () => {
  test.skip(!connectionId, "Set UBER_EATS_E2E_CONNECTION_ID for live Uber Eats E2E");

  test("integration dashboard shows BETA readiness", async ({ page }) => {
    await page.goto("/dashboard/integrations/uber-eats");
    await expect(page.getByRole("heading", { name: /Uber Eats/i })).toBeVisible();
    await expect(page.getByText(/webhook/i)).toBeVisible();
  });
});
