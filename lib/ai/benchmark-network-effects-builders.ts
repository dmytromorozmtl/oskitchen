import { createHash } from "node:crypto";

import type { BenchmarkMetric } from "@/lib/ai/benchmark-network-types";
import type {
  AnonymizedContribution,
  AnonymizedMetricValue,
  BenchmarkCohortPool,
  BenchmarkNetworkStatus,
  CohortPoolStats,
} from "@/lib/ai/benchmark-network-effects-types";
import type { CohortSeed } from "@/lib/ai/benchmark-network-types";

export function hashWorkspaceId(workspaceId: string): string {
  return createHash("sha256").update(workspaceId).digest("hex").slice(0, 12);
}

export function bucketMetricValue(metric: Pick<BenchmarkMetric, "key" | "yourValue" | "unit">): number {
  const v = metric.yourValue;
  switch (metric.unit) {
    case "percent":
    case "score":
      return Math.round(v * 10) / 10;
    case "currency":
      return Math.round(v / 50) * 50;
    case "minutes":
      return Math.round(v);
    case "count":
      return Math.round(v / 5) * 5;
    default:
      return Math.round(v * 100) / 100;
  }
}

export function anonymizeMetrics(metrics: BenchmarkMetric[]): AnonymizedMetricValue[] {
  return metrics.map((m) => ({
    key: m.key,
    value: bucketMetricValue(m),
  }));
}

export function buildAnonymizedContribution(input: {
  workspaceId: string;
  cohortId: string;
  businessType: string;
  region: string;
  metrics: BenchmarkMetric[];
  contributedAt?: Date;
}): AnonymizedContribution {
  return {
    anonId: hashWorkspaceId(input.workspaceId),
    cohortId: input.cohortId,
    businessType: input.businessType,
    region: input.region,
    contributedAt: (input.contributedAt ?? new Date()).toISOString(),
    metrics: anonymizeMetrics(input.metrics),
  };
}

export function aggregateCohortStats(contributions: AnonymizedContribution[]): Record<string, CohortPoolStats> {
  const byCohort = new Map<string, AnonymizedContribution[]>();
  for (const c of contributions) {
    const list = byCohort.get(c.cohortId) ?? [];
    list.push(c);
    byCohort.set(c.cohortId, list);
  }

  const stats: Record<string, CohortPoolStats> = {};
  for (const [cohortId, list] of byCohort) {
    const sums = new Map<string, number>();
    for (const entry of list) {
      for (const m of entry.metrics) {
        sums.set(m.key, (sums.get(m.key) ?? 0) + m.value);
      }
    }
    const metricAverages: Record<string, number> = {};
    for (const [key, total] of sums) {
      metricAverages[key] = Math.round((total / list.length) * 100) / 100;
    }
    stats[cohortId] = {
      restaurantCount: list.length,
      metricAverages,
    };
  }
  return stats;
}

export function upsertContribution(
  pool: BenchmarkCohortPool,
  contribution: AnonymizedContribution,
): BenchmarkCohortPool {
  const without = pool.contributions.filter((c) => c.anonId !== contribution.anonId);
  const contributions = [...without, contribution];
  return {
    updatedAt: new Date().toISOString(),
    contributions,
    cohortStats: aggregateCohortStats(contributions),
  };
}

export function computeContributionImpact(liveContributors: number, seedTotal: number): {
  impact: string;
  score: number;
} {
  if (liveContributors === 0) {
    return { impact: "Be the first live contributor — improves cohort accuracy for all peers.", score: 0 };
  }
  const ratio = liveContributors / Math.max(seedTotal, 1);
  const score = Math.min(100, Math.round(ratio * 10000) / 100 + liveContributors * 0.5);
  const pct = Math.min(15, Math.round(ratio * 1000) / 10 + liveContributors * 0.1);
  return {
    impact: `+${pct.toFixed(1)}% cohort precision from ${liveContributors} live anonymized contributor${liveContributors === 1 ? "" : "s"}.`,
    score,
  };
}

export function computeNetworkStatus(input: {
  seedCohorts: CohortSeed[];
  pool: BenchmarkCohortPool;
  workspaceContribution?: {
    contributing?: boolean;
    lastContributedAt?: string;
    metricsShared?: number;
    anonId?: string;
  } | null;
}): BenchmarkNetworkStatus {
  const seedTotal = input.seedCohorts.reduce((s, c) => s + c.sampleSize, 0);
  const liveContributors = input.pool.contributions.length;
  const { impact, score } = computeContributionImpact(liveContributors, seedTotal);

  return {
    totalRestaurants: seedTotal + liveContributors,
    cohortsAvailable: input.seedCohorts.length,
    liveContributors,
    contributionImpact: impact,
    contributionImpactScore: score,
    lastPoolUpdate: input.pool.updatedAt || null,
    yourContribution: input.workspaceContribution
      ? {
          active: input.workspaceContribution.contributing ?? false,
          lastContributedAt: input.workspaceContribution.lastContributedAt ?? null,
          metricsShared: input.workspaceContribution.metricsShared ?? 0,
          anonId: input.workspaceContribution.anonId ?? null,
        }
      : null,
  };
}

export function emptyBenchmarkPool(): BenchmarkCohortPool {
  return {
    updatedAt: new Date(0).toISOString(),
    contributions: [],
    cohortStats: {},
  };
}
