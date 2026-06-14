import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditCommissionComparisonCalculatorP254,
  formatCommissionComparisonCalculatorP254AuditLines,
} from "@/lib/marketing/commission-comparison-calculator-p2-54-audit";
import {
  computeDoorDashUberVsOwnedCommission,
  DOORDASH_UBER_VS_OWNED_DEFAULT_INPUTS,
} from "@/lib/marketing/commission-comparison-calculator-p2-54-measurement";
import {
  COMMISSION_COMPARISON_CALCULATOR_P2_54_ARTIFACT,
  COMMISSION_COMPARISON_CALCULATOR_P2_54_CHECK_NPM_SCRIPT,
  COMMISSION_COMPARISON_CALCULATOR_P2_54_CI_NPM_SCRIPT,
  COMMISSION_COMPARISON_CALCULATOR_P2_54_CI_WORKFLOW,
  COMMISSION_COMPARISON_CALCULATOR_P2_54_DOC,
  COMMISSION_COMPARISON_CALCULATOR_P2_54_DOORDASH_BENCHMARK_PCT,
  COMMISSION_COMPARISON_CALCULATOR_P2_54_FLOW_STEPS,
  COMMISSION_COMPARISON_CALCULATOR_P2_54_POLICY_ID,
  COMMISSION_COMPARISON_CALCULATOR_P2_54_PUBLIC_ROUTE,
  COMMISSION_COMPARISON_CALCULATOR_P2_54_UBER_EATS_BENCHMARK_PCT,
  COMMISSION_COMPARISON_CALCULATOR_P2_54_UNIT_TEST,
  COMMISSION_COMPARISON_CALCULATOR_P2_54_WIRING_PATHS,
} from "@/lib/marketing/commission-comparison-calculator-p2-54-policy";

const ROOT = process.cwd();

describe("Commission comparison calculator (P2-54)", () => {
  it("locks policy id and DoorDash 30% / Uber Eats 25% benchmarks", () => {
    expect(COMMISSION_COMPARISON_CALCULATOR_P2_54_POLICY_ID).toBe(
      "commission-comparison-calculator-p2-54-v1",
    );
    expect(COMMISSION_COMPARISON_CALCULATOR_P2_54_DOORDASH_BENCHMARK_PCT).toBe(30);
    expect(COMMISSION_COMPARISON_CALCULATOR_P2_54_UBER_EATS_BENCHMARK_PCT).toBe(25);
    expect(COMMISSION_COMPARISON_CALCULATOR_P2_54_PUBLIC_ROUTE).toBe("/commission-comparison");
    expect(COMMISSION_COMPARISON_CALCULATOR_P2_54_FLOW_STEPS).toHaveLength(4);
  });

  it("computes DoorDash and Uber Eats savings vs owned channel from volume inputs", () => {
    const result = computeDoorDashUberVsOwnedCommission({
      monthlyOrders: 200,
      averageOrderValue: 40,
      doordashMixPct: 50,
      uberEatsMixPct: 50,
      ownChannelProcessingPct: DOORDASH_UBER_VS_OWNED_DEFAULT_INPUTS.ownChannelProcessingPct,
    });
    expect(result.doordash.commissionMonthly).toBe(1200);
    expect(result.uberEats.commissionMonthly).toBe(1000);
    expect(result.combinedMarketplaceCommissionMonthly).toBe(2200);
    expect(result.combinedMonthlySavingsVsOwned).toBeGreaterThan(1900);
    expect(result.combinedAnnualSavingsVsOwned).toBe(result.combinedMonthlySavingsVsOwned * 12);
  });

  it("updates savings when volume changes", () => {
    const low = computeDoorDashUberVsOwnedCommission({
      ...DOORDASH_UBER_VS_OWNED_DEFAULT_INPUTS,
      monthlyOrders: 100,
    });
    const high = computeDoorDashUberVsOwnedCommission({
      ...DOORDASH_UBER_VS_OWNED_DEFAULT_INPUTS,
      monthlyOrders: 800,
    });
    expect(high.combinedMonthlySavingsVsOwned).toBeGreaterThan(
      low.combinedMonthlySavingsVsOwned,
    );
  });

  it("passes full P2-54 commission comparison calculator audit", () => {
    const summary = auditCommissionComparisonCalculatorP254(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.panelWired).toBe(true);
    expect(summary.landingWired).toBe(true);
    expect(summary.goldenDoordashUberOk).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
    expect(formatCommissionComparisonCalculatorP254AuditLines(summary).length).toBeGreaterThan(5);
  });

  it("P2-54 wiring paths exist including doc, artifact, panel, and CI gate", () => {
    for (const path of COMMISSION_COMPARISON_CALCULATOR_P2_54_WIRING_PATHS) {
      expect(existsSync(join(ROOT, path)), `missing: ${path}`).toBe(true);
    }

    const pkg = readSource("package.json");
    expect(pkg).toContain(`"${COMMISSION_COMPARISON_CALCULATOR_P2_54_CHECK_NPM_SCRIPT}"`);
    expect(pkg).toContain(`"${COMMISSION_COMPARISON_CALCULATOR_P2_54_CI_NPM_SCRIPT}"`);

    const ci = readSource(COMMISSION_COMPARISON_CALCULATOR_P2_54_CI_WORKFLOW);
    expect(ci).toContain(COMMISSION_COMPARISON_CALCULATOR_P2_54_CHECK_NPM_SCRIPT);

    const doc = readSource(COMMISSION_COMPARISON_CALCULATOR_P2_54_DOC);
    expect(doc).toContain(COMMISSION_COMPARISON_CALCULATOR_P2_54_POLICY_ID);

    const artifact = JSON.parse(readSource(COMMISSION_COMPARISON_CALCULATOR_P2_54_ARTIFACT));
    expect(artifact.policyId).toBe(COMMISSION_COMPARISON_CALCULATOR_P2_54_POLICY_ID);
    expect(artifact.panelTestId).toBe("commission-comparison-doordash-uber-p2-54");
  });
});

function readSource(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), "utf8");
}
