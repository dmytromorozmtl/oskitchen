import { expect, test } from "@playwright/test";

import { gotoVisualTestPage } from "./visual-goto";
import { visualScreenshotOptions } from "./visual-screenshot";

test.describe("visual: checkout shell", () => {
  test("checkout form and order summary", async ({ page }) => {
    await gotoVisualTestPage(page, "/visual-test/checkout-shell");
    await expect(page.getByTestId("visual-checkout-shell")).toBeVisible({ timeout: 15_000 });
    await expect(page).toHaveScreenshot("checkout-shell.png", visualScreenshotOptions);
  });
});
