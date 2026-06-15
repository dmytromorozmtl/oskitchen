import type { ANALYTICS_SUITE_POLICY_ID } from "@/lib/analytics/analytics-suite-policy";

export type AnalyticsSuiteLaneId =
  | "revenue"
  | "orders"
  | "customers"
  | "operations"
  | "catering"
  | "meal_plans"
  | "inventory"
  | "forecast";

export type AnalyticsSuiteMetric = {
  id: string;
  label: string;
  value: string;
  hint: string | null;
  href: string | null;
};

export type AnalyticsSuiteLane = {
  id: AnalyticsSuiteLaneId;
  label: string;
  metrics: AnalyticsSuiteMetric[];
};

export type AnalyticsSuiteSnapshot = {
  policyId: typeof ANALYTICS_SUITE_POLICY_ID;
  generatedAtIso: string;
  rangeLabel: string;
  lanes: AnalyticsSuiteLane[];
  summary: {
    metricCount: number;
    laneCount: number;
    warningCount: number;
  };
  warnings: string[];
  basePath: string;
};
