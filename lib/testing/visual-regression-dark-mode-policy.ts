/**
 * Absolute Final Task 51 — Playwright visual regression with light + dark parity.
 * Chromatic/Percy-style snapshots via committed PNG baselines (no Storybook token required).
 */

export const VISUAL_REGRESSION_DARK_MODE_POLICY_ID =
  "visual-regression-dark-mode-parity-absolute-final-v1" as const;

export const VISUAL_REGRESSION_DARK_MODE_SPEC_PATH =
  "tests/visual/dark-mode-parity.spec.ts" as const;

export const VISUAL_REGRESSION_DARK_MODE_WORKFLOW_PATH =
  ".github/workflows/chromatic-visual.yml" as const;

export const VISUAL_REGRESSION_DARK_MODE_FIXTURE_PATH =
  "app/visual-test/dark-mode-parity/page.tsx" as const;

export const VISUAL_REGRESSION_THEME_MODES = ["light", "dark"] as const;

export type VisualRegressionThemeMode = (typeof VISUAL_REGRESSION_THEME_MODES)[number];

export type VisualRegressionDarkModeTarget = {
  id: string;
  path: string;
  testId: string;
  snapshotStem: string;
  description: string;
};

/** Isolated visual-test fixtures snapshotted in both light and dark. */
export const VISUAL_REGRESSION_DARK_MODE_TARGETS: readonly VisualRegressionDarkModeTarget[] = [
  {
    id: "theme_presets",
    path: "/visual-test/theme-presets",
    testId: "visual-theme-presets",
    snapshotStem: "theme-presets",
    description: "Storefront theme preset mini grid",
  },
  {
    id: "nav_tokens",
    path: "/visual-test/nav-tokens",
    testId: "visual-nav-tokens",
    snapshotStem: "nav-tokens",
    description: "Storefront navigation token variants",
  },
  {
    id: "checkout_shell",
    path: "/visual-test/checkout-shell",
    testId: "visual-checkout-shell",
    snapshotStem: "checkout-shell",
    description: "Checkout form and order summary shell",
  },
  {
    id: "collection_preview",
    path: "/visual-test/collection-preview",
    testId: "visual-collection-preview",
    snapshotStem: "collection-preview",
    description: "Collection catalog merchandising controls",
  },
  {
    id: "dark_mode_parity",
    path: "/visual-test/dark-mode-parity",
    testId: "visual-dark-mode-parity",
    snapshotStem: "dark-mode-parity",
    description: "ErrorState, skeleton, and status tokens in both themes",
  },
] as const;

export const VISUAL_REGRESSION_DARK_MODE_CI_SCRIPTS = [
  "test:ci:visual-regression-dark-mode",
  "test:visual:dark-mode",
] as const;

export function visualRegressionSnapshotName(
  stem: string,
  theme: VisualRegressionThemeMode,
): string {
  return `${stem}-${theme}.png`;
}

export function visualRegressionDarkModePairCount(): number {
  return VISUAL_REGRESSION_DARK_MODE_TARGETS.length * VISUAL_REGRESSION_THEME_MODES.length;
}
