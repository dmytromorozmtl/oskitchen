import { expect, test } from "@playwright/test";

import { gotoVisualTestPage } from "./visual-goto";
import { visualScreenshotOptions } from "./visual-screenshot";

test.describe("visual: theme presets", () => {
  test("theme preset mini grid", async ({ page }) => {
    await gotoVisualTestPage(page, "/visual-test/theme-presets");
    await expect(page.getByTestId("visual-theme-presets")).toBeVisible({ timeout: 15_000 });
    await expect(page).toHaveScreenshot("theme-presets-grid.png", visualScreenshotOptions);
  });
});
