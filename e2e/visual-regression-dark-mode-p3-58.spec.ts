import { expect, test } from "@playwright/test";

import {
  VISUAL_REGRESSION_DARK_MODE_P3_58_POLICY_ID,
  VISUAL_REGRESSION_DARK_MODE_P3_58_SNAPSHOT_PAIR_COUNT,
  VISUAL_REGRESSION_DARK_MODE_P3_58_TARGET_COUNT,
  VISUAL_REGRESSION_DARK_MODE_P3_58_THEME_MODES,
  visualRegressionDarkModeTargetIds,
} from "@/lib/qa/visual-regression-dark-mode-p3-58-policy";
import { validateVisualRegressionDarkModeContract } from "@/lib/qa/visual-regression-dark-mode-p3-58-measurement";

import {
  listVisualRegressionTargets,
  runVisualRegressionContractStep,
  runVisualRegressionPolicyFlow,
  visualRegressionSnapshotPairCount,
  visualRegressionTargetCount,
} from "./helpers/visual-regression-dark-mode-p3-58-flow";
import { visualRegressionDarkModeP3_58Ready } from "./helpers/visual-regression-dark-mode-p3-58-ready";

/**
 * Visual regression dark mode — Chromatic/Percy-style light + dark parity.
 *
 * @see tests/visual/dark-mode-parity.spec.ts
 * @see docs/visual-regression-dark-mode-p3-58.md
 */

test.describe("visual regression dark mode p3-58 policy", () => {
  test("exports five fixture targets with light and dark snapshot pairs", () => {
    expect(VISUAL_REGRESSION_DARK_MODE_P3_58_POLICY_ID).toBe(
      "visual-regression-dark-mode-p3-58-v1",
    );
    expect(visualRegressionDarkModeTargetIds()).toHaveLength(
      VISUAL_REGRESSION_DARK_MODE_P3_58_TARGET_COUNT,
    );
    expect(visualRegressionTargetCount()).toBe(5);
    expect(visualRegressionSnapshotPairCount()).toBe(
      VISUAL_REGRESSION_DARK_MODE_P3_58_SNAPSHOT_PAIR_COUNT,
    );
    expect(VISUAL_REGRESSION_DARK_MODE_P3_58_THEME_MODES).toEqual(["light", "dark"]);
    expect(validateVisualRegressionDarkModeContract().passed).toBe(true);
  });

  test("contract step lists all visual-test fixture paths", () => {
    const result = runVisualRegressionContractStep();
    expect(result.passed).toBe(true);
    expect(result.targetIds).toHaveLength(5);
    expect(listVisualRegressionTargets().every((target) => target.path.startsWith("/visual-test"))).toBe(
      true,
    );
  });

  test("policy flow completes four steps", () => {
    const flow = runVisualRegressionPolicyFlow();
    expect(flow.steps).toHaveLength(4);
    expect(flow.contract.passed).toBe(true);
    expect(flow.snapshotPairCount).toBe(10);
  });

  test("E2E gate requires E2E_VISUAL_REGRESSION_DARK_MODE flag for live snapshots", () => {
    if (!visualRegressionDarkModeP3_58Ready()) {
      test.skip(true, "Set E2E_VISUAL_REGRESSION_DARK_MODE=true for live snapshot runs");
    }
    expect(visualRegressionDarkModeP3_58Ready()).toBe(true);
  });
});
