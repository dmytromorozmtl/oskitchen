import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  buildChannelTodayForecasts,
  sumChannelTodayForecastTotals,
} from "@/lib/ai/predictive-daily-briefing-channel-forecast";
import {
  PREDICTIVE_DAILY_BRIEFING_P2_38_BRIEFING_SERVICE,
  PREDICTIVE_DAILY_BRIEFING_P2_38_CHANNEL_FORECAST_MODULE,
  PREDICTIVE_DAILY_BRIEFING_P2_38_CHANNEL_COUNT,
  PREDICTIVE_DAILY_BRIEFING_P2_38_DOC,
  PREDICTIVE_DAILY_BRIEFING_P2_38_FLOW_STEPS,
  PREDICTIVE_DAILY_BRIEFING_P2_38_HONESTY_MARKERS,
  PREDICTIVE_DAILY_BRIEFING_P2_38_PANEL,
  PREDICTIVE_DAILY_BRIEFING_P2_38_PANEL_TEST_ID,
  PREDICTIVE_DAILY_BRIEFING_P2_38_POLICY_ID,
  PREDICTIVE_DAILY_BRIEFING_P2_38_TODAY_PAGE,
  PREDICTIVE_DAILY_BRIEFING_P2_38_TODAY_ROUTE,
  PREDICTIVE_DAILY_BRIEFING_P2_38_WIRING_PATHS,
} from "@/lib/ai/predictive-daily-briefing-p2-38-policy";

export type PredictiveDailyBriefingP2_38AuditSummary = {
  policyId: typeof PREDICTIVE_DAILY_BRIEFING_P2_38_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  channelForecastWired: boolean;
  briefingServiceWired: boolean;
  panelWired: boolean;
  todayPageWired: boolean;
  goldenForecastOk: boolean;
  flowStepCount: number;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditPredictiveDailyBriefingP2_38(
  root = process.cwd(),
): PredictiveDailyBriefingP2_38AuditSummary {
  const wiringComplete = PREDICTIVE_DAILY_BRIEFING_P2_38_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  if (existsSync(join(root, PREDICTIVE_DAILY_BRIEFING_P2_38_DOC))) {
    const source = readFileSync(join(root, PREDICTIVE_DAILY_BRIEFING_P2_38_DOC), "utf8");
    docWired =
      source.includes(PREDICTIVE_DAILY_BRIEFING_P2_38_TODAY_ROUTE) &&
      source.includes(String(PREDICTIVE_DAILY_BRIEFING_P2_38_CHANNEL_COUNT)) &&
      source.includes("Toast IQ parity");
  }

  let channelForecastWired = false;
  if (existsSync(join(root, PREDICTIVE_DAILY_BRIEFING_P2_38_CHANNEL_FORECAST_MODULE))) {
    const source = readFileSync(
      join(root, PREDICTIVE_DAILY_BRIEFING_P2_38_CHANNEL_FORECAST_MODULE),
      "utf8",
    );
    channelForecastWired =
      source.includes("buildChannelTodayForecasts") &&
      source.includes("ANALYTICS_CHANNEL_VALUES");
  }

  let briefingServiceWired = false;
  if (existsSync(join(root, PREDICTIVE_DAILY_BRIEFING_P2_38_BRIEFING_SERVICE))) {
    const source = readFileSync(join(root, PREDICTIVE_DAILY_BRIEFING_P2_38_BRIEFING_SERVICE), "utf8");
    briefingServiceWired =
      source.includes("buildChannelTodayForecasts") &&
      source.includes("channelForecasts") &&
      source.includes("loadChannelOrderHistory");
  }

  let panelWired = false;
  if (existsSync(join(root, PREDICTIVE_DAILY_BRIEFING_P2_38_PANEL))) {
    const source = readFileSync(join(root, PREDICTIVE_DAILY_BRIEFING_P2_38_PANEL), "utf8");
    panelWired =
      source.includes(PREDICTIVE_DAILY_BRIEFING_P2_38_PANEL_TEST_ID) &&
      source.includes("channelForecasts") &&
      source.includes("Today by channel");
  }

  let todayPageWired = false;
  if (existsSync(join(root, PREDICTIVE_DAILY_BRIEFING_P2_38_TODAY_PAGE))) {
    const source = readFileSync(join(root, PREDICTIVE_DAILY_BRIEFING_P2_38_TODAY_PAGE), "utf8");
    todayPageWired =
      source.includes("generateDailyBriefing") &&
      source.includes("wantsOwnerBriefing") &&
      source.includes("AiBriefingPanel");
  }

  const now = new Date("2026-06-14T14:00:00.000Z");
  const lastWeek = new Date(now);
  lastWeek.setDate(lastWeek.getDate() - 7);
  const twoWeeksAgo = new Date(now);
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  const goldenRows = [
    { createdAt: lastWeek, total: 120, importedFromProvider: "DOORDASH" as const, storefrontOrderId: null },
    { createdAt: twoWeeksAgo, total: 100, importedFromProvider: "DOORDASH" as const, storefrontOrderId: null },
    { createdAt: now, total: 45, importedFromProvider: "DOORDASH" as const, storefrontOrderId: null },
    { createdAt: lastWeek, total: 80, importedFromProvider: null, storefrontOrderId: "sf-1" },
    { createdAt: twoWeeksAgo, total: 90, importedFromProvider: null, storefrontOrderId: "sf-2" },
  ];
  const golden = buildChannelTodayForecasts(goldenRows, now);
  const totals = sumChannelTodayForecastTotals(golden);
  const goldenForecastOk =
    golden.some((r) => r.channel === "DOORDASH") &&
    golden.some((r) => r.channel === "STOREFRONT") &&
    totals.actualOrders >= 1 &&
    totals.predictedOrders >= totals.actualOrders;

  const combined = [
    PREDICTIVE_DAILY_BRIEFING_P2_38_DOC,
    PREDICTIVE_DAILY_BRIEFING_P2_38_PANEL,
  ]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = PREDICTIVE_DAILY_BRIEFING_P2_38_HONESTY_MARKERS.every((marker) =>
    combined.toLowerCase().includes(marker.toLowerCase()),
  );

  const passed =
    wiringComplete &&
    docWired &&
    channelForecastWired &&
    briefingServiceWired &&
    panelWired &&
    todayPageWired &&
    goldenForecastOk &&
    honestyMarkersPresent &&
    PREDICTIVE_DAILY_BRIEFING_P2_38_FLOW_STEPS.length === 4;

  return {
    policyId: PREDICTIVE_DAILY_BRIEFING_P2_38_POLICY_ID,
    wiringComplete,
    docWired,
    channelForecastWired,
    briefingServiceWired,
    panelWired,
    todayPageWired,
    goldenForecastOk,
    flowStepCount: PREDICTIVE_DAILY_BRIEFING_P2_38_FLOW_STEPS.length,
    honestyMarkersPresent,
    passed,
  };
}

export function formatPredictiveDailyBriefingP2_38AuditLines(
  summary: PredictiveDailyBriefingP2_38AuditSummary,
): string[] {
  return [
    `Predictive daily briefing audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc wired: ${summary.docWired ? "yes" : "no"} (${PREDICTIVE_DAILY_BRIEFING_P2_38_DOC})`,
    `Channel forecast module: ${summary.channelForecastWired ? "wired" : "missing"}`,
    `Briefing service: ${summary.briefingServiceWired ? "wired" : "missing"}`,
    `Today panel: ${summary.panelWired ? "wired" : "missing"}`,
    `Today page owner visibility: ${summary.todayPageWired ? "yes" : "no"}`,
    `Golden forecast: ${summary.goldenForecastOk ? "PASS" : "FAIL"}`,
    `Flow steps: ${summary.flowStepCount}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
