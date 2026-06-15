/**
 * Blueprint P3-148 — Commission comparison calculator (ChowNow parity baseline).
 *
 * @see docs/commission-comparison-calculator-chownow.md
 */

export const COMMISSION_COMPARISON_CALCULATOR_P3_148_POLICY_ID =
  "commission-comparison-calculator-p3-148-v1" as const;

export const COMMISSION_COMPARISON_CALCULATOR_P3_148_DOC =
  "docs/commission-comparison-calculator-chownow.md" as const;

export const COMMISSION_COMPARISON_CALCULATOR_P3_148_ARTIFACT =
  "artifacts/commission-comparison-calculator-registry.json" as const;

export const COMMISSION_COMPARISON_CALCULATOR_P3_148_AUDIT_SCRIPT =
  "scripts/audit-commission-comparison-calculator-p3-148.ts" as const;

export const COMMISSION_COMPARISON_CALCULATOR_P3_148_NPM_SCRIPT =
  "audit:commission-comparison-calculator-p3-148" as const;

export const COMMISSION_COMPARISON_CALCULATOR_P3_148_UNIT_TEST =
  "tests/unit/commission-comparison-calculator-p3-148.test.ts" as const;

export const COMMISSION_COMPARISON_CALCULATOR_P3_148_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const COMMISSION_COMPARISON_CALCULATOR_P3_148_COMPETITOR = "chownow" as const;

export const COMMISSION_COMPARISON_CALCULATOR_P3_148_POSITIONING_LINE =
  "Full kitchen OS underneath owned channel — not ChowNow ordering-only." as const;

export const COMMISSION_COMPARISON_CALCULATOR_P3_148_HEADLINE =
  "Commission comparison calculator — ChowNow parity baseline" as const;

export const COMMISSION_COMPARISON_CALCULATOR_P3_148_PUBLIC_ROUTE =
  "/commission-comparison" as const;

export const COMMISSION_COMPARISON_CALCULATOR_P3_148_ROUTE =
  "/dashboard/marketing/commission-comparison" as const;

export const COMMISSION_COMPARISON_CALCULATOR_P3_148_IMPLEMENTATION_REF =
  "commission-comparison-calculator-absolute-final-v1" as const;

export const COMMISSION_COMPARISON_CALCULATOR_P3_148_SECONDARY_REF =
  "commission-free-ordering-p2-113-v1" as const;

export const COMMISSION_COMPARISON_CALCULATOR_P3_148_FEATURE_COUNT = 6 as const;

export const COMMISSION_COMPARISON_CALCULATOR_P3_148_FEATURE_IDS = [
  "channel_mix",
  "marketplace_benchmark",
  "owned_channel_compare",
  "annual_delta",
  "live_commissions",
  "commission_free_messaging",
] as const;

export type CommissionComparisonCalculatorFeatureId =
  (typeof COMMISSION_COMPARISON_CALCULATOR_P3_148_FEATURE_IDS)[number];

export const COMMISSION_COMPARISON_CALCULATOR_P3_148_TEST_IDS = [
  "commission-comparison-chownow",
  "commission-comparison-channel-mix",
  "commission-comparison-marketplace-benchmark",
  "commission-comparison-owned-channel",
  "commission-comparison-annual-delta",
  "commission-comparison-live-commissions",
  "commission-comparison-free-messaging",
] as const;

export const COMMISSION_COMPARISON_CALCULATOR_P3_148_COMPONENT =
  "components/marketing/commission-comparison-calculator-panel.tsx" as const;

export const COMMISSION_COMPARISON_CALCULATOR_P3_148_PAGE =
  "app/dashboard/marketing/commission-comparison/page.tsx" as const;

export const COMMISSION_COMPARISON_CALCULATOR_P3_148_LEGACY_CALCULATOR =
  "components/marketing/commission-comparison-calculator.tsx" as const;

export const COMMISSION_COMPARISON_CALCULATOR_P3_148_LEGACY_PUBLIC_PAGE =
  "app/commission-comparison/page.tsx" as const;

export const COMMISSION_COMPARISON_CALCULATOR_P3_148_LEGACY_ABSOLUTE_FINAL =
  "lib/marketing/commission-comparison-calculator-absolute-final-policy.ts" as const;

export const COMMISSION_COMPARISON_CALCULATOR_P3_148_LEGACY_COMMISSION_FREE =
  "lib/marketing/commission-free-ordering-p2-113-policy.ts" as const;

export const COMMISSION_COMPARISON_CALCULATOR_P3_148_LIVE_CALCULATOR_AUDIT =
  "audit:commission-comparison-calculator" as const;

export const COMMISSION_COMPARISON_CALCULATOR_P3_148_LIVE_COMMISSION_FREE_AUDIT =
  "audit:commission-free-ordering-p2-113" as const;

export const COMMISSION_COMPARISON_CALCULATOR_P3_148_RELATED_DOCS = [
  "docs/competitor-battle-cards/chownow.md",
  "docs/commission-free-ordering-messaging.md",
  "lib/marketing/commission-comparison-calculator-content.ts",
  "lib/marketing/commission-comparison-calculator-absolute-final-policy.ts",
  "components/marketing/commission-comparison-calculator.tsx",
  "app/commission-comparison/page.tsx",
] as const;

export const COMMISSION_COMPARISON_CALCULATOR_P3_148_HONESTY_MARKERS = [
  "not affiliated",
  "0 signed LOIs",
  "Directional",
  "not guaranteed",
  "verify",
  "estimated benchmark",
] as const;

export const COMMISSION_COMPARISON_CALCULATOR_P3_148_WIRING_PATHS = [
  COMMISSION_COMPARISON_CALCULATOR_P3_148_DOC,
  "lib/marketing/commission-comparison-calculator-p3-148-policy.ts",
  "lib/marketing/commission-comparison-calculator-p3-148-content.ts",
  "lib/marketing/commission-comparison-calculator-p3-148-operations.ts",
  "lib/marketing/commission-comparison-calculator-p3-148-audit.ts",
  COMMISSION_COMPARISON_CALCULATOR_P3_148_ARTIFACT,
  COMMISSION_COMPARISON_CALCULATOR_P3_148_UNIT_TEST,
  COMMISSION_COMPARISON_CALCULATOR_P3_148_COMPONENT,
  COMMISSION_COMPARISON_CALCULATOR_P3_148_PAGE,
  COMMISSION_COMPARISON_CALCULATOR_P3_148_LEGACY_CALCULATOR,
  COMMISSION_COMPARISON_CALCULATOR_P3_148_LEGACY_PUBLIC_PAGE,
  COMMISSION_COMPARISON_CALCULATOR_P3_148_LEGACY_ABSOLUTE_FINAL,
  COMMISSION_COMPARISON_CALCULATOR_P3_148_LEGACY_COMMISSION_FREE,
] as const;
