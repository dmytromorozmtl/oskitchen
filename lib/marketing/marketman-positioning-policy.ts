/**
 * Blueprint P1-77 — MarketMan competitive positioning.
 *
 * Canonical line: Full OS — including marketplace.
 *
 * @see docs/marketman-positioning.md
 * @see components/marketing/marketman-positioning-section.tsx
 */

export const MARKETMAN_POSITIONING_POLICY_ID = "marketman-positioning-p1-77-v1" as const;

export const MARKETMAN_POSITIONING_PRIMARY_LINE =
  "Full OS — including marketplace." as const;

export const MARKETMAN_POSITIONING_DOC = "docs/marketman-positioning.md" as const;

export const MARKETMAN_POSITIONING_COMPARE_PATH = "/compare/marketman" as const;

export const MARKETMAN_POSITIONING_CONTENT_PATH =
  "lib/marketing/marketman-positioning-content.ts" as const;

export const MARKETMAN_POSITIONING_COMPONENT_PATH =
  "components/marketing/marketman-positioning-section.tsx" as const;

export const MARKETMAN_POSITIONING_COMPARE_LANDING =
  "components/marketing/compare-landing.tsx" as const;

export const MARKETMAN_POSITIONING_PRICING_PAGE =
  "components/marketing/pricing-page.tsx" as const;

export const MARKETMAN_POSITIONING_SECTION_TEST_ID =
  "marketman-positioning-section" as const;

export const MARKETMAN_POSITIONING_HONESTY_MARKERS = [
  "MarketMan wins",
  "verify",
  "not affiliated",
  "typical",
  "BETA",
] as const;

export const MARKETMAN_POSITIONING_AUDIT_SCRIPT =
  "scripts/audit-marketman-positioning.ts" as const;

export const MARKETMAN_POSITIONING_NPM_SCRIPT = "audit:marketman-positioning" as const;

export const MARKETMAN_POSITIONING_UNIT_TEST =
  "tests/unit/marketman-positioning.test.ts" as const;

export const MARKETMAN_POSITIONING_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const MARKETMAN_POSITIONING_WIRING_PATHS = [
  MARKETMAN_POSITIONING_DOC,
  MARKETMAN_POSITIONING_CONTENT_PATH,
  MARKETMAN_POSITIONING_COMPONENT_PATH,
  MARKETMAN_POSITIONING_COMPARE_LANDING,
  MARKETMAN_POSITIONING_PRICING_PAGE,
  "lib/marketing/compare-content.ts",
  "lib/marketing/marketman-positioning-policy.ts",
  "lib/marketing/marketman-positioning-audit.ts",
  MARKETMAN_POSITIONING_UNIT_TEST,
] as const;
