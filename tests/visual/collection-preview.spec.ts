import { expect, test } from "@playwright/test";

import { gotoVisualTestPage } from "./visual-goto";
import { visualScreenshotOptions } from "./visual-screenshot";

test.describe("visual: collection preview", () => {
  test("collection hero and catalog filters", async ({ page }) => {
    await gotoVisualTestPage(page, "/visual-test/collection-preview");
    await expect(page.getByTestId("visual-collection-preview")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("collection-hero")).toBeVisible();
    await expect(page).toHaveScreenshot("collection-preview.png", visualScreenshotOptions);
  });
});
