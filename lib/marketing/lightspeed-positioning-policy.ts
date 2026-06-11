/**
 * Blueprint P1-76 — Lightspeed competitive positioning.
 *
 * Canonical line: Built for food operators.
 *
 * @see docs/lightspeed-positioning.md
 * @see components/marketing/lightspeed-positioning-section.tsx
 */

export const LIGHTSPEED_POSITIONING_POLICY_ID = "lightspeed-positioning-p1-76-v1" as const;

export const LIGHTSPEED_POSITIONING_PRIMARY_LINE =
  "Built for food operators." as const;

export const LIGHTSPEED_POSITIONING_DOC = "docs/lightspeed-positioning.md" as const;

export const LIGHTSPEED_POSITIONING_COMPARE_PATH =
  "/compare/kitchenos-vs-lightspeed" as const;

export const LIGHTSPEED_POSITIONING_CONTENT_PATH =
  "lib/marketing/lightspeed-positioning-content.ts" as const;

export const LIGHTSPEED_POSITIONING_COMPONENT_PATH =
  "components/marketing/lightspeed-positioning-section.tsx" as const;

export const LIGHTSPEED_POSITIONING_COMPARE_LANDING =
  "components/marketing/compare-landing.tsx" as const;

export const LIGHTSPEED_POSITIONING_PRICING_PAGE =
  "components/marketing/pricing-page.tsx" as const;

export const LIGHTSPEED_POSITIONING_SECTION_TEST_ID =
  "lightspeed-positioning-section" as const;

export const LIGHTSPEED_POSITIONING_HONESTY_MARKERS = [
  "Lightspeed wins",
  "verify",
  "not affiliated",
  "typical",
  "BETA",
] as const;

export const LIGHTSPEED_POSITIONING_AUDIT_SCRIPT =
  "scripts/audit-lightspeed-positioning.ts" as const;

export const LIGHTSPEED_POSITIONING_NPM_SCRIPT = "audit:lightspeed-positioning" as const;

export const LIGHTSPEED_POSITIONING_UNIT_TEST =
  "tests/unit/lightspeed-positioning.test.ts" as const;

export const LIGHTSPEED_POSITIONING_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const LIGHTSPEED_POSITIONING_WIRING_PATHS = [
  LIGHTSPEED_POSITIONING_DOC,
  LIGHTSPEED_POSITIONING_CONTENT_PATH,
  LIGHTSPEED_POSITIONING_COMPONENT_PATH,
  LIGHTSPEED_POSITIONING_COMPARE_LANDING,
  LIGHTSPEED_POSITIONING_PRICING_PAGE,
  "lib/marketing/compare-content.ts",
  "lib/marketing/lightspeed-positioning-policy.ts",
  "lib/marketing/lightspeed-positioning-audit.ts",
  LIGHTSPEED_POSITIONING_UNIT_TEST,
] as const;
