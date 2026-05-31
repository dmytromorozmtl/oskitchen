import { describe, expect, it } from "vitest";

import {
  buildBenchmarkMetrics,
  buildForecastSection,
  detectReportingAnomalies,
} from "@/services/analytics/advanced-reporting-service";

describe("advanced reporting", () => {
  it("builds benchmark metrics with change percentages", () => {
    const benchmarks = buildBenchmarkMetrics({
      current: { revenue: 1200, orderCount: 40, aov: 30, cancelledCount: 2, cancellationRate: 0.05 },
      previous: { revenue: 1000, orderCount: 35, aov: 28.57, cancelledCount: 1, cancellationRate: 0.03 },
    });
    expect(benchmarks.find((row) => row.key === "revenue")?.changePercent).toBe(20);
    expect(benchmarks.find((row) => row.key === "orders")?.direction).toBe("up");
  });

  it("detects revenue and cancellation anomalies", () => {
    const anomalies = detectReportingAnomalies({
      benchmarks: buildBenchmarkMetrics({
        current: { revenue: 500, orderCount: 10, aov: 50, cancelledCount: 4, cancellationRate: 0.2 },
        previous: { revenue: 1000, orderCount: 20, aov: 50, cancelledCount: 1, cancellationRate: 0.05 },
      }),
      alertMessages: [],
      operational: [],
    });
    expect(anomalies.some((row) => row.id === "revenue_drop")).toBe(true);
    expect(anomalies.some((row) => row.id === "high_cancellations")).toBe(true);
  });

  it("builds a 7-day forecast from history", () => {
    const history = Array.from({ length: 14 }, (_, index) => ({
      date: `2026-05-${String(index + 1).padStart(2, "0")}`,
      value: 100,
    }));
    const forecast = buildForecastSection(history);
    expect(forecast.insufficientHistory).toBe(false);
    expect(forecast.daily).toHaveLength(7);
    expect(forecast.next7DaysRevenue).toBe(700);
  });
});
