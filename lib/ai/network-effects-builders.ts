import type { BenchmarkCohortPool } from "@/lib/ai/benchmark-network-effects-types";
import type { CohortSeed } from "@/lib/ai/benchmark-network-types";
import type {
  CohortNetworkInsight,
  NetworkContributionCard,
  NetworkEffectsDashboard,
  NetworkIntelligenceSnapshot,
  NetworkMilestone,
  NetworkMilestoneStatus,
} from "@/lib/ai/network-effects-types";
import type { BenchmarkNetworkStatus } from "@/lib/ai/benchmark-network-effects-types";

const MILESTONE_TARGETS = [1, 5, 10, 25, 50] as const;

export function computePrecisionBoostPercent(liveContributors: number, seedTotal: number): number {
  if (liveContributors === 0) return 0;
  const ratio = liveContributors / Math.max(seedTotal, 1);
  return Math.min(15, Math.round((ratio * 1000 + liveContributors * 2) * 10) / 10);
}

export function computeIntelligenceIndex(input: {
  liveContributors: number;
  totalRestaurants: number;
  contributionImpactScore: number;
  metricsInPool: number;
}): NetworkIntelligenceSnapshot {
  const base = 68;
  const contributorBoost = Math.min(22, input.liveContributors * 2.2);
  const impactBoost = Math.min(8, input.contributionImpactScore * 0.08);
  const metricBoost = Math.min(2, input.metricsInPool / 50);
  const index = Math.min(100, Math.round((base + contributorBoost + impactBoost + metricBoost) * 10) / 10);

  const precisionBoostPercent = computePrecisionBoostPercent(
    input.liveContributors,
    input.totalRestaurants - input.liveContributors,
  );

  const modelsRefined = Math.max(3, Math.min(23, 8 + input.liveContributors * 2));

  let label = "Learning";
  if (index >= 92) label = "Network-native";
  else if (index >= 84) label = "Highly adaptive";
  else if (index >= 76) label = "Peer-calibrated";

  const summary =
    input.liveContributors === 0
      ? "Seed cohorts power benchmarks today. Each anonymized restaurant sharpens forecasts for everyone."
      : `${input.liveContributors} live contributor${input.liveContributors === 1 ? "" : "s"} refined ${modelsRefined} benchmark models (+${precisionBoostPercent.toFixed(1)}% cohort precision).`;

  return {
    index,
    label,
    summary,
    modelsRefined,
    precisionBoostPercent,
  };
}

function milestoneStatus(liveContributors: number, target: number): NetworkMilestoneStatus {
  if (liveContributors >= target) return "complete";
  if (liveContributors >= target - 1 || (target === 1 && liveContributors === 0)) return "active";
  return "locked";
}

export function buildNetworkMilestones(liveContributors: number): NetworkMilestone[] {
  const defs: { target: number; title: string; description: string }[] = [
    {
      target: 1,
      title: "First signal",
      description: "First live anonymized KPI bundle enters the shared pool.",
    },
    {
      target: 5,
      title: "Cohort calibration",
      description: "Peer percentiles begin shifting from seed-only baselines.",
    },
    {
      target: 10,
      title: "Forecast mesh",
      description: "Purchasing and labor models weight live peer deltas.",
    },
    {
      target: 25,
      title: "Regional mesh",
      description: "Cross-location anomaly detection activates for your cohort.",
    },
    {
      target: 50,
      title: "Network-native AI",
      description: "Benchmark, Co-Pilot, and camera insights use live peer priors by default.",
    },
  ];

  return defs.map((d, i) => ({
    id: `milestone-${MILESTONE_TARGETS[i]}`,
    title: d.title,
    description: d.description,
    targetContributors: d.target,
    status: milestoneStatus(liveContributors, d.target),
  }));
}

export function buildCohortNetworkInsights(
  seedCohorts: CohortSeed[],
  pool: BenchmarkCohortPool,
): CohortNetworkInsight[] {
  return seedCohorts.map((cohort) => {
    const stats = pool.cohortStats[cohort.id];
    const liveContributors = stats?.restaurantCount ?? 0;
    const metricsRefined = Object.keys(stats?.metricAverages ?? {}).length;
    const precisionBoostPercent = computePrecisionBoostPercent(liveContributors, cohort.sampleSize);

    return {
      cohortId: cohort.id,
      label: cohort.label,
      seedSampleSize: cohort.sampleSize,
      liveContributors,
      metricsRefined,
      precisionBoostPercent,
    };
  });
}

export function buildContributionCard(status: BenchmarkNetworkStatus): NetworkContributionCard {
  const yours = status.yourContribution;
  return {
    contributing: yours?.active ?? false,
    lastContributedAt: yours?.lastContributedAt ?? null,
    metricsShared: yours?.metricsShared ?? 0,
    anonId: yours?.anonId ?? null,
    impactMessage: status.contributionImpact,
    impactScore: status.contributionImpactScore,
  };
}

export function buildNetworkEffectsDashboard(input: {
  workspaceId: string;
  status: BenchmarkNetworkStatus;
  seedCohorts: CohortSeed[];
  pool: BenchmarkCohortPool;
  analyzedAt?: string;
}): NetworkEffectsDashboard {
  const metricsInPool = input.pool.contributions.reduce((n, c) => n + c.metrics.length, 0);
  const intelligence = computeIntelligenceIndex({
    liveContributors: input.status.liveContributors,
    totalRestaurants: input.status.totalRestaurants,
    contributionImpactScore: input.status.contributionImpactScore,
    metricsInPool,
  });

  return {
    workspaceId: input.workspaceId,
    analyzedAt: input.analyzedAt ?? new Date().toISOString(),
    tagline: "The system gets smarter with every restaurant that contributes.",
    status: input.status,
    intelligence,
    milestones: buildNetworkMilestones(input.status.liveContributors),
    cohortInsights: buildCohortNetworkInsights(input.seedCohorts, input.pool),
    contribution: buildContributionCard(input.status),
  };
}
