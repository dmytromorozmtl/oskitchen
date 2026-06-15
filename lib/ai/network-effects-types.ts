import type { BenchmarkNetworkStatus } from "@/lib/ai/benchmark-network-effects-types";

export type NetworkMilestoneStatus = "locked" | "active" | "complete";

export type NetworkMilestone = {
  id: string;
  title: string;
  description: string;
  targetContributors: number;
  status: NetworkMilestoneStatus;
};

export type CohortNetworkInsight = {
  cohortId: string;
  label: string;
  seedSampleSize: number;
  liveContributors: number;
  metricsRefined: number;
  precisionBoostPercent: number;
};

export type NetworkIntelligenceSnapshot = {
  index: number;
  label: string;
  summary: string;
  modelsRefined: number;
  precisionBoostPercent: number;
};

export type NetworkContributionCard = {
  contributing: boolean;
  lastContributedAt: string | null;
  metricsShared: number;
  anonId: string | null;
  impactMessage: string;
  impactScore: number;
};

export type NetworkEffectsDashboard = {
  workspaceId: string;
  analyzedAt: string;
  tagline: string;
  status: BenchmarkNetworkStatus;
  intelligence: NetworkIntelligenceSnapshot;
  milestones: NetworkMilestone[];
  cohortInsights: CohortNetworkInsight[];
  contribution: NetworkContributionCard;
};
