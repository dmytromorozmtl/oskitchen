import { expect, test } from "@playwright/test";

import {
  VISUAL_QA_P3_55_FLOW_STEPS,
  VISUAL_QA_P3_55_POLICY_ID,
  VISUAL_QA_P3_55_SURFACES,
  visualQaSnapshotName,
  visualQaSurfaceIds,
} from "@/lib/qa/visual-qa-p3-55-policy";
import {
  buildVisualQaSurfaceStatuses,
  validateVisualQaContract,
} from "@/lib/qa/visual-qa-p3-55-measurement";

import { gotoVisualTestPage } from "./visual-goto";
import { visualScreenshotOptions } from "./visual-screenshot";

test.describe("visual: QA P3-55 surfaces", () => {
  for (const surface of VISUAL_QA_P3_55_SURFACES) {
    test(`${surface.label} — ${surface.viewport.width}×${surface.viewport.height}`, async ({
      page,
    }) => {
      await page.setViewportSize(surface.viewport);
      await gotoVisualTestPage(page, surface.path);
      await expect(page.getByTestId(surface.testId)).toBeVisible({ timeout: 15_000 });
      await expect(page).toHaveScreenshot(
        visualQaSnapshotName(surface.snapshotStem),
        visualScreenshotOptions,
      );
    });
  }
});
