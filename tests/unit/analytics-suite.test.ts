import { describe, expect, it } from "vitest";

import {
  buildAnalyticsSuiteLane,
  buildAnalyticsSuiteMetric,
  buildAnalyticsSuiteSnapshot,
  formatMoney,
  formatRate,
} from "@/lib/analytics/analytics-suite-builders";
import {
  ANALYTICS_SUITE_DEFAULT_DAYS,
  ANALYTICS_SUITE_PATH,
  ANALYTICS_SUITE_POLICY_ID,
  ANALYTICS_SUITE_SERVICE,
} from "@/lib/analytics/analytics-suite-policy";

describe("Analytics Suite", () => {
  it("locks policy constants", () => {
    expect(ANALYTICS_SUITE_POLICY_ID).toBe("analytics-suite-v1");
    expect(ANALYTICS_SUITE_SERVICE).toBe("services/analytics/analytics-suite-service.ts");
    expect(ANALYTICS_SUITE_PATH).toBe("/dashboard/analytics/suite");
    expect(ANALYTICS_SUITE_DEFAULT_DAYS).toBe(30);
  });

  it("builds metric and lane helpers", () => {
    const metric = buildAnalyticsSuiteMetric({
      id: "gross-revenue",
      label: "Gross revenue",
      value: formatMoney(12500),
      hint: "Net $11,200",
      href: "/dashboard/analytics/revenue",
    });
    expect(metric.id).toBe("gross-revenue");
    expect(metric.value).toContain("$");

    const lane = buildAnalyticsSuiteLane({
      id: "revenue",
      metrics: [metric],
    });
    expect(lane.label).toBe("Revenue");
    expect(lane.metrics).toHaveLength(1);
  });

  it("assembles analytics suite snapshot", () => {
    const snapshot = buildAnalyticsSuiteSnapshot({
      rangeLabel: "2026-05-01 → 2026-05-31",
      warnings: ["Low order volume in window"],
      lanes: [
        buildAnalyticsSuiteLane({
          id: "orders",
          metrics: [
            buildAnalyticsSuiteMetric({
              id: "order-count",
              label: "Orders",
              value: "120",
              hint: `${formatRate(0.04)} cancellation`,
            }),
          ],
        }),
      ],
      analyzedAt: new Date("2026-06-05T12:00:00Z"),
    });

    expect(snapshot.policyId).toBe(ANALYTICS_SUITE_POLICY_ID);
    expect(snapshot.basePath).toBe(ANALYTICS_SUITE_PATH);
    expect(snapshot.summary.metricCount).toBe(1);
    expect(snapshot.summary.laneCount).toBe(1);
    expect(snapshot.summary.warningCount).toBe(1);
    expect(snapshot.generatedAtIso).toBe("2026-06-05T12:00:00.000Z");
  });
});
