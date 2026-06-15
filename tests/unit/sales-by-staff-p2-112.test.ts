import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditSalesByStaffP2_112,
  formatSalesByStaffP2_112AuditLines,
} from "@/lib/analytics/sales-by-staff-p2-112-audit";
import { SALES_BY_STAFF_P2_112_CAPABILITIES } from "@/lib/analytics/sales-by-staff-p2-112-content";
import {
  buildSalesByStaffDemoReport,
  buildStaffSalesRows,
  computeAvgCheck,
  SALES_BY_STAFF_DEMO_TRANSACTIONS,
} from "@/lib/analytics/sales-by-staff-p2-112-operations";
import {
  SALES_BY_STAFF_P2_112_CAPABILITY_COUNT,
  SALES_BY_STAFF_P2_112_CI_WORKFLOW,
  SALES_BY_STAFF_P2_112_DOC,
  SALES_BY_STAFF_P2_112_NPM_SCRIPT,
  SALES_BY_STAFF_P2_112_POLICY_ID,
  SALES_BY_STAFF_P2_112_ROUTE,
  SALES_BY_STAFF_P2_112_UNIT_TEST,
} from "@/lib/analytics/sales-by-staff-p2-112-policy";

const ROOT = process.cwd();

describe("Sales-by-staff analytics (P2-112)", () => {
  it("locks policy id, route, and three capabilities", () => {
    expect(SALES_BY_STAFF_P2_112_POLICY_ID).toBe("sales-by-staff-p2-112-v1");
    expect(SALES_BY_STAFF_P2_112_ROUTE).toBe("/dashboard/analytics/sales-by-staff");
    expect(SALES_BY_STAFF_P2_112_CAPABILITY_COUNT).toBe(3);
    expect(SALES_BY_STAFF_P2_112_CAPABILITIES).toHaveLength(3);
  });

  it("passes full sales-by-staff audit", () => {
    const summary = auditSalesByStaffP2_112(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.componentWired).toBe(true);
    expect(summary.pageWired).toBe(true);
    expect(summary.operationsWired).toBe(true);
    expect(summary.serviceWired).toBe(true);
    expect(summary.legacyCheckoutLinked).toBe(true);
    expect(summary.legacyShiftLinked).toBe(true);
    expect(summary.legacyCloseoutLinked).toBe(true);
    expect(summary.capabilityCountCorrect).toBe(true);
    expect(summary.allTestIdsPresent).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("computes average check per shift", () => {
    expect(computeAvgCheck(135.75, 3)).toBe(45.25);
    expect(computeAvgCheck(0, 0)).toBe(0);
  });

  it("ranks staff by total sales", () => {
    const rows = buildStaffSalesRows([
      { staffId: "a", staffName: "Alex", orderCount: 3, totalSales: 135.75, shiftIds: ["s1"] },
      { staffId: "b", staffName: "Jordan", orderCount: 4, totalSales: 126.25, shiftIds: ["s2"] },
    ]);
    expect(rows[0]?.staffName).toBe("Alex");
    expect(rows[0]?.rank).toBe(1);
    expect(rows[1]?.rank).toBe(2);
  });

  it("builds demo sales-by-staff report", () => {
    const report = buildSalesByStaffDemoReport();
    expect(report.staffCount).toBeGreaterThan(0);
    expect(report.totalOrders).toBe(SALES_BY_STAFF_DEMO_TRANSACTIONS.length);
    expect(report.totalSales).toBeGreaterThan(0);
    expect(report.overallAvgCheck).toBeGreaterThan(0);
    expect(report.topServerName).toBeTruthy();
    expect(report.staffRows.every((r) => r.avgCheck > 0)).toBe(true);
  });

  it("wires CI audit script and deploy gate", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts: Record<string, string>;
    };
    expect(pkg.scripts[SALES_BY_STAFF_P2_112_NPM_SCRIPT]).toContain(
      "audit-sales-by-staff-p2-112.ts",
    );
    expect(pkg.scripts["test:ci:sales-by-staff-p2-112"]).toContain(
      SALES_BY_STAFF_P2_112_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, SALES_BY_STAFF_P2_112_CI_WORKFLOW), "utf8");
    expect(workflow).toContain(SALES_BY_STAFF_P2_112_NPM_SCRIPT);

    expect(existsSync(join(ROOT, SALES_BY_STAFF_P2_112_DOC))).toBe(true);
    expect(formatSalesByStaffP2_112AuditLines(auditSalesByStaffP2_112(ROOT)).length).toBeGreaterThan(
      5,
    );
  });
});
