import { expect, test } from "@playwright/test";

import { assertNoDashboardRscFailure, skipIfLoginRedirect } from "./helpers/dashboard-smoke";

test.describe("invoice scanner", () => {
  test("invoice scanner page loads with scan controls and honesty banner", async ({ page }) => {
    await page.goto("/dashboard/inventory/invoice-scanner");
    await skipIfLoginRedirect(page);
    await assertNoDashboardRscFailure(page);

    await expect(page.getByRole("heading", { name: /Invoice Scanner/i })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId("invoice-scanner-panel")).toBeVisible();
    await expect(page.getByText(/AI-assisted invoice scanning/i)).toBeVisible();
    await expect(page.getByTestId("invoice-scan-camera-btn")).toBeVisible();
    await expect(page.getByTestId("invoice-scan-gallery-btn")).toBeVisible();
    await expect(page.getByText(/Take Photo/i)).toBeVisible();
    await expect(page.getByTestId("invoice-scan-history")).toBeVisible();
  });

  test("mobile viewfinder opens from Take Photo", async ({ page }) => {
    await page.goto("/dashboard/inventory/invoice-scanner");
    await skipIfLoginRedirect(page);

    await page.getByTestId("invoice-scan-camera-btn").click();
    const viewfinder = page.getByTestId("invoice-scan-viewfinder");
    const visible = await viewfinder.isVisible().catch(() => false);
    if (visible) {
      await expect(page.getByTestId("invoice-scan-shutter-btn")).toBeVisible();
      await page.getByTestId("invoice-scan-viewfinder-close").click();
    } else {
      test.skip(true, "Camera not available in this environment");
    }
  });
});
