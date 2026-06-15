import type { Metadata } from "next";

import { CommissionComparisonCalculatorPanel } from "@/components/marketing/commission-comparison-calculator-panel";
import {
  COMMISSION_COMPARISON_CALCULATOR_P3_148_HEADLINE,
  COMMISSION_COMPARISON_CALCULATOR_P3_148_POLICY_ID,
  COMMISSION_COMPARISON_CALCULATOR_P3_148_ROUTE,
} from "@/lib/marketing/commission-comparison-calculator-p3-148-policy";

export const metadata: Metadata = {
  title: "Commission comparison — ChowNow parity",
  description:
    "ChowNow parity commission comparison at /dashboard/marketing/commission-comparison — channel mix, marketplace benchmark, and owned-channel delta.",
};

export default function CommissionComparisonDashboardPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
      <CommissionComparisonCalculatorPanel />
      <p className="sr-only">
        Policy {COMMISSION_COMPARISON_CALCULATOR_P3_148_POLICY_ID} ·{" "}
        {COMMISSION_COMPARISON_CALCULATOR_P3_148_HEADLINE} ·{" "}
        {COMMISSION_COMPARISON_CALCULATOR_P3_148_ROUTE}
      </p>
    </div>
  );
}
