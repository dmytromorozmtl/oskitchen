import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  buildChannelTodayForecasts,
  sumChannelTodayForecastTotals,
} from "@/lib/ai/predictive-daily-briefing-channel-forecast";
import {
  auditPredictiveDailyBriefingP2_38,
  formatPredictiveDailyBriefingP2_38AuditLines,
} from "@/lib/ai/predictive-daily-briefing-p2-38-audit";
import {
  PREDICTIVE_DAILY_BRIEFING_P2_38_AUDIT_SCRIPT,
  PREDICTIVE_DAILY_BRIEFING_P2_38_CHANNEL_COUNT,
  PREDICTIVE_DAILY_BRIEFING_P2_38_CHECK_NPM_SCRIPT,
  PREDICTIVE_DAILY_BRIEFING_P2_38_CI_WORKFLOW,
  PREDICTIVE_DAILY_BRIEFING_P2_38_COMPETITOR,
  PREDICTIVE_DAILY_BRIEFING_P2_38_DOC,
  PREDICTIVE_DAILY_BRIEFING_P2_38_FLOW_STEPS,
  PREDICTIVE_DAILY_BRIEFING_P2_38_NPM_SCRIPT,
  PREDICTIVE_DAILY_BRIEFING_P2_38_PANEL_TEST_ID,
  PREDICTIVE_DAILY_BRIEFING_P2_38_POLICY_ID,
  PREDICTIVE_DAILY_BRIEFING_P2_38_UNIT_TEST,
} from "@/lib/ai/predictive-daily-briefing-p2-38-policy";
import { ANALYTICS_CHANNEL_VALUES } from "@/lib/analytics/channel-attribution";

const ROOT = process.cwd();

describe("Predictive daily briefing — Toast IQ parity (P2-38)", () => {
  it("locks policy id, competitor, and four-step flow", () => {
    expect(PREDICTIVE_DAILY_BRIEFING_P2_38_POLICY_ID).toBe(
      "predictive-daily-briefing-p2-38-v1",
    );
    expect(PREDICTIVE_DAILY_BRIEFING_P2_38_COMPETITOR).toBe("toast");
    expect(PREDICTIVE_DAILY_BRIEFING_P2_38_FLOW_STEPS).toHaveLength(4);
    expect(PREDICTIVE_DAILY_BRIEFING_P2_38_CHANNEL_COUNT).toBe(ANALYTICS_CHANNEL_VALUES.length);
  });

  it("builds per-channel today forecasts from order history", () => {
    const now = new Date("2026-06-14T12:00:00.000Z");
    const lastWeek = new Date(now);
    lastWeek.setDate(lastWeek.getDate() - 7);
    const twoWeeksAgo = new Date(now);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const rows = [
      { createdAt: lastWeek, total: 200, importedFromProvider: "DOORDASH" as const, storefrontOrderId: null },
      { createdAt: twoWeeksAgo, total: 180, importedFromProvider: "DOORDASH" as const, storefrontOrderId: null },
      { createdAt: now, total: 50, importedFromProvider: "DOORDASH" as const, storefrontOrderId: null },
      { createdAt: lastWeek, total: 90, importedFromProvider: null, storefrontOrderId: "sf-1" },
    ];

    const forecasts = buildChannelTodayForecasts(rows, now);
    expect(forecasts.some((f) => f.channel === "DOORDASH")).toBe(true);
    expect(forecasts.some((f) => f.channel === "STOREFRONT")).toBe(true);

    const totals = sumChannelTodayForecastTotals(forecasts);
    expect(totals.actualOrders).toBeGreaterThanOrEqual(1);
    expect(totals.predictedOrders).toBeGreaterThanOrEqual(totals.actualOrders);
  });

  it("passes full predictive daily briefing audit", () => {
    const summary = auditPredictiveDailyBriefingP2_38(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.channelForecastWired).toBe(true);
    expect(summary.briefingServiceWired).toBe(true);
    expect(summary.panelWired).toBe(true);
    expect(summary.todayPageWired).toBe(true);
    expect(summary.goldenForecastOk).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("registers audit script and npm wiring", () => {
    expect(existsSync(join(ROOT, PREDICTIVE_DAILY_BRIEFING_P2_38_DOC))).toBe(true);
    expect(existsSync(join(ROOT, PREDICTIVE_DAILY_BRIEFING_P2_38_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, PREDICTIVE_DAILY_BRIEFING_P2_38_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[PREDICTIVE_DAILY_BRIEFING_P2_38_NPM_SCRIPT]).toContain(
      "audit-predictive-daily-briefing-p2-38.ts",
    );
    expect(pkg.scripts?.[PREDICTIVE_DAILY_BRIEFING_P2_38_CHECK_NPM_SCRIPT]).toContain(
      PREDICTIVE_DAILY_BRIEFING_P2_38_UNIT_TEST,
    );

    const archive = JSON.parse(
      readFileSync(join(ROOT, "config/npm-scripts/archive-v1.json"), "utf8"),
    ) as { scripts?: Record<string, string> };
    expect(archive.scripts?.["test:ci:predictive-daily-briefing-p2-38"]).toContain(
      PREDICTIVE_DAILY_BRIEFING_P2_38_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, PREDICTIVE_DAILY_BRIEFING_P2_38_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("predictive-daily-briefing-p2-38");
  });

  it("formats audit lines and panel test id", () => {
    const summary = auditPredictiveDailyBriefingP2_38(ROOT);
    const lines = formatPredictiveDailyBriefingP2_38AuditLines(summary);
    expect(lines.some((line) => line.includes(PREDICTIVE_DAILY_BRIEFING_P2_38_POLICY_ID))).toBe(
      true,
    );
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
    expect(PREDICTIVE_DAILY_BRIEFING_P2_38_PANEL_TEST_ID).toBe("predictive-daily-briefing-channels");
  });
});
