/**
 * P2-54 — Commission comparison calculator: volume → savings vs DoorDash / Uber Eats.
 *
 * @see docs/commission-comparison-calculator-p2-54.md
 * @see components/marketing/commission-comparison-doordash-uber-panel.tsx
 */

import { COMMISSION_COMPARISON_CALCULATOR_P2_46_PUBLIC_ROUTE } from "@/lib/marketing/commission-comparison-calculator-p2-46-policy";

export const COMMISSION_COMPARISON_CALCULATOR_P2_54_POLICY_ID =
  "commission-comparison-calculator-p2-54-v1" as const;

export const COMMISSION_COMPARISON_CALCULATOR_P2_54_DOC =
  "docs/commission-comparison-calculator-p2-54.md" as const;

export const COMMISSION_COMPARISON_CALCULATOR_P2_54_ARTIFACT =
  "artifacts/commission-comparison-calculator-p2-54.json" as const;

export const COMMISSION_COMPARISON_CALCULATOR_P2_54_PUBLIC_ROUTE =
  COMMISSION_COMPARISON_CALCULATOR_P2_46_PUBLIC_ROUTE;

export const COMMISSION_COMPARISON_CALCULATOR_P2_54_PANEL =
  "components/marketing/commission-comparison-doordash-uber-panel.tsx" as const;

export const COMMISSION_COMPARISON_CALCULATOR_P2_54_LANDING =
  "components/marketing/commission-comparison-landing.tsx" as const;

export const COMMISSION_COMPARISON_CALCULATOR_P2_54_MEASUREMENT_MODULE =
  "lib/marketing/commission-comparison-calculator-p2-54-measurement.ts" as const;

export const COMMISSION_COMPARISON_CALCULATOR_P2_54_AUDIT_MODULE =
  "lib/marketing/commission-comparison-calculator-p2-54-audit.ts" as const;

export const COMMISSION_COMPARISON_CALCULATOR_P2_54_CHECK_NPM_SCRIPT =
  "check:commission-comparison-calculator-p2-54" as const;

export const COMMISSION_COMPARISON_CALCULATOR_P2_54_CI_NPM_SCRIPT =
  "test:ci:commission-comparison-calculator-p2-54" as const;

export const COMMISSION_COMPARISON_CALCULATOR_P2_54_UNIT_TEST =
  "tests/unit/commission-comparison-calculator-p2-54.test.ts" as const;

export const COMMISSION_COMPARISON_CALCULATOR_P2_54_CI_WORKFLOW =
  ".github/workflows/ci.yml" as const;

export const COMMISSION_COMPARISON_CALCULATOR_P2_54_ROOT_TEST_ID =
  "commission-comparison-doordash-uber-p2-54" as const;

export const COMMISSION_COMPARISON_CALCULATOR_P2_54_SAVINGS_TEST_ID =
  "commission-comparison-doordash-uber-savings" as const;

/** Directional DoorDash benchmark for public calculator (ChowNow-style headline rate). */
export const COMMISSION_COMPARISON_CALCULATOR_P2_54_DOORDASH_BENCHMARK_PCT = 30 as const;

/** Directional Uber Eats benchmark — same source as delivery-commissions dashboard. */
export const COMMISSION_COMPARISON_CALCULATOR_P2_54_UBER_EATS_BENCHMARK_PCT = 25 as const;

export const COMMISSION_COMPARISON_CALCULATOR_P2_54_OWNED_MARKETPLACE_PCT = 0 as const;

export const COMMISSION_COMPARISON_CALCULATOR_P2_54_DEFAULT_PROCESSING_PCT = 2.9 as const;

export const COMMISSION_COMPARISON_CALCULATOR_P2_54_FLOW_STEPS = [
  "enter_delivery_volume",
  "compare_doordash_commission",
  "compare_uber_eats_commission",
  "combined_savings_vs_owned",
] as const;

export const COMMISSION_COMPARISON_CALCULATOR_P2_54_HONESTY_MARKERS = [
  "Directional",
  "not guaranteed",
  "settlement statement",
  "verify",
] as const;

export const COMMISSION_COMPARISON_CALCULATOR_P2_54_WIRING_PATHS = [
  COMMISSION_COMPARISON_CALCULATOR_P2_54_DOC,
  COMMISSION_COMPARISON_CALCULATOR_P2_54_ARTIFACT,
  COMMISSION_COMPARISON_CALCULATOR_P2_54_AUDIT_MODULE,
  COMMISSION_COMPARISON_CALCULATOR_P2_54_MEASUREMENT_MODULE,
  COMMISSION_COMPARISON_CALCULATOR_P2_54_PANEL,
  COMMISSION_COMPARISON_CALCULATOR_P2_54_LANDING,
  COMMISSION_COMPARISON_CALCULATOR_P2_54_UNIT_TEST,
  "app/commission-comparison/page.tsx",
  "components/marketing/commission-comparison-calculator.tsx",
] as const;
