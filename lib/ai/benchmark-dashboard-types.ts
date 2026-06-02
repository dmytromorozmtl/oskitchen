import type { BenchmarkNetworkResult } from "@/lib/ai/benchmark-network-types";

export type BenchmarkOpportunity = {
  metricKey: string;
  label: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  percentileRank: number;
  estimatedImpactUsd: number;
  action: string;
};

export type BenchmarkRadarPoint = {
  metric: string;
  you: number;
  industry: number;
  topQuartile: number;
};

export type BenchmarkHistoryPoint = {
  date: string;
  averagePercentile: number;
  metricCount: number;
};

export type BenchmarkCohortOption = {
  id: string;
  label: string;
  sampleSize: number;
};

export type DataContributionInfo = {
  contributing: boolean;
  lastContributedAt: string | null;
  metricsShared: number;
  privacyNote: string;
  networkRestaurants: number;
  cohortsAvailable: number;
  liveContributors: number;
  contributionImpact: string;
  contributionImpactScore: number;
  anonId: string | null;
};

export type BenchmarkDashboardPayload = {
  data: BenchmarkNetworkResult;
  cohortOptions: BenchmarkCohortOption[];
  selectedCohortId: string;
  radarMetrics: BenchmarkRadarPoint[];
  opportunities: BenchmarkOpportunity[];
  history: BenchmarkHistoryPoint[];
  contribution: DataContributionInfo;
};
