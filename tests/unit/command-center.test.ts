import { describe, expect, it } from "vitest";

import {
  buildCommandCenterAlertsFromBlockers,
  buildCommandCenterLane,
  buildCommandCenterSnapshot,
  buildCommandCenterTicker,
  formatMoney,
} from "@/lib/command-center/command-center-builders";
import {
  COMMAND_CENTER_LANE_IDS,
  COMMAND_CENTER_PATH,
  COMMAND_CENTER_POLICY_ID,
  COMMAND_CENTER_SERVICE,
} from "@/lib/command-center/command-center-policy";

describe("Command Center", () => {
  it("locks policy constants", () => {
    expect(COMMAND_CENTER_POLICY_ID).toBe("command-center-v1");
    expect(COMMAND_CENTER_SERVICE).toBe("services/command-center/command-center-service.ts");
    expect(COMMAND_CENTER_PATH).toBe("/dashboard/command-center");
    expect(COMMAND_CENTER_LANE_IDS).toEqual([
      "market",
      "operations",
      "live",
      "forecast",
      "roles",
    ]);
  });

  it("builds tickers, lanes, and alerts", () => {
    const ticker = buildCommandCenterTicker({
      id: "rev",
      symbol: "REV",
      label: "Gross revenue",
      value: formatMoney(12500),
      tone: "positive",
      href: "/dashboard/analytics/revenue",
    });
    expect(ticker.symbol).toBe("REV");

    const lane = buildCommandCenterLane({
      id: "market",
      tickers: [ticker],
    });
    expect(lane.label).toBe("MARKET");

    const alerts = buildCommandCenterAlertsFromBlockers([
      {
        id: "blk-1",
        title: "Webhook backlog",
        detail: "3 events pending",
        href: "/dashboard/integrations",
        priority: 1,
      },
    ]);
    expect(alerts[0].severity).toBe("critical");

    const snapshot = buildCommandCenterSnapshot({
      workspaceLabel: "Demo Kitchen",
      rangeLabel: "2026-05-01 → 2026-05-31",
      lanes: [lane],
      alerts,
      blockerCount: 1,
      analyzedAt: new Date("2026-06-05T12:00:00Z"),
    });

    expect(snapshot.policyId).toBe(COMMAND_CENTER_POLICY_ID);
    expect(snapshot.basePath).toBe(COMMAND_CENTER_PATH);
    expect(snapshot.summary.tickerCount).toBe(1);
    expect(snapshot.summary.laneCount).toBe(1);
    expect(snapshot.summary.alertCount).toBe(1);
    expect(snapshot.generatedAtIso).toBe("2026-06-05T12:00:00.000Z");
  });
});
