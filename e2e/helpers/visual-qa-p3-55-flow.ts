import { expect, test, type Page } from "@playwright/test";

import {
  VISUAL_QA_P3_55_SURFACES,
  visualQaSnapshotName,
  type VisualQaSurface,
} from "@/lib/qa/visual-qa-p3-55-policy";

import { gotoVisualTestPage } from "../../visual/visual-goto";
import { visualScreenshotOptions } from "../../visual/visual-screenshot";

export async function captureVisualQaSurface(page: Page, surface: VisualQaSurface): Promise<void> {
  await page.setViewportSize(surface.viewport);
  await gotoVisualTestPage(page, surface.path);
  await expect(page.getByTestId(surface.testId)).toBeVisible({ timeout: 15_000 });
  await expect(page).toHaveScreenshot(visualQaSnapshotName(surface.snapshotStem), visualScreenshotOptions);
}

export async function runVisualQaCaptureFlow(page: Page): Promise<string[]> {
  const steps: string[] = ["validate_visual_qa_contract"];

  for (const surface of VISUAL_QA_P3_55_SURFACES) {
    await captureVisualQaSurface(page, surface);
    steps.push(`capture_${surface.id}`);
  }

  return steps;
}

export function skipVisualQaIfGateDisabled(): void {
  if (process.env.E2E_VISUAL_QA_P3_55?.trim() !== "true") {
    test.skip(true, "Visual QA P3-55 SKIPPED — set E2E_VISUAL_QA_P3_55=true");
  }
}
