import { test, expect } from "@playwright/test";

import { skipIfLoginRedirect } from "./helpers/dashboard-smoke";
import { mockGrubhubAPI } from "./helpers/marketplace-integration-mock";

const connectionId = process.env.GRUBHUB_E2E_CONNECTION_ID?.trim();
const useMock = !connectionId;

test.describe("Grubhub integration", () => {
  test.beforeEach(async ({ page }) => {
    if (useMock) {
      await mockGrubhubAPI(page);
    }
  });

  test("integration dashboard shows BETA readiness", async ({ page }) => {
    await page.goto("/dashboard/integrations/grubhub");
    await skipIfLoginRedirect(page);
    await expect(page.getByRole("heading", { name: /Grubhub integration/i })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText(/webhook/i)).toBeVisible();
  });
});
