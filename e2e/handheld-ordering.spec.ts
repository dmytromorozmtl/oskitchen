import { expect, test } from "@playwright/test";

/**
 * Handheld ordering shell — verifies mobile waiter UI loads for authed operators.
 * Full offline cash path is covered by `e2e/pos-offline-queue.spec.ts`.
 */
test.describe("Handheld ordering", () => {
  test("loads table picker and product grid", async ({ page }) => {
    await page.goto("/dashboard/pos/handheld");

    if (await page.getByRole("link", { name: /add register/i }).isVisible().catch(() => false)) {
      test.skip(true, "No POS register configured.");
    }
    if (await page.getByRole("link", { name: /open staff/i }).isVisible().catch(() => false)) {
      test.skip(true, "No staff configured.");
    }

    await expect(page.getByTestId("handheld-ordering-root")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("Tables")).toBeVisible();
    await expect(page.getByTestId("handheld-checkout-cash")).toBeVisible();
  });
});
