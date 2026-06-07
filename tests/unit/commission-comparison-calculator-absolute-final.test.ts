import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { auditCommissionComparisonCalculatorWiring } from "@/lib/marketing/commission-comparison-calculator-audit";
import {
  COMMISSION_COMPARISON_CALCULATOR_PATH,
  COMMISSION_COMPARISON_DEFAULT_INPUTS,
  computeCommissionComparison,
  formatCommissionUsd,
} from "@/lib/marketing/commission-comparison-calculator-content";
import {
  COMMISSION_COMPARISON_CALCULATOR_ABSOLUTE_FINAL_POLICY_ID,
  COMMISSION_COMPARISON_CALCULATOR_CI_SCRIPTS,
  COMMISSION_COMPARISON_CALCULATOR_ROUTE,
  COMMISSION_COMPARISON_CALCULATOR_UNIT_TEST,
  COMMISSION_COMPARISON_DASHBOARD_ROUTE,
} from "@/lib/marketing/commission-comparison-calculator-absolute-final-policy";
import { DELIVERY_COMMISSION_BENCHMARK_RATE_PCT } from "@/lib/delivery/delivery-commission-tracking-absolute-final-policy";

const ROOT = process.cwd();

describe("Commission comparison calculator (Absolute Final Task 81)", () => {
  it("locks absolute final policy and public route", () => {
    expect(COMMISSION_COMPARISON_CALCULATOR_ABSOLUTE_FINAL_POLICY_ID).toBe(
      "commission-comparison-calculator-absolute-final-v1",
    );
    expect(COMMISSION_COMPARISON_CALCULATOR_ROUTE).toBe("/commission-comparison");
    expect(COMMISSION_COMPARISON_CALCULATOR_PATH).toBe("/commission-comparison");
    expect(COMMISSION_COMPARISON_DASHBOARD_ROUTE).toBe("/dashboard/analytics/delivery-commissions");
  });

  it("computes marketplace vs own-channel commission from shared benchmarks", () => {
    const result = computeCommissionComparison(COMMISSION_COMPARISON_DEFAULT_INPUTS);
    expect(result.channels).toHaveLength(4);
    expect(result.marketplaceGrossMonthly).toBeGreaterThan(0);
    expect(result.marketplaceCommissionMonthly).toBeGreaterThan(result.ownChannelFeesMonthly);
    expect(result.monthlySavingsVsMarketplace).toBeGreaterThan(0);
    expect(result.annualSavingsVsMarketplace).toBeCloseTo(
      result.monthlySavingsVsMarketplace * 12,
      2,
    );

    const doordash = result.channels.find((c) => c.provider === "DOORDASH")!;
    expect(doordash.commissionRatePct).toBe(DELIVERY_COMMISSION_BENCHMARK_RATE_PCT.DOORDASH);
  });

  it("normalizes channel mix to 100%", () => {
    const result = computeCommissionComparison({
      ...COMMISSION_COMPARISON_DEFAULT_INPUTS,
      doordashMixPct: 50,
      uberEatsMixPct: 50,
      grubhubMixPct: 0,
      uberDirectMixPct: 0,
    });
    expect(result.mixTotalPct).toBe(100);
    expect(result.channels.find((c) => c.provider === "GRUBHUB")!.orders).toBe(0);
  });

  it("formats currency for calculator UI", () => {
    expect(formatCommissionUsd(1234.56)).toMatch(/\$1,235/);
  });

  it("passes wiring audit", () => {
    const audit = auditCommissionComparisonCalculatorWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
  });

  it("registers CI cert scripts", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    for (const script of COMMISSION_COMPARISON_CALCULATOR_CI_SCRIPTS) {
      expect(pkg.scripts?.[script]).toBeTruthy();
    }
    expect(COMMISSION_COMPARISON_CALCULATOR_UNIT_TEST).toBe(
      "tests/unit/commission-comparison-calculator-absolute-final.test.ts",
    );
  });
});
