import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  buildDailyPlComparison,
  computeDayOverDayPctChange,
  resolveDailyRevenueTarget,
} from "@/lib/finance/daily-pl-widget-p2-47-measurement";
import {
  DAILY_PL_WIDGET_P2_47_DOC,
  DAILY_PL_WIDGET_P2_47_FLOW_STEPS,
  DAILY_PL_WIDGET_P2_47_HONESTY_MARKERS,
  DAILY_PL_WIDGET_P2_47_POLICY_ID,
  DAILY_PL_WIDGET_P2_47_SERVICE,
  DAILY_PL_WIDGET_P2_47_STRIP,
  DAILY_PL_WIDGET_P2_47_TARGET_TEST_ID,
  DAILY_PL_WIDGET_P2_47_TODAY_PAGE,
  DAILY_PL_WIDGET_P2_47_TODAY_ROUTE,
  DAILY_PL_WIDGET_P2_47_TODAY_TEST_ID,
  DAILY_PL_WIDGET_P2_47_ROOT_TEST_ID,
  DAILY_PL_WIDGET_P2_47_YESTERDAY_TEST_ID,
  DAILY_PL_WIDGET_P2_47_WIRING_PATHS,
} from "@/lib/finance/daily-pl-widget-p2-47-policy";

export type DailyPlWidgetP2_47AuditSummary = {
  policyId: typeof DAILY_PL_WIDGET_P2_47_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  serviceWired: boolean;
  stripWired: boolean;
  todayPageWired: boolean;
  goldenPlMathOk: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditDailyPlWidgetP2_47(root = process.cwd()): DailyPlWidgetP2_47AuditSummary {
  const wiringComplete = DAILY_PL_WIDGET_P2_47_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  if (existsSync(join(root, DAILY_PL_WIDGET_P2_47_DOC))) {
    const source = readFileSync(join(root, DAILY_PL_WIDGET_P2_47_DOC), "utf8").toLowerCase();
    docWired =
      source.includes("r365 parity") &&
      source.includes("today") &&
      source.includes("yesterday") &&
      source.includes("target");
  }

  let serviceWired = false;
  if (existsSync(join(root, DAILY_PL_WIDGET_P2_47_SERVICE))) {
    const source = readFileSync(join(root, DAILY_PL_WIDGET_P2_47_SERVICE), "utf8");
    serviceWired =
      source.includes("loadDailyPlWidgetModel") &&
      source.includes("revenueYesterday");
  }

  let stripWired = false;
  if (existsSync(join(root, DAILY_PL_WIDGET_P2_47_STRIP))) {
    const source = readFileSync(join(root, DAILY_PL_WIDGET_P2_47_STRIP), "utf8");
    stripWired =
      source.includes(DAILY_PL_WIDGET_P2_47_ROOT_TEST_ID) &&
      source.includes(DAILY_PL_WIDGET_P2_47_TODAY_TEST_ID) &&
      source.includes(DAILY_PL_WIDGET_P2_47_YESTERDAY_TEST_ID) &&
      source.includes(DAILY_PL_WIDGET_P2_47_TARGET_TEST_ID) &&
      source.includes("DailyPlWidgetStrip");
  }

  let todayPageWired = false;
  if (existsSync(join(root, DAILY_PL_WIDGET_P2_47_TODAY_PAGE))) {
    const source = readFileSync(join(root, DAILY_PL_WIDGET_P2_47_TODAY_PAGE), "utf8");
    todayPageWired =
      source.includes("DailyPlWidgetStrip") &&
      source.includes("loadDailyPlWidgetModel");
  }

  const target = resolveDailyRevenueTarget({ configuredTarget: 700, revenueWeek: 4900 });
  const comparison = buildDailyPlComparison({
    revenueToday: 800,
    revenueYesterday: 640,
    revenueTarget: target.target,
    targetSource: target.source,
  });
  const goldenPlMathOk =
    target.source === "configured" &&
    target.target === 700 &&
    computeDayOverDayPctChange(800, 640) === 25 &&
    comparison.paceLabel === "ahead";

  const combined = [DAILY_PL_WIDGET_P2_47_DOC, DAILY_PL_WIDGET_P2_47_STRIP]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = DAILY_PL_WIDGET_P2_47_HONESTY_MARKERS.every((marker) =>
    combined.toLowerCase().includes(marker.toLowerCase()),
  );

  const passed =
    wiringComplete &&
    docWired &&
    serviceWired &&
    stripWired &&
    todayPageWired &&
    goldenPlMathOk &&
    honestyMarkersPresent &&
    DAILY_PL_WIDGET_P2_47_FLOW_STEPS.length === 4;

  return {
    policyId: DAILY_PL_WIDGET_P2_47_POLICY_ID,
    wiringComplete,
    docWired,
    serviceWired,
    stripWired,
    todayPageWired,
    goldenPlMathOk,
    honestyMarkersPresent,
    passed,
  };
}

export function formatDailyPlWidgetP2_47AuditLines(
  summary: DailyPlWidgetP2_47AuditSummary,
): string[] {
  return [
    `Daily P&L widget audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc wired: ${summary.docWired ? "yes" : "no"} (${DAILY_PL_WIDGET_P2_47_DOC})`,
    `Service: ${summary.serviceWired ? "wired" : "missing"}`,
    `Widget strip: ${summary.stripWired ? "wired" : "missing"}`,
    `Today page: ${summary.todayPageWired ? "yes" : "no"} (${DAILY_PL_WIDGET_P2_47_TODAY_ROUTE})`,
    `Golden P&L math: ${summary.goldenPlMathOk ? "PASS" : "FAIL"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
