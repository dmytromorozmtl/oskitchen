import { describe, expect, it } from "vitest";

import {
  assembleBenchmarkNetworkResult,
  buildBenchmarkMetric,
  gaugeToneForPercentile,
  percentileRank,
  trendFromDelta,
  BENCHMARK_METRIC_SPECS,
} from "@/lib/ai/benchmark-network-builders";
import { selectCohortForBusinessType } from "@/lib/ai/benchmark-cohort-seeds";
import { buildWorkspaceMetricSnapshot } from "@/lib/ai/benchmark-workspace-metrics";

describe("benchmark network builders", () => {
  it("computes percentile rank — higher is better", () => {
    const bench = { bottomQuartile: 20, industryAverage: 30, topQuartile: 40 };
    expect(percentileRank(45, bench, true)).toBeGreaterThan(75);
    expect(percentileRank(15, bench, true)).toBeLessThan(30);
    expect(percentileRank(30, bench, true)).toBeGreaterThan(40);
    expect(percentileRank(30, bench, true)).toBeLessThan(60);
  });

  it("computes percentile rank — lower is better", () => {
    const bench = { bottomQuartile: 28, industryAverage: 30, topQuartile: 34 };
    expect(percentileRank(26, bench, false)).toBeGreaterThan(60);
    expect(percentileRank(36, bench, false)).toBeLessThan(40);
  });

  it("maps trend from delta", () => {
    expect(trendFromDelta(0.1)).toBe("up");
    expect(trendFromDelta(-0.08)).toBe("down");
    expect(trendFromDelta(0.005)).toBe("stable");
    expect(trendFromDelta(null)).toBe("stable");
  });

  it("builds benchmark metric with cohort sample size", () => {
    const spec = BENCHMARK_METRIC_SPECS.find((s) => s.key === "avg_ticket")!;
    const metric = buildBenchmarkMetric(
      spec,
      22,
      { key: "avg_ticket", bottomQuartile: 18, industryAverage: 21, topQuartile: 28 },
      1240,
      0.05,
    );
    expect(metric.yourValue).toBe(22);
    expect(metric.trend).toBe("up");
    expect(metric.sampleSize).toBe(1240);
  });

  it("assembles network result with 20+ metric specs defined", () => {
    expect(BENCHMARK_METRIC_SPECS.length).toBeGreaterThanOrEqual(20);
  });

  it("assembles result from workspace snapshot and cohort", () => {
    const cohort = selectCohortForBusinessType("RESTAURANT");
    const snapshot = buildWorkspaceMetricSnapshot({
      windowDays: 30,
      executive: {
        netRevenue: 60000,
        orderCount: 2400,
        aov: 25,
        repeatRate: 0.38,
        productionCompletion: 94,
        packingAccuracy: 98,
        deliveryCompletion: 96,
        inventoryShortages: 3,
        imminentShortages: 1,
        purchasingNeeds: 12,
        stalePurchaseOrders: 2,
        openTasks: 5,
        overdueTasks: 1,
        cateringOpenPipeline: 3,
        mealPlanActive: 0,
        failedIntegrations: 1,
        revenueTrend: 0.05,
        orderTrend: 0.03,
        marginMedian: 62,
        productionTotal: 100,
        overdueProductionItems: 4,
        channelMix: [{ channel: "pos", revenue: 40000, orders: 1600 }, { channel: "web", revenue: 20000, orders: 800 }],
        topProducts: [{ title: "Burger", quantity: 3600 }],
        costingVarianceAlerts: [{ id: "1" }],
        health: { score: 82, status: "Healthy", explanation: "", contributions: [] },
      } as never,
      foodCost: {
        overallFoodCostPercent: 29,
        overallGrossMarginPercent: 64,
        itemAnalyses: [],
      } as never,
      laborCostPercent: 26,
      kdsWaitMinutes: 10,
    });

    const result = assembleBenchmarkNetworkResult({
      workspaceId: "ws-1",
      cohort,
      snapshot,
    });

    expect(result.metrics.length).toBeGreaterThanOrEqual(15);
    expect(result.cohort.anonymized).toBe(true);
    expect(result.summary.metricCount).toBe(result.metrics.length);
    expect(result.confidence).toBeGreaterThan(0.5);
    expect(result.aiAssisted).toBe(true);
  });

  it("gauge tone reflects percentile bands", () => {
    expect(gaugeToneForPercentile(80)).toBe("green");
    expect(gaugeToneForPercentile(50)).toBe("yellow");
    expect(gaugeToneForPercentile(20)).toBe("red");
  });
});
