import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditVendorPriceIntelligenceP2_100,
  formatVendorPriceIntelligenceP2_100AuditLines,
} from "@/lib/inventory/vendor-price-intelligence-p2-100-audit";
import { VENDOR_PRICE_INTELLIGENCE_P2_100_CAPABILITIES } from "@/lib/inventory/vendor-price-intelligence-p2-100-content";
import {
  buildCheaperVendorRecommendations,
  buildPriceHistoryPoints,
  buildSubstitutionSuggestions,
  buildVendorPriceIntelligenceDemoReport,
  computePriceChangePercent,
  VENDOR_PRICE_INTELLIGENCE_DEMO_COMPARISONS,
  VENDOR_PRICE_INTELLIGENCE_DEMO_HISTORY_ROWS,
  VENDOR_PRICE_INTELLIGENCE_DEMO_SUBSTITUTES,
} from "@/lib/inventory/vendor-price-intelligence-p2-100-operations";
import {
  VENDOR_PRICE_INTELLIGENCE_P2_100_CAPABILITY_COUNT,
  VENDOR_PRICE_INTELLIGENCE_P2_100_CI_WORKFLOW,
  VENDOR_PRICE_INTELLIGENCE_P2_100_DOC,
  VENDOR_PRICE_INTELLIGENCE_P2_100_NPM_SCRIPT,
  VENDOR_PRICE_INTELLIGENCE_P2_100_POLICY_ID,
  VENDOR_PRICE_INTELLIGENCE_P2_100_ROUTE,
  VENDOR_PRICE_INTELLIGENCE_P2_100_UNIT_TEST,
} from "@/lib/inventory/vendor-price-intelligence-p2-100-policy";

const ROOT = process.cwd();

describe("Vendor price intelligence (P2-100)", () => {
  it("locks policy id, route, and three capabilities", () => {
    expect(VENDOR_PRICE_INTELLIGENCE_P2_100_POLICY_ID).toBe("vendor-price-intelligence-p2-100-v1");
    expect(VENDOR_PRICE_INTELLIGENCE_P2_100_ROUTE).toBe(
      "/dashboard/inventory/vendor-price-intelligence",
    );
    expect(VENDOR_PRICE_INTELLIGENCE_P2_100_CAPABILITY_COUNT).toBe(3);
    expect(VENDOR_PRICE_INTELLIGENCE_P2_100_CAPABILITIES).toHaveLength(3);
  });

  it("passes full vendor price intelligence audit", () => {
    const summary = auditVendorPriceIntelligenceP2_100(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.componentWired).toBe(true);
    expect(summary.pageWired).toBe(true);
    expect(summary.operationsWired).toBe(true);
    expect(summary.serviceWired).toBe(true);
    expect(summary.legacyPriceHistoryLinked).toBe(true);
    expect(summary.legacyPurchasingLinked).toBe(true);
    expect(summary.capabilityCountCorrect).toBe(true);
    expect(summary.allTestIdsPresent).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("computes price change percent and history points", () => {
    expect(computePriceChangePercent(3.45, 3.52)).toBe(-2);
    const history = buildPriceHistoryPoints([...VENDOR_PRICE_INTELLIGENCE_DEMO_HISTORY_ROWS]);
    expect(history.length).toBe(5);
    expect(history.some((row) => row.changePercent != null)).toBe(true);
  });

  it("builds substitution and cheaper vendor recommendations", () => {
    const substitutions = buildSubstitutionSuggestions(
      [...VENDOR_PRICE_INTELLIGENCE_DEMO_COMPARISONS],
      [...VENDOR_PRICE_INTELLIGENCE_DEMO_SUBSTITUTES],
    );
    expect(substitutions.length).toBeGreaterThan(0);
    expect(substitutions[0]!.savingsPercent).toBeGreaterThan(0);

    const cheaper = buildCheaperVendorRecommendations([
      ...VENDOR_PRICE_INTELLIGENCE_DEMO_COMPARISONS,
    ]);
    expect(cheaper.length).toBe(2);
    expect(cheaper.every((row) => row.savingsPerOrder > 0)).toBe(true);
  });

  it("builds demo vendor price intelligence report", () => {
    const report = buildVendorPriceIntelligenceDemoReport();
    expect(report.priceHistoryCount).toBeGreaterThan(0);
    expect(report.cheaperVendorCount).toBe(2);
    expect(report.totalPotentialSavings).toBeGreaterThan(0);
  });

  it("wires CI audit script and deploy gate", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts: Record<string, string>;
    };
    expect(pkg.scripts[VENDOR_PRICE_INTELLIGENCE_P2_100_NPM_SCRIPT]).toContain(
      "audit-vendor-price-intelligence-p2-100.ts",
    );
    expect(pkg.scripts["test:ci:vendor-price-intelligence-p2-100"]).toContain(
      VENDOR_PRICE_INTELLIGENCE_P2_100_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, VENDOR_PRICE_INTELLIGENCE_P2_100_CI_WORKFLOW), "utf8");
    expect(workflow).toContain(VENDOR_PRICE_INTELLIGENCE_P2_100_NPM_SCRIPT);

    expect(existsSync(join(ROOT, VENDOR_PRICE_INTELLIGENCE_P2_100_DOC))).toBe(true);
    expect(
      formatVendorPriceIntelligenceP2_100AuditLines(auditVendorPriceIntelligenceP2_100(ROOT)).length,
    ).toBeGreaterThan(5);
  });
});
