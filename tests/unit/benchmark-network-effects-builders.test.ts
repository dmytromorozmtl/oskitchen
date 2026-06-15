import { describe, expect, it } from "vitest";

import {
  aggregateCohortStats,
  anonymizeMetrics,
  buildAnonymizedContribution,
  computeContributionImpact,
  computeNetworkStatus,
  hashWorkspaceId,
  upsertContribution,
} from "@/lib/ai/benchmark-network-effects-builders";
import { emptyBenchmarkPool } from "@/lib/ai/benchmark-network-effects-builders";
import { BENCHMARK_COHORTS } from "@/lib/ai/benchmark-cohort-seeds";
import type { BenchmarkMetric } from "@/lib/ai/benchmark-network-types";

function sampleMetric(overrides: Partial<BenchmarkMetric> = {}): BenchmarkMetric {
  return {
    key: "food_cost_percent",
    label: "Food cost %",
    category: "cost",
    unit: "percent",
    yourValue: 31.47,
    industryAverage: 30,
    topQuartile: 28,
    bottomQuartile: 32,
    percentileRank: 55,
    sampleSize: 1000,
    trend: "stable",
    higherIsBetter: false,
    ...overrides,
  };
}

describe("benchmark network effects builders", () => {
  it("hashes workspace id to stable anon id", () => {
    expect(hashWorkspaceId("ws-abc")).toHaveLength(12);
    expect(hashWorkspaceId("ws-abc")).toBe(hashWorkspaceId("ws-abc"));
    expect(hashWorkspaceId("ws-abc")).not.toBe(hashWorkspaceId("ws-xyz"));
  });

  it("anonymizes metrics with bucketing", () => {
    const anon = anonymizeMetrics([
      sampleMetric({ yourValue: 31.47 }),
      sampleMetric({ key: "avg_ticket", unit: "currency", yourValue: 73.8 }),
    ]);
    expect(anon[0]!.value).toBe(31.5);
    expect(anon[1]!.value).toBe(50);
  });

  it("builds anonymized contribution without raw workspace id", () => {
    const c = buildAnonymizedContribution({
      workspaceId: "ws-secret",
      cohortId: "restaurant-na",
      businessType: "RESTAURANT",
      region: "North America",
      metrics: [sampleMetric()],
    });
    expect(c.anonId).not.toContain("secret");
    expect(c.metrics).toHaveLength(1);
  });

  it("upserts contribution into pool", () => {
    const pool = emptyBenchmarkPool();
    const c = buildAnonymizedContribution({
      workspaceId: "ws-1",
      cohortId: "restaurant-na",
      businessType: "RESTAURANT",
      region: "North America",
      metrics: [sampleMetric()],
    });
    const next = upsertContribution(pool, c);
    expect(next.contributions).toHaveLength(1);
    expect(next.cohortStats["restaurant-na"]!.restaurantCount).toBe(1);
  });

  it("aggregates cohort metric averages", () => {
    const stats = aggregateCohortStats([
      buildAnonymizedContribution({
        workspaceId: "ws-1",
        cohortId: "cafe-na",
        businessType: "CAFE",
        region: "NA",
        metrics: [sampleMetric({ yourValue: 30 })],
      }),
      buildAnonymizedContribution({
        workspaceId: "ws-2",
        cohortId: "cafe-na",
        businessType: "CAFE",
        region: "NA",
        metrics: [sampleMetric({ yourValue: 32 })],
      }),
    ]);
    expect(stats["cafe-na"]!.metricAverages.food_cost_percent).toBe(31);
  });

  it("computes network status with seed + live contributors", () => {
    const pool = upsertContribution(
      emptyBenchmarkPool(),
      buildAnonymizedContribution({
        workspaceId: "ws-1",
        cohortId: "restaurant-na",
        businessType: "RESTAURANT",
        region: "NA",
        metrics: [sampleMetric()],
      }),
    );
    const status = computeNetworkStatus({
      seedCohorts: BENCHMARK_COHORTS,
      pool,
      workspaceContribution: { contributing: true, metricsShared: 1, anonId: "abc" },
    });
    expect(status.liveContributors).toBe(1);
    expect(status.totalRestaurants).toBeGreaterThan(BENCHMARK_COHORTS[0]!.sampleSize);
    expect(status.contributionImpact).toContain("live");
  });

  it("describes impact when no live contributors", () => {
    const { impact } = computeContributionImpact(0, 2750);
    expect(impact).toContain("first");
  });
});
