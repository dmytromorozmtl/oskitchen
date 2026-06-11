/**
 * Blueprint P1-75 — Square competitive positioning.
 *
 * Canonical line: Enterprise features without enterprise contracts.
 *
 * @see docs/square-positioning.md
 * @see components/marketing/square-positioning-section.tsx
 */

export const SQUARE_POSITIONING_POLICY_ID = "square-positioning-p1-75-v1" as const;

export const SQUARE_POSITIONING_PRIMARY_LINE =
  "Enterprise features without enterprise contracts." as const;

export const SQUARE_POSITIONING_DOC = "docs/square-positioning.md" as const;

export const SQUARE_POSITIONING_COMPARE_PATH = "/compare/square" as const;

export const SQUARE_POSITIONING_CONTENT_PATH =
  "lib/marketing/square-positioning-content.ts" as const;

export const SQUARE_POSITIONING_COMPONENT_PATH =
  "components/marketing/square-positioning-section.tsx" as const;

export const SQUARE_POSITIONING_COMPARE_LANDING =
  "components/marketing/compare-landing.tsx" as const;

export const SQUARE_POSITIONING_PRICING_PAGE =
  "components/marketing/pricing-page.tsx" as const;

export const SQUARE_POSITIONING_SECTION_TEST_ID = "square-positioning-section" as const;

export const SQUARE_POSITIONING_HONESTY_MARKERS = [
  "Square wins",
  "verify",
  "not affiliated",
  "typical",
  "BETA",
] as const;

export const SQUARE_POSITIONING_AUDIT_SCRIPT =
  "scripts/audit-square-positioning.ts" as const;

export const SQUARE_POSITIONING_NPM_SCRIPT = "audit:square-positioning" as const;

export const SQUARE_POSITIONING_UNIT_TEST =
  "tests/unit/square-positioning.test.ts" as const;

export const SQUARE_POSITIONING_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const SQUARE_POSITIONING_WIRING_PATHS = [
  SQUARE_POSITIONING_DOC,
  SQUARE_POSITIONING_CONTENT_PATH,
  SQUARE_POSITIONING_COMPONENT_PATH,
  SQUARE_POSITIONING_COMPARE_LANDING,
  SQUARE_POSITIONING_PRICING_PAGE,
  "lib/marketing/compare-content.ts",
  "lib/marketing/square-positioning-policy.ts",
  "lib/marketing/square-positioning-audit.ts",
  SQUARE_POSITIONING_UNIT_TEST,
] as const;
