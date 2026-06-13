import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditLaborCostWidgetP2_49,
  formatLaborCostWidgetP2_49AuditLines,
} from "@/lib/staff/labor-cost-widget-p2-49-audit";
import {
  buildLaborCostComparison,
  computeLaborPercent,
  resolveTargetLaborPercent,
} from "@/lib/staff/labor-cost-widget-p2-49-measurement";
import {
  LABOR_COST_WIDGET_P2_49_AUDIT_SCRIPT,
  LABOR_COST_WIDGET_P2_49_CHECK_NPM_SCRIPT,
  LABOR_COST_WIDGET_P2_49_CI_WORKFLOW,
  LABOR_COST_WIDGET_P2_49_DOC,
  LABOR_COST_WIDGET_P2_49_FLOW_STEPS,
  LABOR_COST_WIDGET_P2_49_LABOR_ROUTE,
  LABOR_COST_WIDGET_P2_49_NPM_SCRIPT,
  LABOR_COST_WIDGET_P2_49_POLICY_ID,
  LABOR_COST_WIDGET_P2_49_TODAY_ROUTE,
  LABOR_COST_WIDGET_P2_49_UNIT_TEST,
} from "@/lib/staff/labor-cost-widget-p2-49-policy";

const ROOT = process.cwd();

describe("Labor cost widget (P2-49)", () => {
  it("locks policy id and 7shifts flow steps", () => {
    expect(LABOR_COST_WIDGET_P2_49_POLICY_ID).toBe("labor-cost-widget-p2-49-v1");
    expect(LABOR_COST_WIDGET_P2_49_TODAY_ROUTE).toBe("/dashboard/today");
    expect(LABOR_COST_WIDGET_P2_49_LABOR_ROUTE).toBe("/dashboard/staff/labor-realtime");
    expect(LABOR_COST_WIDGET_P2_49_FLOW_STEPS).toEqual([
      "aggregate_labor_hours_today",
      "aggregate_revenue_today",
      "compute_labor_percent",
      "render_labor_widget",
    ]);
  });

  it("computes labor percent vs revenue and target", () => {
    expect(computeLaborPercent(300, 1000)).toBe(30);

    const target = resolveTargetLaborPercent(null);
    expect(target.source).toBe("default");
    expect(target.target).toBe(30);

    const comparison = buildLaborCostComparison({
      laborCost: 360,
      totalRevenue: 1000,
      totalLaborHours: 18,
      activeStaff: 4,
      configuredTarget: 30,
    });
    expect(comparison.laborPercent).toBe(36);
    expect(comparison.status).toBe("OVER");
  });

  it("passes full labor cost widget audit", () => {
    const summary = auditLaborCostWidgetP2_49(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.serviceWired).toBe(true);
    expect(summary.stripWired).toBe(true);
    expect(summary.todayPageWired).toBe(true);
    expect(summary.goldenLaborMathOk).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
    expect(formatLaborCostWidgetP2_49AuditLines(summary).length).toBeGreaterThan(5);
  });

  it("registers audit script and npm wiring", () => {
    expect(existsSync(join(ROOT, LABOR_COST_WIDGET_P2_49_DOC))).toBe(true);
    expect(existsSync(join(ROOT, LABOR_COST_WIDGET_P2_49_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, LABOR_COST_WIDGET_P2_49_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[LABOR_COST_WIDGET_P2_49_NPM_SCRIPT]).toContain(
      "audit-labor-cost-widget-p2-49.ts",
    );
    expect(pkg.scripts?.[LABOR_COST_WIDGET_P2_49_CHECK_NPM_SCRIPT]).toContain(
      LABOR_COST_WIDGET_P2_49_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, LABOR_COST_WIDGET_P2_49_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("labor-cost-widget-p2-49");
  });
});
