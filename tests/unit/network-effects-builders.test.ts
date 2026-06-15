import { describe, expect, it } from "vitest";

import { emptyBenchmarkPool } from "@/lib/ai/benchmark-network-effects-builders";
import {
  buildNetworkEffectsDashboard,
  buildNetworkMilestones,
  computeIntelligenceIndex,
  computePrecisionBoostPercent,
} from "@/lib/ai/network-effects-builders";
import { BENCHMARK_COHORTS } from "@/lib/ai/benchmark-cohort-seeds";
import { computeNetworkStatus } from "@/lib/ai/benchmark-network-effects-builders";

describe("network-effects builders", () => {
  it("increases precision boost with live contributors", () => {
    expect(computePrecisionBoostPercent(0, 5000)).toBe(0);
    expect(computePrecisionBoostPercent(5, 5000)).toBeGreaterThan(0);
  });

  it("raises intelligence index when contributors grow", () => {
    const low = computeIntelligenceIndex({
      liveContributors: 0,
      totalRestaurants: 5000,
      contributionImpactScore: 0,
      metricsInPool: 0,
    });
    const high = computeIntelligenceIndex({
      liveContributors: 12,
      totalRestaurants: 5012,
      contributionImpactScore: 40,
      metricsInPool: 240,
    });
    expect(high.index).toBeGreaterThan(low.index);
    expect(high.modelsRefined).toBeGreaterThan(low.modelsRefined);
  });

  it("marks milestones complete at contributor thresholds", () => {
    const milestones = buildNetworkMilestones(10);
    const first = milestones.find((m) => m.targetContributors === 1);
    const tenth = milestones.find((m) => m.targetContributors === 10);
    const fiftieth = milestones.find((m) => m.targetContributors === 50);
    expect(first?.status).toBe("complete");
    expect(tenth?.status).toBe("complete");
    expect(fiftieth?.status).toBe("locked");
  });

  it("builds dashboard from pool and status", () => {
    const pool = emptyBenchmarkPool();
    const status = computeNetworkStatus({
      seedCohorts: BENCHMARK_COHORTS,
      pool,
      workspaceContribution: { contributing: false },
    });
    const dashboard = buildNetworkEffectsDashboard({
      workspaceId: "ws-1",
      status,
      seedCohorts: BENCHMARK_COHORTS,
      pool,
    });
    expect(dashboard.cohortInsights).toHaveLength(BENCHMARK_COHORTS.length);
    expect(dashboard.tagline).toContain("smarter");
  });
});
