import {
  ANALYTICS_SUITE_PATH,
  ANALYTICS_SUITE_POLICY_ID,
} from "@/lib/analytics/analytics-suite-policy";
import type {
  AnalyticsSuiteLane,
  AnalyticsSuiteMetric,
  AnalyticsSuiteSnapshot,
} from "@/lib/analytics/analytics-suite-types";
import { ratePercentLabel } from "@/lib/analytics/operational-metrics";
import { formatCurrency } from "@/lib/utils";

const LANE_LABELS: Record<AnalyticsSuiteLane["id"], string> = {
  revenue: "Revenue",
  orders: "Orders",
  customers: "Customers",
  operations: "Operations",
  catering: "Catering",
  meal_plans: "Meal Plans",
  inventory: "Inventory",
  forecast: "Forecast",
};

export function buildAnalyticsSuiteMetric(input: {
  id: string;
  label: string;
  value: string;
  hint?: string | null;
  href?: string | null;
}): AnalyticsSuiteMetric {
  return {
    id: input.id,
    label: input.label,
    value: input.value,
    hint: input.hint ?? null,
    href: input.href ?? null,
  };
}

export function buildAnalyticsSuiteLane(input: {
  id: AnalyticsSuiteLane["id"];
  metrics: AnalyticsSuiteMetric[];
}): AnalyticsSuiteLane {
  return {
    id: input.id,
    label: LANE_LABELS[input.id],
    metrics: input.metrics,
  };
}

export function buildAnalyticsSuiteSnapshot(input: {
  rangeLabel: string;
  lanes: AnalyticsSuiteLane[];
  warnings: string[];
  analyzedAt?: Date;
}): AnalyticsSuiteSnapshot {
  const metricCount = input.lanes.reduce((sum, lane) => sum + lane.metrics.length, 0);

  return {
    policyId: ANALYTICS_SUITE_POLICY_ID,
    generatedAtIso: (input.analyzedAt ?? new Date()).toISOString(),
    rangeLabel: input.rangeLabel,
    lanes: input.lanes,
    warnings: input.warnings,
    summary: {
      metricCount,
      laneCount: input.lanes.length,
      warningCount: input.warnings.length,
    },
    basePath: ANALYTICS_SUITE_PATH,
  };
}

export function formatRate(value: number | null): string {
  return ratePercentLabel(value);
}

export function formatMoney(value: number | null | undefined): string {
  if (value == null) return "—";
  return formatCurrency(value);
}
