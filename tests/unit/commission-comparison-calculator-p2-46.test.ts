import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditCommissionComparisonCalculatorP2_46,
  formatCommissionComparisonCalculatorP2_46AuditLines,
} from "@/lib/marketing/commission-comparison-calculator-p2-46-audit";
import {
  computeDoorDashVsOwnedCommission,
  DOORDASH_VS_OWNED_DEFAULT_INPUTS,
} from "@/lib/marketing/commission-comparison-calculator-p2-46-measurement";
import {
  COMMISSION_COMPARISON_CALCULATOR_P2_46_AUDIT_SCRIPT,
  COMMISSION_COMPARISON_CALCULATOR_P2_46_CHECK_NPM_SCRIPT,
  COMMISSION_COMPARISON_CALCULATOR_P2_46_CI_WORKFLOW,
  COMMISSION_COMPARISON_CALCULATOR_P2_46_DOC,
  COMMISSION_COMPARISON_CALCULATOR_P2_46_DOORDASH_BENCHMARK_PCT,
  COMMISSION_COMPARISON_CALCULATOR_P2_46_FLOW_STEPS,
  COMMISSION_COMPARISON_CALCULATOR_P2_46_NPM_SCRIPT,
  COMMISSION_COMPARISON_CALCULATOR_P2_46_OWNED_MARKETPLACE_PCT,
  COMMISSION_COMPARISON_CALCULATOR_P2_46_POLICY_ID,
  COMMISSION_COMPARISON_CALCULATOR_P2_46_PUBLIC_ROUTE,
  COMMISSION_COMPARISON_CALCULATOR_P2_46_UNIT_TEST,
} from "@/lib/marketing/commission-comparison-calculator-p2-46-policy";

const ROOT = process.cwd();

describe("Commission comparison calculator (P2-46)", () => {
  it("locks policy id and DoorDash 30% vs owned 0% rates", () => {
    expect(COMMISSION_COMPARISON_CALCULATOR_P2_46_POLICY_ID).toBe(
      "commission-comparison-calculator-p2-46-v1",
    );
    expect(COMMISSION_COMPARISON_CALCULATOR_P2_46_DOORDASH_BENCHMARK_PCT).toBe(30);
    expect(COMMISSION_COMPARISON_CALCULATOR_P2_46_OWNED_MARKETPLACE_PCT).toBe(0);
    expect(COMMISSION_COMPARISON_CALCULATOR_P2_46_PUBLIC_ROUTE).toBe("/commission-comparison");
    expect(COMMISSION_COMPARISON_CALCULATOR_P2_46_FLOW_STEPS).toHaveLength(4);
  });

  it("computes DoorDash 30% vs owned processing-only fees", () => {
    const result = computeDoorDashVsOwnedCommission({
      monthlyOrders: 100,
      averageOrderValue: 50,
      doordashMixPct: 100,
      ownChannelProcessingPct: DOORDASH_VS_OWNED_DEFAULT_INPUTS.ownChannelProcessingPct,
    });
    expect(result.grossMonthly).toBe(5000);
    expect(result.doordashCommissionMonthly).toBe(1500);
    expect(result.ownedMarketplaceCommissionMonthly).toBe(0);
    expect(result.monthlySavingsVsDoordash).toBeGreaterThan(1300);
    expect(result.annualSavingsVsDoordash).toBe(result.monthlySavingsVsDoordash * 12);
  });

  it("passes full commission comparison calculator audit", () => {
    const summary = auditCommissionComparisonCalculatorP2_46(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.panelWired).toBe(true);
    expect(summary.publicPageWired).toBe(true);
    expect(summary.goldenDoordash30Ok).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
    expect(formatCommissionComparisonCalculatorP2_46AuditLines(summary).length).toBeGreaterThan(5);
  });

  it("registers audit script and npm wiring", () => {
    expect(existsSync(join(ROOT, COMMISSION_COMPARISON_CALCULATOR_P2_46_DOC))).toBe(true);
    expect(existsSync(join(ROOT, COMMISSION_COMPARISON_CALCULATOR_P2_46_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, COMMISSION_COMPARISON_CALCULATOR_P2_46_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[COMMISSION_COMPARISON_CALCULATOR_P2_46_NPM_SCRIPT]).toContain(
      "audit-commission-comparison-calculator-p2-46.ts",
    );
    expect(pkg.scripts?.[COMMISSION_COMPARISON_CALCULATOR_P2_46_CHECK_NPM_SCRIPT]).toContain(
      COMMISSION_COMPARISON_CALCULATOR_P2_46_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, COMMISSION_COMPARISON_CALCULATOR_P2_46_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("commission-comparison-calculator-p2-46");
  });
});
