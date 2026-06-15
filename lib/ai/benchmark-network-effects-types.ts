/** Benchmark Network effects — anonymized contribution & pool types. */

export type AnonymizedMetricValue = {
  key: string;
  value: number;
};

export type AnonymizedContribution = {
  anonId: string;
  cohortId: string;
  businessType: string;
  region: string;
  contributedAt: string;
  metrics: AnonymizedMetricValue[];
};

export type CohortPoolStats = {
  restaurantCount: number;
  metricAverages: Record<string, number>;
};

export type BenchmarkCohortPool = {
  updatedAt: string;
  contributions: AnonymizedContribution[];
  cohortStats: Record<string, CohortPoolStats>;
};

export type BenchmarkNetworkStatus = {
  totalRestaurants: number;
  cohortsAvailable: number;
  liveContributors: number;
  contributionImpact: string;
  contributionImpactScore: number;
  lastPoolUpdate: string | null;
  yourContribution: {
    active: boolean;
    lastContributedAt: string | null;
    metricsShared: number;
    anonId: string | null;
  } | null;
};

export type ContributionResult = {
  success: true;
  anonId: string;
  metricsShared: number;
  cohortId: string;
  contributedAt: string;
  networkStatus: BenchmarkNetworkStatus;
};
