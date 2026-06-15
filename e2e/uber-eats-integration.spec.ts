import { test, expect } from "@playwright/test";

import { skipIfLoginRedirect } from "./helpers/dashboard-smoke";
import { mockUberEatsAPI } from "./helpers/marketplace-integration-mock";

const connectionId = process.env.UBER_EATS_E2E_CONNECTION_ID?.trim();
const useMock = !connectionId;

test.describe("Uber Eats integration", () => {
  test.beforeEach(async ({ page }) => {
    if (useMock) {
      await mockUberEatsAPI(page);
    }
  });

  test("integration dashboard shows BETA readiness", async ({ page }) => {
    await page.goto("/dashboard/integrations/uber-eats");
    await skipIfLoginRedirect(page);
    await expect(page.getByRole("heading", { name: /Uber Eats/i })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText(/webhook/i)).toBeVisible();
  });
});
