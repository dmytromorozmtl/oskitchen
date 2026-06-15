import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditInventoryVarianceReportP2_99,
  formatInventoryVarianceReportP2_99AuditLines,
} from "@/lib/inventory/inventory-variance-report-p2-99-audit";
import { INVENTORY_VARIANCE_REPORT_P2_99_CAPABILITIES } from "@/lib/inventory/inventory-variance-report-p2-99-content";
import {
  buildInventoryVarianceReport,
  buildTheftSpoilageRows,
  buildWasteTrackingRows,
  computeExpectedVsActualRow,
  INVENTORY_VARIANCE_REPORT_DEMO_FIXTURE,
} from "@/lib/inventory/inventory-variance-report-p2-99-operations";
import {
  INVENTORY_VARIANCE_REPORT_P2_99_CAPABILITY_COUNT,
  INVENTORY_VARIANCE_REPORT_P2_99_CI_WORKFLOW,
  INVENTORY_VARIANCE_REPORT_P2_99_DOC,
  INVENTORY_VARIANCE_REPORT_P2_99_NPM_SCRIPT,
  INVENTORY_VARIANCE_REPORT_P2_99_POLICY_ID,
  INVENTORY_VARIANCE_REPORT_P2_99_ROUTE,
  INVENTORY_VARIANCE_REPORT_P2_99_UNIT_TEST,
} from "@/lib/inventory/inventory-variance-report-p2-99-policy";

const ROOT = process.cwd();

describe("Inventory variance report (P2-99)", () => {
  it("locks policy id, route, and three capabilities", () => {
    expect(INVENTORY_VARIANCE_REPORT_P2_99_POLICY_ID).toBe("inventory-variance-report-p2-99-v1");
    expect(INVENTORY_VARIANCE_REPORT_P2_99_ROUTE).toBe("/dashboard/inventory/variance-report");
    expect(INVENTORY_VARIANCE_REPORT_P2_99_CAPABILITY_COUNT).toBe(3);
    expect(INVENTORY_VARIANCE_REPORT_P2_99_CAPABILITIES).toHaveLength(3);
  });

  it("passes full inventory variance report audit", () => {
    const summary = auditInventoryVarianceReportP2_99(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.componentWired).toBe(true);
    expect(summary.pageWired).toBe(true);
    expect(summary.operationsWired).toBe(true);
    expect(summary.serviceWired).toBe(true);
    expect(summary.legacyCountServiceLinked).toBe(true);
    expect(summary.legacyManagerLinked).toBe(true);
    expect(summary.capabilityCountCorrect).toBe(true);
    expect(summary.allTestIdsPresent).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("computes expected vs actual variance row", () => {
    const row = computeExpectedVsActualRow("ing-1", "Chicken", "lb", 40, 34, 3.45);
    expect(row.varianceQty).toBe(-6);
    expect(row.varianceCost).toBeLessThan(0);
    expect(row.variancePercent).toBe(-15);
  });

  it("builds theft/spoilage and waste tracking rows", () => {
    const theftSpoilage = buildTheftSpoilageRows(
      [
        {
          productId: "p1",
          productName: "Burger",
          theftScore: 70,
          variancePercent: 10,
          estimatedExposure: 100,
          period: "30d",
          severity: "high",
          recommendation: "Audit yields.",
        },
      ],
      [
        {
          reason: "SPOILAGE",
          eventCount: 3,
          totalCost: 50,
          severity: "normal",
          recommendation: "Monitor.",
        },
      ],
    );
    expect(theftSpoilage.length).toBe(2);
    expect(theftSpoilage.some((r) => r.type === "theft")).toBe(true);
    expect(theftSpoilage.some((r) => r.type === "spoilage")).toBe(true);

    const waste = buildWasteTrackingRows([
      {
        reason: "PREP_WASTE",
        eventCount: 5,
        totalCost: 80,
        severity: "high",
        recommendation: "Tighten prep.",
      },
    ]);
    expect(waste[0]!.totalCost).toBe(80);
  });

  it("builds demo inventory variance report", () => {
    const report = buildInventoryVarianceReport({
      expectedVsActual: [...INVENTORY_VARIANCE_REPORT_DEMO_FIXTURE.expectedVsActual],
      theftSpoilage: [...INVENTORY_VARIANCE_REPORT_DEMO_FIXTURE.theftSpoilage],
      wasteTracking: [...INVENTORY_VARIANCE_REPORT_DEMO_FIXTURE.wasteTracking],
    });
    expect(report.expectedVsActualCount).toBe(3);
    expect(report.theftSpoilageCount).toBe(2);
    expect(report.wasteTrackingCount).toBe(3);
    expect(report.totalWasteCost).toBeGreaterThan(0);
  });

  it("wires CI audit script and deploy gate", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts: Record<string, string>;
    };
    expect(pkg.scripts[INVENTORY_VARIANCE_REPORT_P2_99_NPM_SCRIPT]).toContain(
      "audit-inventory-variance-report-p2-99.ts",
    );
    expect(pkg.scripts["test:ci:inventory-variance-report-p2-99"]).toContain(
      INVENTORY_VARIANCE_REPORT_P2_99_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, INVENTORY_VARIANCE_REPORT_P2_99_CI_WORKFLOW), "utf8");
    expect(workflow).toContain(INVENTORY_VARIANCE_REPORT_P2_99_NPM_SCRIPT);

    expect(existsSync(join(ROOT, INVENTORY_VARIANCE_REPORT_P2_99_DOC))).toBe(true);
    expect(
      formatInventoryVarianceReportP2_99AuditLines(auditInventoryVarianceReportP2_99(ROOT)).length,
    ).toBeGreaterThan(5);
  });
});
