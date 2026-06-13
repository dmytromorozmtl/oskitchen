import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  buildLaborCostComparison,
  computeLaborPercent,
  resolveTargetLaborPercent,
} from "@/lib/staff/labor-cost-widget-p2-49-measurement";
import {
  LABOR_COST_WIDGET_P2_49_DOC,
  LABOR_COST_WIDGET_P2_49_FLOW_STEPS,
  LABOR_COST_WIDGET_P2_49_HONESTY_MARKERS,
  LABOR_COST_WIDGET_P2_49_LABOR_ROUTE,
  LABOR_COST_WIDGET_P2_49_PERCENT_TEST_ID,
  LABOR_COST_WIDGET_P2_49_POLICY_ID,
  LABOR_COST_WIDGET_P2_49_REVENUE_TEST_ID,
  LABOR_COST_WIDGET_P2_49_SERVICE,
  LABOR_COST_WIDGET_P2_49_STRIP,
  LABOR_COST_WIDGET_P2_49_TARGET_TEST_ID,
  LABOR_COST_WIDGET_P2_49_TODAY_PAGE,
  LABOR_COST_WIDGET_P2_49_TODAY_ROUTE,
  LABOR_COST_WIDGET_P2_49_ROOT_TEST_ID,
  LABOR_COST_WIDGET_P2_49_WIRING_PATHS,
} from "@/lib/staff/labor-cost-widget-p2-49-policy";

export type LaborCostWidgetP2_49AuditSummary = {
  policyId: typeof LABOR_COST_WIDGET_P2_49_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  serviceWired: boolean;
  stripWired: boolean;
  todayPageWired: boolean;
  goldenLaborMathOk: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditLaborCostWidgetP2_49(root = process.cwd()): LaborCostWidgetP2_49AuditSummary {
  const wiringComplete = LABOR_COST_WIDGET_P2_49_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  if (existsSync(join(root, LABOR_COST_WIDGET_P2_49_DOC))) {
    const source = readFileSync(join(root, LABOR_COST_WIDGET_P2_49_DOC), "utf8").toLowerCase();
    docWired =
      source.includes("7shifts parity") &&
      source.includes("labor") &&
      source.includes("revenue") &&
      source.includes("real-time");
  }

  let serviceWired = false;
  if (existsSync(join(root, LABOR_COST_WIDGET_P2_49_SERVICE))) {
    const source = readFileSync(join(root, LABOR_COST_WIDGET_P2_49_SERVICE), "utf8");
    serviceWired =
      source.includes("loadLaborCostWidgetModel") &&
      source.includes("getLaborRealtimeData");
  }

  let stripWired = false;
  if (existsSync(join(root, LABOR_COST_WIDGET_P2_49_STRIP))) {
    const source = readFileSync(join(root, LABOR_COST_WIDGET_P2_49_STRIP), "utf8");
    stripWired =
      source.includes(LABOR_COST_WIDGET_P2_49_ROOT_TEST_ID) &&
      source.includes(LABOR_COST_WIDGET_P2_49_PERCENT_TEST_ID) &&
      source.includes(LABOR_COST_WIDGET_P2_49_REVENUE_TEST_ID) &&
      source.includes(LABOR_COST_WIDGET_P2_49_TARGET_TEST_ID) &&
      source.includes("LaborCostWidgetStrip");
  }

  let todayPageWired = false;
  if (existsSync(join(root, LABOR_COST_WIDGET_P2_49_TODAY_PAGE))) {
    const source = readFileSync(join(root, LABOR_COST_WIDGET_P2_49_TODAY_PAGE), "utf8");
    todayPageWired =
      source.includes("LaborCostWidgetStrip") && source.includes("loadLaborCostWidgetModel");
  }

  const target = resolveTargetLaborPercent(28);
  const comparison = buildLaborCostComparison({
    laborCost: 280,
    totalRevenue: 1000,
    totalLaborHours: 14,
    activeStaff: 3,
    configuredTarget: 28,
  });
  const goldenLaborMathOk =
    target.source === "configured" &&
    target.target === 28 &&
    computeLaborPercent(280, 1000) === 28 &&
    comparison.status === "ON_TRACK";

  const combined = [LABOR_COST_WIDGET_P2_49_DOC, LABOR_COST_WIDGET_P2_49_STRIP]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = LABOR_COST_WIDGET_P2_49_HONESTY_MARKERS.every((marker) =>
    combined.toLowerCase().includes(marker.toLowerCase()),
  );

  const passed =
    wiringComplete &&
    docWired &&
    serviceWired &&
    stripWired &&
    todayPageWired &&
    goldenLaborMathOk &&
    honestyMarkersPresent &&
    LABOR_COST_WIDGET_P2_49_FLOW_STEPS.length === 4 &&
    LABOR_COST_WIDGET_P2_49_LABOR_ROUTE === "/dashboard/staff/labor-realtime";

  return {
    policyId: LABOR_COST_WIDGET_P2_49_POLICY_ID,
    wiringComplete,
    docWired,
    serviceWired,
    stripWired,
    todayPageWired,
    goldenLaborMathOk,
    honestyMarkersPresent,
    passed,
  };
}

export function formatLaborCostWidgetP2_49AuditLines(
  summary: LaborCostWidgetP2_49AuditSummary,
): string[] {
  return [
    `Labor cost widget audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc wired: ${summary.docWired ? "yes" : "no"} (${LABOR_COST_WIDGET_P2_49_DOC})`,
    `Service: ${summary.serviceWired ? "wired" : "missing"}`,
    `Widget strip: ${summary.stripWired ? "wired" : "missing"}`,
    `Today page: ${summary.todayPageWired ? "yes" : "no"} (${LABOR_COST_WIDGET_P2_49_TODAY_ROUTE})`,
    `Golden labor math: ${summary.goldenLaborMathOk ? "PASS" : "FAIL"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
