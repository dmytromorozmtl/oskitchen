/**
 * Blueprint P1-78 — MarginEdge competitive positioning.
 *
 * Canonical line: Invoice AI is a feature, not a product.
 *
 * @see docs/marginedge-positioning.md
 * @see components/marketing/marginedge-positioning-section.tsx
 */

export const MARGINEDGE_POSITIONING_POLICY_ID = "marginedge-positioning-p1-78-v1" as const;

export const MARGINEDGE_POSITIONING_PRIMARY_LINE =
  "Invoice AI is a feature, not a product." as const;

export const MARGINEDGE_POSITIONING_DOC = "docs/marginedge-positioning.md" as const;

export const MARGINEDGE_POSITIONING_COMPARE_PATH = "/compare/marginedge" as const;

export const MARGINEDGE_POSITIONING_CONTENT_PATH =
  "lib/marketing/marginedge-positioning-content.ts" as const;

export const MARGINEDGE_POSITIONING_COMPONENT_PATH =
  "components/marketing/marginedge-positioning-section.tsx" as const;

export const MARGINEDGE_POSITIONING_COMPARE_LANDING =
  "components/marketing/compare-landing.tsx" as const;

export const MARGINEDGE_POSITIONING_PRICING_PAGE =
  "components/marketing/pricing-page.tsx" as const;

export const MARGINEDGE_POSITIONING_SECTION_TEST_ID =
  "marginedge-positioning-section" as const;

export const MARGINEDGE_POSITIONING_HONESTY_MARKERS = [
  "MarginEdge wins",
  "verify",
  "not affiliated",
  "typical",
  "BETA",
] as const;

export const MARGINEDGE_POSITIONING_AUDIT_SCRIPT =
  "scripts/audit-marginedge-positioning.ts" as const;

export const MARGINEDGE_POSITIONING_NPM_SCRIPT = "audit:marginedge-positioning" as const;

export const MARGINEDGE_POSITIONING_UNIT_TEST =
  "tests/unit/marginedge-positioning.test.ts" as const;

export const MARGINEDGE_POSITIONING_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const MARGINEDGE_POSITIONING_WIRING_PATHS = [
  MARGINEDGE_POSITIONING_DOC,
  MARGINEDGE_POSITIONING_CONTENT_PATH,
  MARGINEDGE_POSITIONING_COMPONENT_PATH,
  MARGINEDGE_POSITIONING_COMPARE_LANDING,
  MARGINEDGE_POSITIONING_PRICING_PAGE,
  "lib/marketing/compare-content.ts",
  "lib/marketing/marginedge-positioning-policy.ts",
  "lib/marketing/marginedge-positioning-audit.ts",
  MARGINEDGE_POSITIONING_UNIT_TEST,
] as const;
