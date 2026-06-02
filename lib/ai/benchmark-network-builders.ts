import type {
  BenchmarkMetric,
  BenchmarkNetworkResult,
  BenchmarkTrend,
  CohortMetricBenchmark,
  CohortSeed,
  WorkspaceMetricSnapshot,
} from "@/lib/ai/benchmark-network-types";

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export type MetricSpec = {
  key: string;
  label: string;
  category: BenchmarkMetric["category"];
  unit: BenchmarkMetric["unit"];
  higherIsBetter: boolean;
  extract: (snap: WorkspaceMetricSnapshot) => number | null;
  trendFrom?: (snap: WorkspaceMetricSnapshot) => number | null;
};

export const BENCHMARK_METRIC_SPECS: MetricSpec[] = [
  { key: "food_cost_percent", label: "Food cost %", category: "cost", unit: "percent", higherIsBetter: false, extract: (s) => s.foodCostPercent },
  { key: "gross_margin_percent", label: "Gross margin %", category: "cost", unit: "percent", higherIsBetter: true, extract: (s) => s.grossMarginPercent },
  { key: "labor_cost_percent", label: "Labor cost %", category: "labor", unit: "percent", higherIsBetter: false, extract: (s) => s.laborCostPercent },
  { key: "avg_ticket", label: "Average ticket", category: "revenue", unit: "currency", higherIsBetter: true, extract: (s) => s.avgTicket },
  { key: "orders_per_day", label: "Orders per day", category: "revenue", unit: "count", higherIsBetter: true, extract: (s) => s.ordersPerDay, trendFrom: (s) => s.orderTrend },
  { key: "revenue_per_day", label: "Revenue per day", category: "revenue", unit: "currency", higherIsBetter: true, extract: (s) => s.revenuePerDay, trendFrom: (s) => s.revenueTrend },
  { key: "repeat_customer_rate", label: "Repeat customer rate", category: "customers", unit: "percent", higherIsBetter: true, extract: (s) => s.repeatCustomerRate },
  { key: "production_completion", label: "Production completion", category: "operations", unit: "percent", higherIsBetter: true, extract: (s) => s.productionCompletion },
  { key: "packing_accuracy", label: "Packing accuracy", category: "operations", unit: "percent", higherIsBetter: true, extract: (s) => s.packingAccuracy },
  { key: "delivery_completion", label: "Delivery completion", category: "operations", unit: "percent", higherIsBetter: true, extract: (s) => s.deliveryCompletion },
  { key: "inventory_shortage_rate", label: "Inventory shortage rate", category: "inventory", unit: "percent", higherIsBetter: false, extract: (s) => s.inventoryShortageRate },
  { key: "po_overdue_rate", label: "PO overdue rate", category: "inventory", unit: "percent", higherIsBetter: false, extract: (s) => s.poOverdueRate },
  { key: "health_score", label: "Operational health score", category: "operations", unit: "score", higherIsBetter: true, extract: (s) => s.healthScore },
  { key: "open_task_rate", label: "Open task rate", category: "operations", unit: "percent", higherIsBetter: false, extract: (s) => s.openTaskRate },
  { key: "kds_wait_minutes", label: "KDS avg wait", category: "operations", unit: "minutes", higherIsBetter: false, extract: (s) => s.kdsWaitMinutes },
  { key: "channel_diversity", label: "Active channels", category: "revenue", unit: "count", higherIsBetter: true, extract: (s) => s.channelCount },
  { key: "waste_percent", label: "Waste % of COGS", category: "cost", unit: "percent", higherIsBetter: false, extract: (s) => s.wastePercent },
  { key: "cost_variance_alerts", label: "Cost variance alerts", category: "cost", unit: "count", higherIsBetter: false, extract: (s) => s.costVarianceAlerts },
  { key: "demand_shortage_lines", label: "Demand shortage lines", category: "inventory", unit: "count", higherIsBetter: false, extract: (s) => s.demandShortageLines },
  { key: "integration_failure_rate", label: "Integration failures", category: "operations", unit: "count", higherIsBetter: false, extract: (s) => s.integrationFailureRate },
  { key: "menu_velocity", label: "Top product velocity", category: "revenue", unit: "count", higherIsBetter: true, extract: (s) => s.menuVelocity },
  { key: "catering_pipeline", label: "Catering pipeline", category: "revenue", unit: "count", higherIsBetter: true, extract: (s) => s.cateringPipeline },
  { key: "meal_plan_subscribers", label: "Active meal plans", category: "customers", unit: "count", higherIsBetter: true, extract: (s) => s.mealPlanActive },
];

export function percentileRank(
  value: number,
  benchmark: Pick<CohortMetricBenchmark, "bottomQuartile" | "industryAverage" | "topQuartile">,
  higherIsBetter: boolean,
): number {
  const { bottomQuartile: p25, industryAverage: avg, topQuartile: p75 } = benchmark;
  const spreadLow = Math.abs(avg - p25) || 1;
  const spreadHigh = Math.abs(p75 - avg) || 1;

  let rank: number;
  if (value <= p25) {
    if (p25 === 0 && value === 0) {
      rank = 50;
    } else if (p25 === 0) {
      rank = higherIsBetter ? 75 : 25;
    } else {
      rank = 25 * (higherIsBetter ? value / p25 : 1 - value / p25);
    }
  } else if (value <= avg) {
    const t = (value - p25) / spreadLow;
    rank = 25 + t * 25;
  } else if (value <= p75) {
    const t = (value - avg) / spreadHigh;
    rank = 50 + t * 25;
  } else {
    const excess = (value - p75) / spreadHigh;
    rank = 75 + Math.min(24, excess * 25);
  }

  if (!higherIsBetter) {
    rank = 100 - rank;
  }

  return round1(Math.max(1, Math.min(99, rank)));
}

export function trendFromDelta(delta: number | null | undefined): BenchmarkTrend {
  if (delta == null || Math.abs(delta) < 0.02) return "stable";
  return delta > 0 ? "up" : "down";
}

export function buildBenchmarkMetric(
  spec: MetricSpec,
  yourValue: number,
  benchmark: CohortMetricBenchmark,
  cohortSampleSize: number,
  trendDelta: number | null,
): BenchmarkMetric {
  return {
    key: spec.key,
    label: spec.label,
    category: spec.category,
    unit: spec.unit,
    yourValue: round2(yourValue),
    industryAverage: benchmark.industryAverage,
    topQuartile: benchmark.topQuartile,
    bottomQuartile: benchmark.bottomQuartile,
    percentileRank: percentileRank(yourValue, benchmark, spec.higherIsBetter),
    sampleSize: benchmark.sampleSize ?? cohortSampleSize,
    trend: trendFromDelta(trendDelta),
    higherIsBetter: spec.higherIsBetter,
  };
}

export function assembleBenchmarkNetworkResult(input: {
  workspaceId: string;
  cohort: CohortSeed;
  snapshot: WorkspaceMetricSnapshot;
  analyzedAt?: Date;
}): BenchmarkNetworkResult {
  const benchmarkByKey = new Map(input.cohort.metrics.map((m) => [m.key, m]));
  const metrics: BenchmarkMetric[] = [];

  for (const spec of BENCHMARK_METRIC_SPECS) {
    const yourValue = spec.extract(input.snapshot);
    const bench = benchmarkByKey.get(spec.key);
    if (yourValue == null || !bench) continue;

    metrics.push(
      buildBenchmarkMetric(
        spec,
        yourValue,
        bench,
        input.cohort.sampleSize,
        spec.trendFrom?.(input.snapshot) ?? null,
      ),
    );
  }

  metrics.sort((a, b) => b.percentileRank - a.percentileRank);

  const aboveTop = metrics.filter((m) =>
    m.higherIsBetter ? m.yourValue >= m.topQuartile : m.yourValue <= m.topQuartile,
  ).length;
  const belowBottom = metrics.filter((m) =>
    m.higherIsBetter ? m.yourValue <= m.bottomQuartile : m.yourValue >= m.bottomQuartile,
  ).length;
  const averagePercentile =
    metrics.length > 0
      ? round1(metrics.reduce((s, m) => s + m.percentileRank, 0) / metrics.length)
      : 50;

  const strongMetrics = metrics.filter((m) => m.percentileRank >= 75).slice(0, 5).map((m) => m.key);
  const weakMetrics = metrics.filter((m) => m.percentileRank <= 25).slice(-5).map((m) => m.key);

  const filledRatio = metrics.length / BENCHMARK_METRIC_SPECS.length;

  return {
    workspaceId: input.workspaceId,
    analyzedAt: (input.analyzedAt ?? new Date()).toISOString(),
    cohort: {
      id: input.cohort.id,
      label: input.cohort.label,
      businessType: input.cohort.businessType,
      region: input.cohort.region,
      sampleSize: input.cohort.sampleSize,
      anonymized: true,
    },
    metrics,
    summary: {
      metricCount: metrics.length,
      aboveTopQuartile: aboveTop,
      belowBottomQuartile: belowBottom,
      averagePercentile,
      strongMetrics,
      weakMetrics,
    },
    aiAssisted: true,
    confidence: round2(Math.min(0.92, 0.5 + filledRatio * 0.4)),
  };
}

export function gaugeToneForPercentile(rank: number): "green" | "yellow" | "red" {
  if (rank >= 65) return "green";
  if (rank >= 40) return "yellow";
  return "red";
}
