import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditCommissionComparisonCalculatorP3_148,
  formatCommissionComparisonCalculatorP3_148AuditLines,
} from "@/lib/marketing/commission-comparison-calculator-p3-148-audit";
import { assertCommissionComparisonCalculatorFeatureCount } from "@/lib/marketing/commission-comparison-calculator-p3-148-content";
import {
  loadCommissionComparisonCalculatorRegistry,
  validateCommissionComparisonCalculatorRegistry,
} from "@/lib/marketing/commission-comparison-calculator-p3-148-operations";
import {
  COMMISSION_COMPARISON_CALCULATOR_P3_148_CI_WORKFLOW,
  COMMISSION_COMPARISON_CALCULATOR_P3_148_COMPETITOR,
  COMMISSION_COMPARISON_CALCULATOR_P3_148_DOC,
  COMMISSION_COMPARISON_CALCULATOR_P3_148_FEATURE_COUNT,
  COMMISSION_COMPARISON_CALCULATOR_P3_148_FEATURE_IDS,
  COMMISSION_COMPARISON_CALCULATOR_P3_148_HEADLINE,
  COMMISSION_COMPARISON_CALCULATOR_P3_148_IMPLEMENTATION_REF,
  COMMISSION_COMPARISON_CALCULATOR_P3_148_NPM_SCRIPT,
  COMMISSION_COMPARISON_CALCULATOR_P3_148_POLICY_ID,
  COMMISSION_COMPARISON_CALCULATOR_P3_148_POSITIONING_LINE,
  COMMISSION_COMPARISON_CALCULATOR_P3_148_PUBLIC_ROUTE,
  COMMISSION_COMPARISON_CALCULATOR_P3_148_ROUTE,
  COMMISSION_COMPARISON_CALCULATOR_P3_148_UNIT_TEST,
} from "@/lib/marketing/commission-comparison-calculator-p3-148-policy";

const ROOT = process.cwd();

describe("Commission comparison calculator ChowNow (P3-148)", () => {
  it("locks policy id, ChowNow competitor, and 6 calculator features", () => {
    expect(COMMISSION_COMPARISON_CALCULATOR_P3_148_POLICY_ID).toBe(
      "commission-comparison-calculator-p3-148-v1",
    );
    expect(COMMISSION_COMPARISON_CALCULATOR_P3_148_COMPETITOR).toBe("chownow");
    expect(COMMISSION_COMPARISON_CALCULATOR_P3_148_FEATURE_COUNT).toBe(6);
    expect(COMMISSION_COMPARISON_CALCULATOR_P3_148_ROUTE).toBe(
      "/dashboard/marketing/commission-comparison",
    );
    expect(COMMISSION_COMPARISON_CALCULATOR_P3_148_PUBLIC_ROUTE).toBe("/commission-comparison");
    expect(COMMISSION_COMPARISON_CALCULATOR_P3_148_IMPLEMENTATION_REF).toBe(
      "commission-comparison-calculator-absolute-final-v1",
    );
    expect(COMMISSION_COMPARISON_CALCULATOR_P3_148_POSITIONING_LINE).toBe(
      "Full kitchen OS underneath owned channel — not ChowNow ordering-only.",
    );
    expect(COMMISSION_COMPARISON_CALCULATOR_P3_148_HEADLINE).toBe(
      "Commission comparison calculator — ChowNow parity baseline",
    );
    expect(COMMISSION_COMPARISON_CALCULATOR_P3_148_FEATURE_IDS).toEqual([
      "channel_mix",
      "marketplace_benchmark",
      "owned_channel_compare",
      "annual_delta",
      "live_commissions",
      "commission_free_messaging",
    ]);
    expect(assertCommissionComparisonCalculatorFeatureCount()).toBe(true);
  });

  it("validates registry with zero active pilots", () => {
    const registry = loadCommissionComparisonCalculatorRegistry(ROOT);
    const validation = validateCommissionComparisonCalculatorRegistry(registry);
    expect(validation.valid).toBe(true);
    expect(validation.zeroActivePilots).toBe(true);
    expect(registry.activePilotCount).toBe(0);
    expect(registry.features).toHaveLength(6);
  });

  it("passes full commission comparison calculator ChowNow audit", () => {
    const summary = auditCommissionComparisonCalculatorP3_148(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.registryValid).toBe(true);
    expect(summary.absoluteFinalAuditPassed).toBe(true);
    expect(summary.commissionFreeAuditPassed).toBe(true);
    expect(summary.legacyCalculatorWiringPassed).toBe(true);
    expect(summary.liveCalculatorWiringPassed).toBe(true);
    expect(summary.relatedDocsReferenced).toBe(true);
    expect(summary.featuresDocumented).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("wires deploy-prod-gate and npm audit script", () => {
    const workflow = readFileSync(join(ROOT, COMMISSION_COMPARISON_CALCULATOR_P3_148_CI_WORKFLOW), "utf8");
    expect(workflow).toContain(COMMISSION_COMPARISON_CALCULATOR_P3_148_NPM_SCRIPT);
    expect(existsSync(join(ROOT, COMMISSION_COMPARISON_CALCULATOR_P3_148_DOC))).toBe(true);
    expect(existsSync(join(ROOT, COMMISSION_COMPARISON_CALCULATOR_P3_148_UNIT_TEST))).toBe(true);
  });

  it("formats audit lines without throwing", () => {
    const summary = auditCommissionComparisonCalculatorP3_148(ROOT);
    const lines = formatCommissionComparisonCalculatorP3_148AuditLines(summary);
    expect(lines.length).toBeGreaterThan(5);
    expect(lines.some((line) => line.includes("chownow"))).toBe(true);
  });
});
