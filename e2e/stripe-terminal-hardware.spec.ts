import { expect, test } from "@playwright/test";

test.describe("stripe terminal hardware", () => {
  test("settings hardware page shows reader catalog", async ({ page }) => {
    await page.goto("/dashboard/settings/hardware");
    if (page.url().includes("/login")) {
      test.skip(true, "No authed session for hardware settings");
    }
    await expect(page.getByRole("heading", { name: /payment hardware/i })).toBeVisible();
    await expect(page.getByTestId("stripe-terminal-hardware-panel")).toBeVisible();
    await expect(page.getByTestId("hardware-catalog-stripe_m2")).toBeVisible();
    await expect(page.getByTestId("hardware-catalog-bbpos_wisepos_e")).toBeVisible();
    await expect(page.getByTestId("hardware-catalog-verifone_p400")).toBeVisible();
  });
});
