import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  computeDoorDashVsOwnedCommission,
  DOORDASH_VS_OWNED_DEFAULT_INPUTS,
} from "@/lib/marketing/commission-comparison-calculator-p2-46-measurement";
import {
  COMMISSION_COMPARISON_CALCULATOR_P2_46_DOORDASH_BENCHMARK_PCT,
  COMMISSION_COMPARISON_CALCULATOR_P2_46_DOC,
  COMMISSION_COMPARISON_CALCULATOR_P2_46_FLOW_STEPS,
  COMMISSION_COMPARISON_CALCULATOR_P2_46_HONESTY_MARKERS,
  COMMISSION_COMPARISON_CALCULATOR_P2_46_OWNED_MARKETPLACE_PCT,
  COMMISSION_COMPARISON_CALCULATOR_P2_46_PANEL,
  COMMISSION_COMPARISON_CALCULATOR_P2_46_POLICY_ID,
  COMMISSION_COMPARISON_CALCULATOR_P2_46_PUBLIC_PAGE,
  COMMISSION_COMPARISON_CALCULATOR_P2_46_PUBLIC_ROUTE,
  COMMISSION_COMPARISON_CALCULATOR_P2_46_ROOT_TEST_ID,
  COMMISSION_COMPARISON_CALCULATOR_P2_46_SAVINGS_TEST_ID,
  COMMISSION_COMPARISON_CALCULATOR_P2_46_WIRING_PATHS,
} from "@/lib/marketing/commission-comparison-calculator-p2-46-policy";

export type CommissionComparisonCalculatorP2_46AuditSummary = {
  policyId: typeof COMMISSION_COMPARISON_CALCULATOR_P2_46_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  panelWired: boolean;
  publicPageWired: boolean;
  goldenDoordash30Ok: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditCommissionComparisonCalculatorP2_46(
  root = process.cwd(),
): CommissionComparisonCalculatorP2_46AuditSummary {
  const wiringComplete = COMMISSION_COMPARISON_CALCULATOR_P2_46_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  if (existsSync(join(root, COMMISSION_COMPARISON_CALCULATOR_P2_46_DOC))) {
    const source = readFileSync(join(root, COMMISSION_COMPARISON_CALCULATOR_P2_46_DOC), "utf8").toLowerCase();
    docWired =
      source.includes("chownow parity") &&
      source.includes("doordash 30") &&
      source.includes("owned 0");
  }

  let panelWired = false;
  if (existsSync(join(root, COMMISSION_COMPARISON_CALCULATOR_P2_46_PANEL))) {
    const source = readFileSync(join(root, COMMISSION_COMPARISON_CALCULATOR_P2_46_PANEL), "utf8");
    panelWired =
      source.includes(COMMISSION_COMPARISON_CALCULATOR_P2_46_ROOT_TEST_ID) &&
      source.includes(COMMISSION_COMPARISON_CALCULATOR_P2_46_SAVINGS_TEST_ID) &&
      source.includes("CommissionComparisonDoorDashPanel");
  }

  let publicPageWired = false;
  if (existsSync(join(root, COMMISSION_COMPARISON_CALCULATOR_P2_46_PUBLIC_PAGE))) {
    const pageSource = readFileSync(join(root, COMMISSION_COMPARISON_CALCULATOR_P2_46_PUBLIC_PAGE), "utf8");
    const landingSource = existsSync(join(root, "components/marketing/commission-comparison-landing.tsx"))
      ? readFileSync(join(root, "components/marketing/commission-comparison-landing.tsx"), "utf8")
      : "";
    publicPageWired =
      (pageSource.includes("CommissionComparisonDoorDashPanel") ||
        (pageSource.includes("CommissionComparisonLanding") &&
          landingSource.includes("CommissionComparisonDoorDashPanel"))) &&
      pageSource.includes(COMMISSION_COMPARISON_CALCULATOR_P2_46_PUBLIC_ROUTE);
  }

  const golden = computeDoorDashVsOwnedCommission({
    monthlyOrders: 100,
    averageOrderValue: 50,
    doordashMixPct: 100,
    ownChannelProcessingPct: DOORDASH_VS_OWNED_DEFAULT_INPUTS.ownChannelProcessingPct,
  });
  const goldenDoordash30Ok =
    golden.doordashCommissionRatePct === COMMISSION_COMPARISON_CALCULATOR_P2_46_DOORDASH_BENCHMARK_PCT &&
    golden.ownedMarketplaceRatePct === COMMISSION_COMPARISON_CALCULATOR_P2_46_OWNED_MARKETPLACE_PCT &&
    golden.doordashCommissionMonthly === 1500 &&
    golden.monthlySavingsVsDoordash > 1300;

  const combined = [COMMISSION_COMPARISON_CALCULATOR_P2_46_DOC, COMMISSION_COMPARISON_CALCULATOR_P2_46_PANEL]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = COMMISSION_COMPARISON_CALCULATOR_P2_46_HONESTY_MARKERS.every((marker) =>
    combined.toLowerCase().includes(marker.toLowerCase()),
  );

  const passed =
    wiringComplete &&
    docWired &&
    panelWired &&
    publicPageWired &&
    goldenDoordash30Ok &&
    honestyMarkersPresent &&
    COMMISSION_COMPARISON_CALCULATOR_P2_46_FLOW_STEPS.length === 4;

  return {
    policyId: COMMISSION_COMPARISON_CALCULATOR_P2_46_POLICY_ID,
    wiringComplete,
    docWired,
    panelWired,
    publicPageWired,
    goldenDoordash30Ok,
    honestyMarkersPresent,
    passed,
  };
}

export function formatCommissionComparisonCalculatorP2_46AuditLines(
  summary: CommissionComparisonCalculatorP2_46AuditSummary,
): string[] {
  return [
    `Commission comparison calculator audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc wired: ${summary.docWired ? "yes" : "no"} (${COMMISSION_COMPARISON_CALCULATOR_P2_46_DOC})`,
    `DoorDash panel: ${summary.panelWired ? "wired" : "missing"}`,
    `Public page: ${summary.publicPageWired ? "yes" : "no"} (${COMMISSION_COMPARISON_CALCULATOR_P2_46_PUBLIC_ROUTE})`,
    `Golden DoorDash 30% math: ${summary.goldenDoordash30Ok ? "PASS" : "FAIL"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
