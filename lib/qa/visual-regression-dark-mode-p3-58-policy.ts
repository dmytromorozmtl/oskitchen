/**
 * Blueprint P3-58 — Visual regression tests (Chromatic/Percy-style dark mode).
 *
 * Playwright committed PNG baselines for light + dark parity on visual-test fixtures.
 *
 * @see tests/visual/dark-mode-parity.spec.ts
 * @see docs/visual-regression-dark-mode-p3-58.md
 */

import {
  VISUAL_REGRESSION_DARK_MODE_TARGETS,
  VISUAL_REGRESSION_THEME_MODES,
  type VisualRegressionDarkModeTarget,
  type VisualRegressionThemeMode,
  visualRegressionDarkModePairCount,
  visualRegressionSnapshotName,
} from "@/lib/testing/visual-regression-dark-mode-policy";

export const VISUAL_REGRESSION_DARK_MODE_P3_58_POLICY_ID =
  "visual-regression-dark-mode-p3-58-v1" as const;

export const VISUAL_REGRESSION_DARK_MODE_P3_58_DOC =
  "docs/visual-regression-dark-mode-p3-58.md" as const;

export const VISUAL_REGRESSION_DARK_MODE_P3_58_ARTIFACT =
  "artifacts/visual-regression-dark-mode-p3-58-registry.json" as const;

export const VISUAL_REGRESSION_DARK_MODE_P3_58_SPEC =
  "tests/visual/dark-mode-parity.spec.ts" as const;

export const VISUAL_REGRESSION_DARK_MODE_P3_58_E2E_SPEC =
  "e2e/visual-regression-dark-mode-p3-58.spec.ts" as const;

export const VISUAL_REGRESSION_DARK_MODE_P3_58_FLOW_HELPER =
  "e2e/helpers/visual-regression-dark-mode-p3-58-flow.ts" as const;

export const VISUAL_REGRESSION_DARK_MODE_P3_58_READY_HELPER =
  "e2e/helpers/visual-regression-dark-mode-p3-58-ready.ts" as const;

export const VISUAL_REGRESSION_DARK_MODE_P3_58_AUDIT_SCRIPT =
  "scripts/audit-visual-regression-dark-mode-p3-58.ts" as const;

export const VISUAL_REGRESSION_DARK_MODE_P3_58_NPM_SCRIPT =
  "audit:visual-regression-dark-mode-p3-58" as const;

export const VISUAL_REGRESSION_DARK_MODE_P3_58_CHECK_NPM_SCRIPT =
  "check:visual-regression-dark-mode-p3-58" as const;

export const VISUAL_REGRESSION_DARK_MODE_P3_58_UNIT_TEST =
  "tests/unit/visual-regression-dark-mode-p3-58.test.ts" as const;

export const VISUAL_REGRESSION_DARK_MODE_P3_58_CI_WORKFLOW =
  ".github/workflows/chromatic-visual.yml" as const;

export const VISUAL_REGRESSION_DARK_MODE_P3_58_DEPLOY_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const VISUAL_REGRESSION_DARK_MODE_P3_58_THEME_HELPER =
  "tests/visual/helpers/dark-mode-theme.ts" as const;

export const VISUAL_REGRESSION_DARK_MODE_P3_58_TARGET_COUNT = 5 as const;

export const VISUAL_REGRESSION_DARK_MODE_P3_58_SNAPSHOT_PAIR_COUNT =
  visualRegressionDarkModePairCount();

export const VISUAL_REGRESSION_DARK_MODE_P3_58_FLOW_STEPS = [
  "validate_visual_regression_contract",
  "apply_light_theme_snapshots",
  "apply_dark_theme_snapshots",
  "verify_chromatic_workflow",
] as const;

export const VISUAL_REGRESSION_DARK_MODE_P3_58_TARGETS = VISUAL_REGRESSION_DARK_MODE_TARGETS;

export const VISUAL_REGRESSION_DARK_MODE_P3_58_THEME_MODES = VISUAL_REGRESSION_THEME_MODES;

export const VISUAL_REGRESSION_DARK_MODE_P3_58_NPM_SCRIPTS = [
  "test:visual:dark-mode",
  "test:ci:visual-regression-dark-mode",
] as const;

export const VISUAL_REGRESSION_DARK_MODE_P3_58_WIRING_PATHS = [
  VISUAL_REGRESSION_DARK_MODE_P3_58_DOC,
  "lib/testing/visual-regression-dark-mode-policy.ts",
  "lib/qa/visual-regression-dark-mode-p3-58-measurement.ts",
  "lib/qa/visual-regression-dark-mode-p3-58-audit.ts",
  VISUAL_REGRESSION_DARK_MODE_P3_58_SPEC,
  VISUAL_REGRESSION_DARK_MODE_P3_58_E2E_SPEC,
  VISUAL_REGRESSION_DARK_MODE_P3_58_FLOW_HELPER,
  VISUAL_REGRESSION_DARK_MODE_P3_58_READY_HELPER,
  VISUAL_REGRESSION_DARK_MODE_P3_58_THEME_HELPER,
  VISUAL_REGRESSION_DARK_MODE_P3_58_CI_WORKFLOW,
  VISUAL_REGRESSION_DARK_MODE_P3_58_UNIT_TEST,
  VISUAL_REGRESSION_DARK_MODE_P3_58_ARTIFACT,
  "components/providers/public-theme-lock.tsx",
  ...VISUAL_REGRESSION_DARK_MODE_P3_58_TARGETS.map(
    (target) => `app/visual-test/${target.snapshotStem}/page.tsx`,
  ),
] as const;

export function isVisualRegressionDarkModeP3_58Enabled(): boolean {
  return process.env.E2E_VISUAL_REGRESSION_DARK_MODE?.trim() === "true";
}

export function visualRegressionDarkModeTargetIds(): string[] {
  return VISUAL_REGRESSION_DARK_MODE_P3_58_TARGETS.map((target) => target.id);
}

export function visualRegressionDarkModeSnapshotName(
  stem: string,
  theme: VisualRegressionThemeMode,
): string {
  return visualRegressionSnapshotName(stem, theme);
}

export type { VisualRegressionDarkModeTarget, VisualRegressionThemeMode };
