import { expect, test } from "@playwright/test";

import {
  VISUAL_REGRESSION_DARK_MODE_TARGETS,
  VISUAL_REGRESSION_THEME_MODES,
  visualRegressionSnapshotName,
} from "@/lib/testing/visual-regression-dark-mode-policy";

import { applyVisualTheme, assertVisualThemeApplied } from "./helpers/dark-mode-theme";
import { gotoVisualTestPage } from "./visual-goto";
import { visualScreenshotOptions } from "./visual-screenshot";

test.describe("visual: dark mode parity", () => {
  for (const target of VISUAL_REGRESSION_DARK_MODE_TARGETS) {
    for (const theme of VISUAL_REGRESSION_THEME_MODES) {
      test(`${target.snapshotStem} — ${theme}`, async ({ page }) => {
        await applyVisualTheme(page, theme);
        await gotoVisualTestPage(page, target.path);
        await assertVisualThemeApplied(page, theme);
        await expect(page.getByTestId(target.testId)).toBeVisible({ timeout: 15_000 });
        await expect(page).toHaveScreenshot(
          visualRegressionSnapshotName(target.snapshotStem, theme),
          visualScreenshotOptions,
        );
      });
    }
  }
});
