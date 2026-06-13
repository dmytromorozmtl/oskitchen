import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditDailyPlWidgetP2_47,
  formatDailyPlWidgetP2_47AuditLines,
} from "@/lib/finance/daily-pl-widget-p2-47-audit";
import {
  buildDailyPlComparison,
  computeDayOverDayPctChange,
  computeVsTargetPct,
  resolveDailyRevenueTarget,
} from "@/lib/finance/daily-pl-widget-p2-47-measurement";
import {
  DAILY_PL_WIDGET_P2_47_AUDIT_SCRIPT,
  DAILY_PL_WIDGET_P2_47_CHECK_NPM_SCRIPT,
  DAILY_PL_WIDGET_P2_47_CI_WORKFLOW,
  DAILY_PL_WIDGET_P2_47_DOC,
  DAILY_PL_WIDGET_P2_47_FLOW_STEPS,
  DAILY_PL_WIDGET_P2_47_NPM_SCRIPT,
  DAILY_PL_WIDGET_P2_47_POLICY_ID,
  DAILY_PL_WIDGET_P2_47_TODAY_ROUTE,
  DAILY_PL_WIDGET_P2_47_UNIT_TEST,
} from "@/lib/finance/daily-pl-widget-p2-47-policy";

const ROOT = process.cwd();

describe("Daily P&L widget (P2-47)", () => {
  it("locks policy id and R365 flow steps", () => {
    expect(DAILY_PL_WIDGET_P2_47_POLICY_ID).toBe("daily-pl-widget-p2-47-v1");
    expect(DAILY_PL_WIDGET_P2_47_TODAY_ROUTE).toBe("/dashboard/today");
    expect(DAILY_PL_WIDGET_P2_47_FLOW_STEPS).toEqual([
      "aggregate_revenue_today",
      "aggregate_revenue_yesterday",
      "resolve_daily_target",
      "render_pl_widget",
    ]);
  });

  it("computes today vs yesterday vs target comparison", () => {
    expect(computeDayOverDayPctChange(1250, 1000)).toBe(25);
    expect(computeVsTargetPct(900, 1000)).toBe(90);

    const target = resolveDailyRevenueTarget({ configuredTarget: null, revenueWeek: 7000 });
    expect(target.source).toBe("weekly_average");
    expect(target.target).toBe(1000);

    const comparison = buildDailyPlComparison({
      revenueToday: 1100,
      revenueYesterday: 1000,
      revenueTarget: 1000,
      targetSource: "weekly_average",
    });
    expect(comparison.paceLabel).toBe("ahead");
  });

  it("passes full daily P&L widget audit", () => {
    const summary = auditDailyPlWidgetP2_47(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.serviceWired).toBe(true);
    expect(summary.stripWired).toBe(true);
    expect(summary.todayPageWired).toBe(true);
    expect(summary.goldenPlMathOk).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
    expect(formatDailyPlWidgetP2_47AuditLines(summary).length).toBeGreaterThan(5);
  });

  it("registers audit script and npm wiring", () => {
    expect(existsSync(join(ROOT, DAILY_PL_WIDGET_P2_47_DOC))).toBe(true);
    expect(existsSync(join(ROOT, DAILY_PL_WIDGET_P2_47_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, DAILY_PL_WIDGET_P2_47_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[DAILY_PL_WIDGET_P2_47_NPM_SCRIPT]).toContain(
      "audit-daily-pl-widget-p2-47.ts",
    );
    expect(pkg.scripts?.[DAILY_PL_WIDGET_P2_47_CHECK_NPM_SCRIPT]).toContain(
      DAILY_PL_WIDGET_P2_47_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, DAILY_PL_WIDGET_P2_47_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("daily-pl-widget-p2-47");
  });
});
