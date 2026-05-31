import { test, expect } from "@playwright/test";

import { skipIfLoginRedirect } from "./helpers/dashboard-smoke";
import { mockDoordashAPI } from "./helpers/marketplace-integration-mock";

const connectionId = process.env.DOORDASH_E2E_CONNECTION_ID?.trim();
const useMock = !connectionId;

test.describe("DoorDash integration", () => {
  test.beforeEach(async ({ page }) => {
    if (useMock) {
      await mockDoordashAPI(page);
    }
  });

  test("integration dashboard shows BETA readiness", async ({ page }) => {
    await page.goto("/dashboard/integrations/doordash");
    await skipIfLoginRedirect(page);
    await expect(page.getByRole("heading", { name: /DoorDash integration/i })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText(/webhook/i)).toBeVisible();
  });
});
