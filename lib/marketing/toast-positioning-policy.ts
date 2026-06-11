/**
 * Blueprint P1-74 — Toast competitive positioning.
 *
 * Canonical line: Hardware shouldn't lock you in.
 *
 * @see docs/toast-positioning.md
 * @see components/marketing/toast-positioning-section.tsx
 */

export const TOAST_POSITIONING_POLICY_ID = "toast-positioning-p1-74-v1" as const;

export const TOAST_POSITIONING_PRIMARY_LINE =
  "Hardware shouldn't lock you in." as const;

export const TOAST_POSITIONING_DOC = "docs/toast-positioning.md" as const;

export const TOAST_POSITIONING_COMPARE_PATH = "/compare/toast" as const;

export const TOAST_POSITIONING_HARDWARE_DOC = "docs/no-hardware-lock-in-positioning.md" as const;

export const TOAST_POSITIONING_CONTENT_PATH =
  "lib/marketing/toast-positioning-content.ts" as const;

export const TOAST_POSITIONING_COMPONENT_PATH =
  "components/marketing/toast-positioning-section.tsx" as const;

export const TOAST_POSITIONING_COMPARE_LANDING =
  "components/marketing/compare-landing.tsx" as const;

export const TOAST_POSITIONING_PRICING_PAGE =
  "components/marketing/pricing-page.tsx" as const;

export const TOAST_POSITIONING_SECTION_TEST_ID = "toast-positioning-section" as const;

export const TOAST_POSITIONING_HONESTY_MARKERS = [
  "Toast wins",
  "verify",
  "not affiliated",
  "typical",
  "BETA",
] as const;

export const TOAST_POSITIONING_AUDIT_SCRIPT =
  "scripts/audit-toast-positioning.ts" as const;

export const TOAST_POSITIONING_NPM_SCRIPT = "audit:toast-positioning" as const;

export const TOAST_POSITIONING_UNIT_TEST =
  "tests/unit/toast-positioning.test.ts" as const;

export const TOAST_POSITIONING_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const TOAST_POSITIONING_WIRING_PATHS = [
  TOAST_POSITIONING_DOC,
  TOAST_POSITIONING_HARDWARE_DOC,
  TOAST_POSITIONING_CONTENT_PATH,
  TOAST_POSITIONING_COMPONENT_PATH,
  TOAST_POSITIONING_COMPARE_LANDING,
  TOAST_POSITIONING_PRICING_PAGE,
  "lib/marketing/compare-content.ts",
  "lib/marketing/toast-positioning-policy.ts",
  "lib/marketing/toast-positioning-audit.ts",
  TOAST_POSITIONING_UNIT_TEST,
] as const;
