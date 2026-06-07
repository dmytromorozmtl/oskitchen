/**
 * Absolute Final Task 147 — full accessibility audit (WCAG 2.1 AA).
 *
 * @see docs/accessibility-audit.md
 * @see tests/unit/absolute-final-wcag-21-aa-accessibility.test.ts
 */

import { E2E_ACCESSIBILITY_AXE_WCAG_TAGS } from "@/lib/accessibility/e2e-accessibility-axe-policy";

export const WCAG_21_AA_ABSOLUTE_FINAL_POLICY_ID =
  "absolute-final-wcag-21-aa-v1" as const;

export const WCAG_21_AA_TARGET_LEVEL = "WCAG 2.1 AA" as const;

export const WCAG_21_AA_DOC_PATH = "docs/accessibility-audit.md" as const;

/** axe-core tags that map to WCAG 2.1 Level A + AA. */
export const WCAG_21_AA_AXE_TAGS = E2E_ACCESSIBILITY_AXE_WCAG_TAGS;

export const WCAG_21_AA_SERIOUS_VIOLATION_GATE = 0 as const;

export const WCAG_21_AA_WIRING_PATHS = [
  WCAG_21_AA_DOC_PATH,
  "lib/accessibility/absolute-final-wcag-21-aa-policy.ts",
  "lib/accessibility/absolute-final-wcag-21-aa-audit.ts",
  "lib/accessibility/e2e-accessibility-axe-policy.ts",
  "lib/accessibility/skip-link-main-landmark-policy.ts",
  "lib/accessibility/axe-playwright-analyze.ts",
  "e2e/dashboard-accessibility-axe.spec.ts",
  "e2e/accessibility.spec.ts",
  "tests/e2e/a11y-marketing.spec.ts",
  "tests/e2e/a11y-auth-shell.spec.ts",
  ".github/workflows/e2e-accessibility-axe.yml",
  "tests/unit/absolute-final-wcag-21-aa-accessibility.test.ts",
  "tests/unit/e2e-accessibility-axe-policy.test.ts",
  "tests/unit/skip-link-main-landmark.test.ts",
  "tests/unit/accessibility-improvements.test.ts",
  "tests/unit/pos-terminal-icon-buttons.test.ts",
] as const;

export const WCAG_21_AA_UNIT_TEST =
  "tests/unit/absolute-final-wcag-21-aa-accessibility.test.ts" as const;

export const WCAG_21_AA_CI_SCRIPTS = [
  "test:ci:wcag-21-aa-absolute-final",
  "test:ci:wcag-21-aa-absolute-final:cert",
] as const;

export const WCAG_21_AA_MANUAL_GATE_NOTE =
  "Automated axe-core only — not a legal compliance certification; VoiceOver spot check before enterprise pilot." as const;
