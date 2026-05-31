import { expect, test } from "@playwright/test";

test.describe("Bill splitting", () => {
  test("shows split panel on tabs page when tab has items", async ({ page }) => {
    await page.goto("/dashboard/pos/tabs");
    if (await page.getByText("No open tabs").isVisible().catch(() => false)) {
      test.skip(true, "No open tabs to split.");
    }
    await expect(page.getByTestId("bill-split-panel")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("bill-split-mode-equal")).toBeVisible();
    await expect(page.getByTestId("bill-split-mode-item")).toBeVisible();
  });
});
