import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  computeDoorDashUberVsOwnedCommission,
  DOORDASH_UBER_VS_OWNED_DEFAULT_INPUTS,
} from "@/lib/marketing/commission-comparison-calculator-p2-54-measurement";
import {
  COMMISSION_COMPARISON_CALCULATOR_P2_54_DOORDASH_BENCHMARK_PCT,
  COMMISSION_COMPARISON_CALCULATOR_P2_54_DOC,
  COMMISSION_COMPARISON_CALCULATOR_P2_54_FLOW_STEPS,
  COMMISSION_COMPARISON_CALCULATOR_P2_54_HONESTY_MARKERS,
  COMMISSION_COMPARISON_CALCULATOR_P2_54_LANDING,
  COMMISSION_COMPARISON_CALCULATOR_P2_54_OWNED_MARKETPLACE_PCT,
  COMMISSION_COMPARISON_CALCULATOR_P2_54_PANEL,
  COMMISSION_COMPARISON_CALCULATOR_P2_54_POLICY_ID,
  COMMISSION_COMPARISON_CALCULATOR_P2_54_PUBLIC_ROUTE,
  COMMISSION_COMPARISON_CALCULATOR_P2_54_ROOT_TEST_ID,
  COMMISSION_COMPARISON_CALCULATOR_P2_54_SAVINGS_TEST_ID,
  COMMISSION_COMPARISON_CALCULATOR_P2_54_UBER_EATS_BENCHMARK_PCT,
  COMMISSION_COMPARISON_CALCULATOR_P2_54_WIRING_PATHS,
} from "@/lib/marketing/commission-comparison-calculator-p2-54-policy";

export type CommissionComparisonCalculatorP254AuditSummary = {
  policyId: typeof COMMISSION_COMPARISON_CALCULATOR_P2_54_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  panelWired: boolean;
  landingWired: boolean;
  goldenDoordashUberOk: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditCommissionComparisonCalculatorP254(
  root = process.cwd(),
): CommissionComparisonCalculatorP254AuditSummary {
  const wiringComplete = COMMISSION_COMPARISON_CALCULATOR_P2_54_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  if (existsSync(join(root, COMMISSION_COMPARISON_CALCULATOR_P2_54_DOC))) {
    const source = readFileSync(join(root, COMMISSION_COMPARISON_CALCULATOR_P2_54_DOC), "utf8").toLowerCase();
    docWired =
      source.includes("doordash") &&
      source.includes("uber") &&
      source.includes("interactive");
  }

  let panelWired = false;
  if (existsSync(join(root, COMMISSION_COMPARISON_CALCULATOR_P2_54_PANEL))) {
    const source = readFileSync(join(root, COMMISSION_COMPARISON_CALCULATOR_P2_54_PANEL), "utf8");
    panelWired =
      source.includes(COMMISSION_COMPARISON_CALCULATOR_P2_54_ROOT_TEST_ID) &&
      source.includes(COMMISSION_COMPARISON_CALCULATOR_P2_54_SAVINGS_TEST_ID) &&
      source.includes("CommissionComparisonDoorDashUberPanel") &&
      source.includes("monthlyOrders") &&
      source.includes("uberEatsMixPct");
  }

  let landingWired = false;
  if (existsSync(join(root, COMMISSION_COMPARISON_CALCULATOR_P2_54_LANDING))) {
    const source = readFileSync(join(root, COMMISSION_COMPARISON_CALCULATOR_P2_54_LANDING), "utf8");
    landingWired =
      source.includes("CommissionComparisonDoorDashUberPanel") &&
      source.includes("CommissionComparisonCalculator") &&
      source.includes(COMMISSION_COMPARISON_CALCULATOR_P2_54_PUBLIC_ROUTE);
  }

  const golden = computeDoorDashUberVsOwnedCommission({
    monthlyOrders: 200,
    averageOrderValue: 40,
    doordashMixPct: 50,
    uberEatsMixPct: 50,
    ownChannelProcessingPct: DOORDASH_UBER_VS_OWNED_DEFAULT_INPUTS.ownChannelProcessingPct,
  });
  const goldenDoordashUberOk =
    golden.doordash.commissionRatePct === COMMISSION_COMPARISON_CALCULATOR_P2_54_DOORDASH_BENCHMARK_PCT &&
    golden.uberEats.commissionRatePct ===
      COMMISSION_COMPARISON_CALCULATOR_P2_54_UBER_EATS_BENCHMARK_PCT &&
    golden.doordash.commissionMonthly === 1200 &&
    golden.uberEats.commissionMonthly === 1000 &&
    golden.combinedMonthlySavingsVsOwned > 1900 &&
    COMMISSION_COMPARISON_CALCULATOR_P2_54_OWNED_MARKETPLACE_PCT === 0;

  const combined = [COMMISSION_COMPARISON_CALCULATOR_P2_54_DOC, COMMISSION_COMPARISON_CALCULATOR_P2_54_PANEL]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = COMMISSION_COMPARISON_CALCULATOR_P2_54_HONESTY_MARKERS.every((marker) =>
    combined.toLowerCase().includes(marker.toLowerCase()),
  );

  const passed =
    wiringComplete &&
    docWired &&
    panelWired &&
    landingWired &&
    goldenDoordashUberOk &&
    honestyMarkersPresent &&
    COMMISSION_COMPARISON_CALCULATOR_P2_54_FLOW_STEPS.length === 4;

  return {
    policyId: COMMISSION_COMPARISON_CALCULATOR_P2_54_POLICY_ID,
    wiringComplete,
    docWired,
    panelWired,
    landingWired,
    goldenDoordashUberOk,
    honestyMarkersPresent,
    passed,
  };
}

export function formatCommissionComparisonCalculatorP254AuditLines(
  summary: CommissionComparisonCalculatorP254AuditSummary,
): string[] {
  return [
    `Commission comparison calculator audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc wired: ${summary.docWired ? "yes" : "no"}`,
    `DoorDash/Uber panel: ${summary.panelWired ? "wired" : "missing"}`,
    `Landing wired: ${summary.landingWired ? "yes" : "no"} (${COMMISSION_COMPARISON_CALCULATOR_P2_54_PUBLIC_ROUTE})`,
    `Golden DoorDash/Uber math: ${summary.goldenDoordashUberOk ? "PASS" : "FAIL"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
