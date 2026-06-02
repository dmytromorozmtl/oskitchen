import { describe, expect, it } from "vitest";

import {
  appendHistoryPoint,
  buildOpportunities,
  buildRadarMetrics,
  estimateOpportunityImpact,
  buildContributionInfo,
} from "@/lib/ai/benchmark-dashboard-builders";
import type { BenchmarkMetric } from "@/lib/ai/benchmark-network-types";

function metric(overrides: Partial<BenchmarkMetric> & Pick<BenchmarkMetric, "key" | "label">): BenchmarkMetric {
  return {
    category: "cost",
    unit: "percent",
    yourValue: 35,
    industryAverage: 30,
    topQuartile: 28,
    bottomQuartile: 32,
    percentileRank: 30,
    sampleSize: 1000,
    trend: "stable",
    higherIsBetter: false,
    ...overrides,
  };
}

describe("benchmark dashboard builders", () => {
  it("builds radar from available metrics", () => {
    const metrics = [
      metric({ key: "food_cost_percent", label: "Food cost %", percentileRank: 55 }),
      metric({ key: "gross_margin_percent", label: "Gross margin %", higherIsBetter: true, percentileRank: 62 }),
    ];
    const radar = buildRadarMetrics(metrics);
    expect(radar).toHaveLength(2);
    expect(radar[0]!.you).toBe(55);
    expect(radar[0]!.industry).toBe(50);
  });

  it("estimates opportunity impact for weak food cost", () => {
    const m = metric({ key: "food_cost_percent", label: "Food cost %", yourValue: 35, topQuartile: 28 });
    const impact = estimateOpportunityImpact(m, { revenuePerDay: 2000, ordersPerDay: 80 });
    expect(impact).toBeGreaterThan(0);
  });

  it("builds opportunities from weak metrics only", () => {
    const metrics = [
      metric({ key: "food_cost_percent", label: "Food cost %", percentileRank: 20 }),
      metric({ key: "gross_margin_percent", label: "Gross margin %", higherIsBetter: true, percentileRank: 80 }),
    ];
    const opps = buildOpportunities(metrics, { revenuePerDay: 1500, ordersPerDay: 60 });
    expect(opps).toHaveLength(1);
    expect(opps[0]!.metricKey).toBe("food_cost_percent");
    expect(opps[0]!.estimatedImpactUsd).toBeGreaterThan(0);
  });

  it("appends history without duplicate dates", () => {
    const next = appendHistoryPoint(
      [{ date: "2026-06-01", averagePercentile: 55, metricCount: 20 }],
      { date: "2026-06-01", averagePercentile: 58, metricCount: 21 },
    );
    expect(next).toHaveLength(1);
    expect(next[0]!.averagePercentile).toBe(58);
  });

  it("builds contribution info with privacy note", () => {
    const info = buildContributionInfo({
      networkStatus: {
        totalRestaurants: 2751,
        cohortsAvailable: 4,
        liveContributors: 1,
        contributionImpact: "+0.1% cohort precision",
        contributionImpactScore: 12,
        yourContribution: null,
      },
    });
    expect(info.contributing).toBe(false);
    expect(info.networkRestaurants).toBe(2751);
    expect(info.liveContributors).toBe(1);
    expect(info.privacyNote).toContain("anonymized");
  });
});
