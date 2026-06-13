/**
 * Blueprint P1-30 — Public Design Partner tier on /pricing.
 *
 * @see docs/pricing-page-p1-30.md
 */

export const PRICING_PAGE_P1_30_POLICY_ID = "pricing-page-p1-30-v1" as const;

export const PRICING_PAGE_P1_30_DOC = "docs/pricing-page-p1-30.md" as const;

export const PRICING_PAGE_P1_30_ROUTE = "/pricing" as const;

export const PRICING_PAGE_P1_30_COMPONENT =
  "components/marketing/design-partner-pricing-tier.tsx" as const;

export const PRICING_PAGE_P1_30_CONTENT_PATH =
  "lib/marketing/pricing-page-p1-30-content.ts" as const;

export const PRICING_PAGE_P1_30_PAGE = "app/pricing/page.tsx" as const;

export const PRICING_PAGE_P1_30_PRICING_PAGE = "components/marketing/pricing-page.tsx" as const;

export const PRICING_PAGE_P1_30_TIER_TEST_ID = "pricing-design-partner-tier" as const;

export const PRICING_PAGE_P1_30_SKU = "LOI-DP-001" as const;

export const PRICING_PAGE_P1_30_HONESTY_MARKERS = [
  "non-binding",
  "BETA",
  "verify",
  "ICP",
  "honest",
] as const;

export const PRICING_PAGE_P1_30_AUDIT_SCRIPT = "scripts/audit-pricing-page-p1-30.ts" as const;

export const PRICING_PAGE_P1_30_NPM_SCRIPT = "audit:pricing-page" as const;

export const PRICING_PAGE_P1_30_CHECK_NPM_SCRIPT = "check:pricing-page" as const;

export const PRICING_PAGE_P1_30_UNIT_TEST = "tests/unit/pricing-page-p1-30.test.ts" as const;

export const PRICING_PAGE_P1_30_CI_WORKFLOW = ".github/workflows/deploy-prod-gate.yml" as const;

export const PRICING_PAGE_P1_30_WIRING_PATHS = [
  PRICING_PAGE_P1_30_DOC,
  PRICING_PAGE_P1_30_CONTENT_PATH,
  PRICING_PAGE_P1_30_COMPONENT,
  PRICING_PAGE_P1_30_PAGE,
  PRICING_PAGE_P1_30_PRICING_PAGE,
  "lib/marketing/pricing-page-p1-30-policy.ts",
  "lib/marketing/pricing-page-p1-30-audit.ts",
  PRICING_PAGE_P1_30_UNIT_TEST,
  "lib/marketing/pilot-pricing-skus.ts",
] as const;
