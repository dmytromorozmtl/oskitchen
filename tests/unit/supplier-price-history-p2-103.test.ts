import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditSupplierPriceHistoryP2_103,
  formatSupplierPriceHistoryP2_103AuditLines,
} from "@/lib/inventory/supplier-price-history-p2-103-audit";
import { SUPPLIER_PRICE_HISTORY_P2_103_CAPABILITIES } from "@/lib/inventory/supplier-price-history-p2-103-content";
import {
  buildIngredientGraphSeries,
  buildMultiSupplierTrendRows,
  buildPriceChangeSummaryRows,
  buildSupplierPriceHistoryDemoReport,
  SUPPLIER_PRICE_HISTORY_DEMO_POINTS,
} from "@/lib/inventory/supplier-price-history-p2-103-operations";
import {
  SUPPLIER_PRICE_HISTORY_P2_103_CAPABILITY_COUNT,
  SUPPLIER_PRICE_HISTORY_P2_103_CI_WORKFLOW,
  SUPPLIER_PRICE_HISTORY_P2_103_DOC,
  SUPPLIER_PRICE_HISTORY_P2_103_NPM_SCRIPT,
  SUPPLIER_PRICE_HISTORY_P2_103_POLICY_ID,
  SUPPLIER_PRICE_HISTORY_P2_103_ROUTE,
  SUPPLIER_PRICE_HISTORY_P2_103_UNIT_TEST,
} from "@/lib/inventory/supplier-price-history-p2-103-policy";

const ROOT = process.cwd();

describe("Supplier price history (P2-103)", () => {
  it("locks policy id, route, and three capabilities", () => {
    expect(SUPPLIER_PRICE_HISTORY_P2_103_POLICY_ID).toBe("supplier-price-history-p2-103-v1");
    expect(SUPPLIER_PRICE_HISTORY_P2_103_ROUTE).toBe("/dashboard/inventory/supplier-price-history");
    expect(SUPPLIER_PRICE_HISTORY_P2_103_CAPABILITY_COUNT).toBe(3);
    expect(SUPPLIER_PRICE_HISTORY_P2_103_CAPABILITIES).toHaveLength(3);
  });

  it("passes full supplier price history audit", () => {
    const summary = auditSupplierPriceHistoryP2_103(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.componentWired).toBe(true);
    expect(summary.pageWired).toBe(true);
    expect(summary.operationsWired).toBe(true);
    expect(summary.serviceWired).toBe(true);
    expect(summary.legacyServiceLinked).toBe(true);
    expect(summary.legacyChartLinked).toBe(true);
    expect(summary.capabilityCountCorrect).toBe(true);
    expect(summary.allTestIdsPresent).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("builds per-ingredient graph series", () => {
    const series = buildIngredientGraphSeries([...SUPPLIER_PRICE_HISTORY_DEMO_POINTS]);
    expect(series.length).toBe(3);
    expect(series[0]!.ingredientName).toBe("Chicken breast");
    expect(series[0]!.supplierCount).toBe(2);
    expect(series[0]!.pointCount).toBeGreaterThan(0);
  });

  it("builds multi-supplier trend rows with direction", () => {
    const rows = buildMultiSupplierTrendRows([...SUPPLIER_PRICE_HISTORY_DEMO_POINTS]);
    expect(rows.length).toBeGreaterThan(0);
    const chickenSysco = rows.find(
      (r) => r.ingredientName === "Chicken breast" && r.supplierName === "Sysco",
    );
    expect(chickenSysco?.trend).toBe("up");
    expect(chickenSysco?.changePercent).toBeGreaterThan(0);
  });

  it("builds price change summary with volatility", () => {
    const rows = buildPriceChangeSummaryRows([...SUPPLIER_PRICE_HISTORY_DEMO_POINTS]);
    expect(rows.length).toBe(3);
    expect(rows.every((r) => r.volatilityPercent >= 0)).toBe(true);
    expect(rows[0]!.supplierCount).toBeGreaterThan(0);
  });

  it("builds demo supplier price history report", () => {
    const report = buildSupplierPriceHistoryDemoReport();
    expect(report.ingredientGraphCount).toBe(3);
    expect(report.multiSupplierTrendCount).toBeGreaterThan(0);
    expect(report.priceChangeSummaryCount).toBe(3);
    expect(report.totalDataPoints).toBe(SUPPLIER_PRICE_HISTORY_DEMO_POINTS.length);
  });

  it("wires CI audit script and deploy gate", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts: Record<string, string>;
    };
    expect(pkg.scripts[SUPPLIER_PRICE_HISTORY_P2_103_NPM_SCRIPT]).toContain(
      "audit-supplier-price-history-p2-103.ts",
    );
    expect(pkg.scripts["test:ci:supplier-price-history-p2-103"]).toContain(
      SUPPLIER_PRICE_HISTORY_P2_103_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, SUPPLIER_PRICE_HISTORY_P2_103_CI_WORKFLOW), "utf8");
    expect(workflow).toContain(SUPPLIER_PRICE_HISTORY_P2_103_NPM_SCRIPT);

    expect(existsSync(join(ROOT, SUPPLIER_PRICE_HISTORY_P2_103_DOC))).toBe(true);
    expect(
      formatSupplierPriceHistoryP2_103AuditLines(auditSupplierPriceHistoryP2_103(ROOT)).length,
    ).toBeGreaterThan(5);
  });
});
