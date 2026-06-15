import {
  COMMISSION_COMPARISON_CALCULATOR_P3_148_FEATURE_COUNT,
  COMMISSION_COMPARISON_CALCULATOR_P3_148_PUBLIC_ROUTE,
  COMMISSION_COMPARISON_CALCULATOR_P3_148_ROUTE,
  type CommissionComparisonCalculatorFeatureId,
} from "@/lib/marketing/commission-comparison-calculator-p3-148-policy";

export const COMMISSION_COMPARISON_CALCULATOR_P3_148_EYEBROW =
  "ChowNow parity · commission comparison" as const;

export const COMMISSION_COMPARISON_CALCULATOR_P3_148_SUBLINE =
  "Six calculator surfaces — channel mix, marketplace benchmark rates, owned-channel processing, annual delta, live commission tracking, and commission-free messaging. Directional illustration only — verify settlement statements before outbound savings claims." as const;

export type CommissionComparisonCalculatorFeature = {
  id: CommissionComparisonCalculatorFeatureId;
  label: string;
  route: string;
  testId: string;
  chownowTypical: string;
  osKitchenStatus: string;
};

export const COMMISSION_COMPARISON_CALCULATOR_P3_148_FEATURES: readonly CommissionComparisonCalculatorFeature[] =
  [
    {
      id: "channel_mix",
      label: "Channel mix inputs",
      route: COMMISSION_COMPARISON_CALCULATOR_P3_148_PUBLIC_ROUTE,
      testId: "commission-comparison-channel-mix",
      chownowTypical: "Marketplace vs owned online ordering split",
      osKitchenStatus: "shipped",
    },
    {
      id: "marketplace_benchmark",
      label: "Marketplace benchmark",
      route: COMMISSION_COMPARISON_CALCULATOR_P3_148_PUBLIC_ROUTE,
      testId: "commission-comparison-marketplace-benchmark",
      chownowTypical: "Commission-friendly storefront positioning",
      osKitchenStatus: "shipped",
    },
    {
      id: "owned_channel_compare",
      label: "Owned channel compare",
      route: "/dashboard/marketing/commission-free-ordering",
      testId: "commission-comparison-owned-channel",
      chownowTypical: "0% platform commission on direct orders",
      osKitchenStatus: "shipped",
    },
    {
      id: "annual_delta",
      label: "Annual delta projection",
      route: COMMISSION_COMPARISON_CALCULATOR_P3_148_PUBLIC_ROUTE,
      testId: "commission-comparison-annual-delta",
      chownowTypical: "Savings narrative for sales calls",
      osKitchenStatus: "shipped",
    },
    {
      id: "live_commissions",
      label: "Live commission tracking",
      route: "/dashboard/analytics/delivery-commissions",
      testId: "commission-comparison-live-commissions",
      chownowTypical: "Settlement reconciliation dashboard",
      osKitchenStatus: "shipped",
    },
    {
      id: "commission_free_messaging",
      label: "Commission-free messaging",
      route: "/dashboard/marketing/commission-free-ordering",
      testId: "commission-comparison-free-messaging",
      chownowTypical: "Guest-facing owned-channel copy",
      osKitchenStatus: "BETA",
    },
  ] as const;

export function assertCommissionComparisonCalculatorFeatureCount(): boolean {
  return (
    COMMISSION_COMPARISON_CALCULATOR_P3_148_FEATURES.length ===
    COMMISSION_COMPARISON_CALCULATOR_P3_148_FEATURE_COUNT
  );
}

export const COMMISSION_COMPARISON_CALCULATOR_P3_148_OPERATOR_LINKS = [
  { label: "Calculator hub", href: COMMISSION_COMPARISON_CALCULATOR_P3_148_ROUTE },
  { label: "Public calculator", href: COMMISSION_COMPARISON_CALCULATOR_P3_148_PUBLIC_ROUTE },
  { label: "Commission-free ordering", href: "/dashboard/marketing/commission-free-ordering" },
] as const;
