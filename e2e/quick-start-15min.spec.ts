import { expect, test } from "@playwright/test";

import { assertNoDashboardRscFailure, skipIfLoginRedirect } from "./helpers/dashboard-smoke";

test.describe("quick start 15-minute onboarding", () => {
  test("wizard shows timer, 3 steps, and cuisine selection", async ({ page }) => {
    await page.goto("/dashboard/quick-start");
    await skipIfLoginRedirect(page);

    if (!page.url().includes("/dashboard/quick-start")) {
      test.skip(true, "Quick Start not available — onboarding already completed.");
    }

    await assertNoDashboardRscFailure(page);
    await expect(page.getByRole("heading", { name: /first order in about 15 minutes/i })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId("quick-start-timer")).toBeVisible();
    await expect(page.getByText(/step 1 of 3/i)).toBeVisible();
    await expect(page.getByRole("heading", { name: /what's your restaurant called/i })).toBeVisible();
    await expect(page.getByTestId("quick-start-cuisine-full_service")).toBeVisible();
  });

  test("step 1 advances to menu with live preview", async ({ page }) => {
    await page.goto("/dashboard/quick-start");
    if (!page.url().includes("/dashboard/quick-start")) {
      test.skip(true, "Quick Start not available for this session");
    }

    await page.getByTestId("quick-start-business-name").fill("E2E Test Kitchen");
    await page.getByTestId("quick-start-cuisine-qsr").click();
    await page.getByRole("button", { name: /^continue$/i }).click();

    await expect(page.getByRole("heading", { name: /add your first menu item/i })).toBeVisible();
    await expect(page.getByTestId("quick-start-menu-preview")).toBeVisible();
    await expect(page.getByText(/step 2 of 3/i)).toBeVisible();
  });
});
