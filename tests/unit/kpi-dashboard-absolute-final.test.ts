import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { auditKpiDashboardWiring } from "@/lib/platform/kpi-dashboard-audit";
import {
  KPI_DASHBOARD_ABSOLUTE_FINAL_POLICY_ID,
  KPI_DASHBOARD_CI_SCRIPTS,
  KPI_DASHBOARD_DOC_PATH,
  KPI_DASHBOARD_METRIC_IDS,
  KPI_DASHBOARD_ROUTE,
  KPI_DASHBOARD_UNIT_TEST,
} from "@/lib/platform/kpi-dashboard-absolute-final-policy";
import {
  computeErrorRatePct,
  computeMedianHours,
  computePlatformUptimePct,
  parseNpsScoreFromTitle,
  summarizeNpsFromScores,
  sumObservabilityErrors,
} from "@/lib/platform/kpi-dashboard-metrics";

const ROOT = process.cwd();

describe("KPI dashboard (Absolute Final Task 68)", () => {
  it("locks absolute final policy with six core metrics", () => {
    expect(KPI_DASHBOARD_ABSOLUTE_FINAL_POLICY_ID).toBe("kpi-dashboard-absolute-final-v1");
    expect(KPI_DASHBOARD_ROUTE).toBe("/platform/kpi");
    expect(KPI_DASHBOARD_METRIC_IDS).toEqual([
      "mrr",
      "nps",
      "ttf",
      "uptime",
      "error_rate",
      "dau",
    ]);
  });

  it("parses NPS scores and computes portfolio NPS", () => {
    expect(parseNpsScoreFromTitle("NPS 9/10")).toBe(9);
    expect(parseNpsScoreFromTitle("NPS 4/10")).toBe(4);
    expect(parseNpsScoreFromTitle("Feedback")).toBeNull();

    const summary = summarizeNpsFromScores([10, 9, 8, 5, 3]);
    expect(summary.promoters).toBe(2);
    expect(summary.detractors).toBe(2);
    expect(summary.nps).toBe(0);
  });

  it("computes median TTF hours and error rate", () => {
    expect(computeMedianHours([24, 48, 72])).toBe(48);
    expect(computeErrorRatePct(5, 100)).toBe(5);
    expect(computeErrorRatePct(0, 0)).toBe(0);
  });

  it("computes platform uptime composite", () => {
    const uptime = computePlatformUptimePct({
      databaseOk: true,
      cronOk: true,
      integrationErrorRate: 0,
    });
    expect(uptime).toBe(100);
  });

  it("sums observability error signals", () => {
    const total = sumObservabilityErrors({
      webhookProcessingErrors7d: 2,
      channelSyncFailed: 1,
      notificationFailures7d: 0,
      importJobsFailed: 0,
      channelImportBatchesFailed: 0,
      exportJobsFailed: 0,
      automationExecutionsFailed7d: 1,
      auditExportsFailed7d: 0,
      openWebhookJobRecoveries: 0,
    });
    expect(total).toBe(4);
  });

  it("documents six KPIs with honesty rules", () => {
    const doc = readFileSync(join(ROOT, KPI_DASHBOARD_DOC_PATH), "utf8");
    expect(doc).toContain("kpi-dashboard-absolute-final-v1");
    expect(doc).toContain("Never guess paid state");
    for (const id of KPI_DASHBOARD_METRIC_IDS) {
      expect(doc.toLowerCase()).toMatch(new RegExp(id.replace("_", "[ _]")));
    }
  });

  it("passes wiring audit", () => {
    const audit = auditKpiDashboardWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
  });

  it("ships npm cert scripts", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    for (const script of KPI_DASHBOARD_CI_SCRIPTS) {
      expect(pkg.scripts?.[script]).toBeTruthy();
    }
    expect(KPI_DASHBOARD_UNIT_TEST).toBe("tests/unit/kpi-dashboard-absolute-final.test.ts");
  });
});
