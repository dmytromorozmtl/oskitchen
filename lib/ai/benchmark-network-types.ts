/** Benchmark Network — types for anonymized industry comparison. */

export type BenchmarkTrend = "up" | "down" | "stable";

export type BenchmarkMetricUnit = "percent" | "currency" | "minutes" | "count" | "ratio" | "score";

export type BenchmarkMetric = {
  key: string;
  label: string;
  category: "revenue" | "cost" | "operations" | "customers" | "inventory" | "labor";
  unit: BenchmarkMetricUnit;
  yourValue: number;
  industryAverage: number;
  topQuartile: number;
  bottomQuartile: number;
  percentileRank: number;
  sampleSize: number;
  trend: BenchmarkTrend;
  higherIsBetter: boolean;
};

export type BenchmarkCohort = {
  id: string;
  label: string;
  businessType: string;
  region: string;
  sampleSize: number;
  anonymized: true;
};

export type BenchmarkNetworkResult = {
  workspaceId: string;
  analyzedAt: string;
  cohort: BenchmarkCohort;
  metrics: BenchmarkMetric[];
  summary: {
    metricCount: number;
    aboveTopQuartile: number;
    belowBottomQuartile: number;
    averagePercentile: number;
    strongMetrics: string[];
    weakMetrics: string[];
  };
  aiAssisted: true;
  confidence: number;
};

export type CohortMetricBenchmark = {
  key: string;
  industryAverage: number;
  bottomQuartile: number;
  topQuartile: number;
  sampleSize?: number;
};

export type CohortSeed = BenchmarkCohort & {
  metrics: CohortMetricBenchmark[];
};

export type WorkspaceMetricSnapshot = {
  windowDays: number;
  foodCostPercent: number | null;
  grossMarginPercent: number | null;
  laborCostPercent: number | null;
  avgTicket: number | null;
  ordersPerDay: number | null;
  revenuePerDay: number | null;
  wastePercent: number | null;
  repeatCustomerRate: number | null;
  productionCompletion: number | null;
  packingAccuracy: number | null;
  deliveryCompletion: number | null;
  inventoryShortageRate: number | null;
  poOverdueRate: number | null;
  marginMedian: number | null;
  healthScore: number | null;
  openTaskRate: number | null;
  cateringPipeline: number | null;
  mealPlanActive: number | null;
  integrationFailureRate: number | null;
  revenueTrend: number | null;
  orderTrend: number | null;
  kdsWaitMinutes: number | null;
  channelCount: number | null;
  menuVelocity: number | null;
  costVarianceAlerts: number | null;
  demandShortageLines: number | null;
};
