/**
 * Absolute Final Task 81 — commission comparison calculator.
 *
 * @see app/commission-comparison/page.tsx
 * @see lib/delivery/delivery-commission-tracking-absolute-final-policy.ts
 */

export const COMMISSION_COMPARISON_CALCULATOR_ABSOLUTE_FINAL_POLICY_ID =
  "commission-comparison-calculator-absolute-final-v1" as const;

export const COMMISSION_COMPARISON_CALCULATOR_ROUTE = "/commission-comparison" as const;

export const COMMISSION_COMPARISON_CALCULATOR_PAGE_PATH =
  "app/commission-comparison/page.tsx" as const;

export const COMMISSION_COMPARISON_CALCULATOR_COMPONENT_PATH =
  "components/marketing/commission-comparison-calculator.tsx" as const;

export const COMMISSION_COMPARISON_CALCULATOR_CONTENT_PATH =
  "lib/marketing/commission-comparison-calculator-content.ts" as const;

export const COMMISSION_COMPARISON_PRICING_PAGE_PATH =
  "components/marketing/pricing-page.tsx" as const;

export const COMMISSION_COMPARISON_DASHBOARD_ROUTE =
  "/dashboard/analytics/delivery-commissions" as const;

export const COMMISSION_COMPARISON_UPSTREAM_POLICY =
  "lib/delivery/delivery-commission-tracking-absolute-final-policy.ts" as const;

export const COMMISSION_COMPARISON_REQUIRED_MARKERS = [
  'data-testid="commission-comparison-calculator"',
  "CommissionComparisonCalculator",
] as const;

export const COMMISSION_COMPARISON_HONESTY_MARKERS = [
  "estimated benchmark",
  "settlement statement",
  "Directional",
  "not guaranteed",
] as const;

export const COMMISSION_COMPARISON_WIRING_PATHS = [
  COMMISSION_COMPARISON_CALCULATOR_PAGE_PATH,
  COMMISSION_COMPARISON_CALCULATOR_COMPONENT_PATH,
  COMMISSION_COMPARISON_CALCULATOR_CONTENT_PATH,
  COMMISSION_COMPARISON_PRICING_PAGE_PATH,
  COMMISSION_COMPARISON_UPSTREAM_POLICY,
  "lib/marketing/commission-comparison-calculator-absolute-final-policy.ts",
  "lib/marketing/commission-comparison-calculator-audit.ts",
  "tests/unit/commission-comparison-calculator-absolute-final.test.ts",
] as const;

export const COMMISSION_COMPARISON_CALCULATOR_UNIT_TEST =
  "tests/unit/commission-comparison-calculator-absolute-final.test.ts" as const;

export const COMMISSION_COMPARISON_CALCULATOR_CI_SCRIPTS = [
  "test:ci:commission-comparison-calculator",
  "test:ci:commission-comparison-calculator:cert",
] as const;
