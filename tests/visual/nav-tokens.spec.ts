import { expect, test } from "@playwright/test";

import { gotoVisualTestPage } from "./visual-goto";
import { visualScreenshotOptions } from "./visual-screenshot";

test.describe("visual: nav tokens", () => {
  test("storefront navigation variants", async ({ page }) => {
    await gotoVisualTestPage(page, "/visual-test/nav-tokens");
    await expect(page.getByTestId("visual-nav-tokens")).toBeVisible({ timeout: 15_000 });
    await expect(page).toHaveScreenshot("nav-tokens.png", visualScreenshotOptions);
  });
});
