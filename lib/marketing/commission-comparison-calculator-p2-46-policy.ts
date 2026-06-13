/**
 * Blueprint P2-46 — Commission comparison calculator (ChowNow parity).
 *
 * DoorDash 30% vs owned channel 0% marketplace commission.
 *
 * @see docs/commission-comparison-calculator-p2-46.md
 */

export const COMMISSION_COMPARISON_CALCULATOR_P2_46_POLICY_ID =
  "commission-comparison-calculator-p2-46-v1" as const;

export const COMMISSION_COMPARISON_CALCULATOR_P2_46_DOC =
  "docs/commission-comparison-calculator-p2-46.md" as const;

export const COMMISSION_COMPARISON_CALCULATOR_P2_46_ARTIFACT =
  "artifacts/commission-comparison-calculator-p2-46-registry.json" as const;

export const COMMISSION_COMPARISON_CALCULATOR_P2_46_PUBLIC_ROUTE = "/commission-comparison" as const;

export const COMMISSION_COMPARISON_CALCULATOR_P2_46_DASHBOARD_ROUTE =
  "/dashboard/marketing/commission-comparison" as const;

export const COMMISSION_COMPARISON_CALCULATOR_P2_46_PANEL =
  "components/marketing/commission-comparison-doordash-panel.tsx" as const;

export const COMMISSION_COMPARISON_CALCULATOR_P2_46_PUBLIC_PAGE =
  "app/commission-comparison/page.tsx" as const;

export const COMMISSION_COMPARISON_CALCULATOR_P2_46_DOORDASH_BENCHMARK_PCT = 30 as const;

export const COMMISSION_COMPARISON_CALCULATOR_P2_46_OWNED_MARKETPLACE_PCT = 0 as const;

export const COMMISSION_COMPARISON_CALCULATOR_P2_46_DEFAULT_PROCESSING_PCT = 2.9 as const;

export const COMMISSION_COMPARISON_CALCULATOR_P2_46_ROOT_TEST_ID =
  "commission-comparison-doordash-p2-46" as const;

export const COMMISSION_COMPARISON_CALCULATOR_P2_46_SAVINGS_TEST_ID =
  "commission-comparison-doordash-savings" as const;

export const COMMISSION_COMPARISON_CALCULATOR_P2_46_AUDIT_SCRIPT =
  "scripts/audit-commission-comparison-calculator-p2-46.ts" as const;

export const COMMISSION_COMPARISON_CALCULATOR_P2_46_NPM_SCRIPT =
  "audit:commission-comparison-calculator-p2-46" as const;

export const COMMISSION_COMPARISON_CALCULATOR_P2_46_CHECK_NPM_SCRIPT =
  "check:commission-comparison-calculator-p2-46" as const;

export const COMMISSION_COMPARISON_CALCULATOR_P2_46_UNIT_TEST =
  "tests/unit/commission-comparison-calculator-p2-46.test.ts" as const;

export const COMMISSION_COMPARISON_CALCULATOR_P2_46_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const COMMISSION_COMPARISON_CALCULATOR_P2_46_FLOW_STEPS = [
  "enter_delivery_volume",
  "compare_doordash_30",
  "compare_owned_0_marketplace",
  "annual_savings_delta",
] as const;

export const COMMISSION_COMPARISON_CALCULATOR_P2_46_HONESTY_MARKERS = [
  "ChowNow parity",
  "Directional",
  "not guaranteed",
  "verify",
  "settlement statement",
] as const;

export const COMMISSION_COMPARISON_CALCULATOR_P2_46_WIRING_PATHS = [
  COMMISSION_COMPARISON_CALCULATOR_P2_46_DOC,
  "lib/marketing/commission-comparison-calculator-p2-46-audit.ts",
  "lib/marketing/commission-comparison-calculator-p2-46-measurement.ts",
  COMMISSION_COMPARISON_CALCULATOR_P2_46_PANEL,
  COMMISSION_COMPARISON_CALCULATOR_P2_46_UNIT_TEST,
  COMMISSION_COMPARISON_CALCULATOR_P2_46_ARTIFACT,
] as const;
