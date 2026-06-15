import type { BenchmarkMetric } from "@/lib/ai/benchmark-network-types";
import type {
  BenchmarkHistoryPoint,
  BenchmarkOpportunity,
  BenchmarkRadarPoint,
  DataContributionInfo,
} from "@/lib/ai/benchmark-dashboard-types";

/** Top 8 metrics for radar chart — balanced across categories. */
export const RADAR_METRIC_KEYS = [
  "food_cost_percent",
  "gross_margin_percent",
  "labor_cost_percent",
  "avg_ticket",
  "repeat_customer_rate",
  "production_completion",
  "health_score",
  "kds_wait_minutes",
] as const;

const OPPORTUNITY_ACTIONS: Record<string, string> = {
  food_cost_percent: "Audit recipe yields and renegotiate top ingredient suppliers.",
  gross_margin_percent: "Reprice low-margin items and reduce portion variance.",
  labor_cost_percent: "Align schedules to demand peaks and reduce overtime.",
  avg_ticket: "Train upselling and bundle high-margin add-ons.",
  orders_per_day: "Launch targeted promos on slow dayparts.",
  revenue_per_day: "Expand top channels and reduce order friction.",
  repeat_customer_rate: "Launch loyalty offers for 2nd-visit customers.",
  production_completion: "Clear overdue production batches before service.",
  packing_accuracy: "Add QC checkpoint on high-error SKUs.",
  delivery_completion: "Review failed routes and driver handoff timing.",
  inventory_shortage_rate: "Enable AI purchasing auto-reorder for top SKUs.",
  po_overdue_rate: "Approve or cancel stale POs blocking receiving.",
  health_score: "Resolve top health-score deductions from executive overview.",
  open_task_rate: "Close or delegate overdue kitchen tasks.",
  kds_wait_minutes: "Rebalance station load or add prep capacity at bottleneck.",
  channel_diversity: "Activate underused sales channels from channel registry.",
  waste_percent: "Tighten prep pars and track waste by station.",
  cost_variance_alerts: "Investigate costing runs with largest variance.",
  demand_shortage_lines: "Replenish demand-planning gaps before next service.",
  integration_failure_rate: "Reconnect failed integrations from settings.",
  menu_velocity: "Feature top seller in promos and cross-sell pairings.",
  catering_pipeline: "Follow up on open catering quotes.",
  meal_plan_subscribers: "Promote meal plans to repeat delivery customers.",
};

function round0(n: number): number {
  return Math.round(n);
}

function unitLabel(unit: BenchmarkMetric["unit"]): string {
  switch (unit) {
    case "percent":
      return "%";
    case "currency":
      return "$";
    case "minutes":
      return "min";
    case "score":
      return "pts";
    default:
      return "";
  }
}

export function formatBenchmarkValue(metric: BenchmarkMetric): string {
  switch (metric.unit) {
    case "percent":
      return `${metric.yourValue.toFixed(1)}%`;
    case "currency":
      return `$${metric.yourValue.toFixed(0)}`;
    case "minutes":
      return `${metric.yourValue.toFixed(0)} min`;
    case "score":
      return `${metric.yourValue.toFixed(0)}`;
    default:
      return metric.yourValue.toFixed(0);
  }
}

export function buildRadarMetrics(metrics: BenchmarkMetric[]): BenchmarkRadarPoint[] {
  const byKey = new Map(metrics.map((m) => [m.key, m]));

  return RADAR_METRIC_KEYS.flatMap((key) => {
    const m = byKey.get(key);
    if (!m) return [];
    return [
      {
        metric: m.label,
        you: m.percentileRank,
        industry: 50,
        topQuartile: 75,
      },
    ];
  });
}

export function estimateOpportunityImpact(
  metric: BenchmarkMetric,
  context: { revenuePerDay: number; ordersPerDay: number },
): number {
  const gap = metric.higherIsBetter
    ? metric.topQuartile - metric.yourValue
    : metric.yourValue - metric.topQuartile;
  if (gap <= 0) return 0;

  const monthlyRevenue = context.revenuePerDay * 30;
  const monthlyOrders = context.ordersPerDay * 30;

  switch (metric.key) {
    case "food_cost_percent":
      return round0(monthlyRevenue * (gap / 100) * 0.85);
    case "labor_cost_percent":
      return round0(monthlyRevenue * (gap / 100) * 0.75);
    case "gross_margin_percent":
      return round0(monthlyRevenue * (gap / 100) * 0.6);
    case "avg_ticket":
      return round0(gap * monthlyOrders * 0.5);
    case "orders_per_day":
      return round0(gap * (metric.yourValue || context.ordersPerDay || 20) * 30 * 0.4);
    case "waste_percent":
      return round0(monthlyRevenue * 0.32 * (gap / 100));
    case "inventory_shortage_rate":
    case "po_overdue_rate":
      return round0(monthlyRevenue * 0.02 * (gap / 10));
    default:
      return round0(monthlyRevenue * 0.015 * ((100 - metric.percentileRank) / 25));
  }
}

export function buildOpportunities(
  metrics: BenchmarkMetric[],
  context: { revenuePerDay: number; ordersPerDay: number },
): BenchmarkOpportunity[] {
  const weak = metrics
    .filter((m) => m.percentileRank < 50)
    .sort((a, b) => a.percentileRank - b.percentileRank);

  return weak.slice(0, 6).map((m) => {
    const target = m.higherIsBetter ? m.topQuartile : m.topQuartile;
    return {
      metricKey: m.key,
      label: m.label,
      currentValue: m.yourValue,
      targetValue: target,
      unit: unitLabel(m.unit),
      percentileRank: m.percentileRank,
      estimatedImpactUsd: estimateOpportunityImpact(m, context),
      action: OPPORTUNITY_ACTIONS[m.key] ?? `Improve ${m.label} toward top-quartile peers.`,
    };
  });
}

export function appendHistoryPoint(
  history: BenchmarkHistoryPoint[],
  point: BenchmarkHistoryPoint,
  maxDays = 30,
): BenchmarkHistoryPoint[] {
  const withoutToday = history.filter((h) => h.date !== point.date);
  return [...withoutToday, point]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-maxDays);
}

export function buildContributionInfo(input: {
  networkStatus: {
    totalRestaurants: number;
    cohortsAvailable: number;
    liveContributors: number;
    contributionImpact: string;
    contributionImpactScore: number;
    yourContribution?: {
      active: boolean;
      lastContributedAt: string | null;
      metricsShared: number;
      anonId: string | null;
    } | null;
  };
}): DataContributionInfo {
  const yours = input.networkStatus.yourContribution;
  const contributing = yours?.active ?? false;
  return {
    contributing,
    lastContributedAt: yours?.lastContributedAt ?? null,
    metricsShared: yours?.metricsShared ?? 0,
    networkRestaurants: input.networkStatus.totalRestaurants,
    cohortsAvailable: input.networkStatus.cohortsAvailable,
    liveContributors: input.networkStatus.liveContributors,
    contributionImpact: input.networkStatus.contributionImpact,
    contributionImpactScore: input.networkStatus.contributionImpactScore,
    anonId: yours?.anonId ?? null,
    privacyNote:
      "Benchmark comparisons use anonymized aggregates only. No customer PII, menu prices, or staff names leave your workspace. Opt-in contribution shares bucketed KPIs under a one-way hash ID.",
  };
}

export const GAUGE_TONE_CLASS = {
  green: "text-emerald-600 dark:text-emerald-400",
  yellow: "text-amber-600 dark:text-amber-400",
  red: "text-red-600 dark:text-red-400",
} as const;

export const GAUGE_TONE_BG = {
  green: "stroke-emerald-500",
  yellow: "stroke-amber-500",
  red: "stroke-red-500",
} as const;

export const GAUGE_TONE_BADGE = {
  green: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  yellow: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  red: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
} as const;
