import type { PlanKey } from "@/lib/billing/plan-registry";
import { planLimits } from "@/lib/billing/plan-registry";

export const USAGE_METRICS = [
  "orders_per_month",
  "active_menus",
  "integrations",
  "staff",
  "brands",
  "locations",
  "storefronts",
] as const;
export type UsageMetric = (typeof USAGE_METRICS)[number];

export const USAGE_METRIC_LABEL: Record<UsageMetric, string> = {
  orders_per_month: "Orders this month",
  active_menus: "Active menus",
  integrations: "Active integrations",
  staff: "Active staff",
  brands: "Brands",
  locations: "Locations",
  storefronts: "Storefronts",
};

/** Resolve the static plan limit for a metric. null = unlimited. */
export function limitForMetric(plan: PlanKey, metric: UsageMetric): number | null {
  const l = planLimits(plan);
  switch (metric) {
    case "orders_per_month":
      return l.maxOrdersPerMonth;
    case "active_menus":
      return l.maxMenus;
    case "integrations":
      return l.maxIntegrations;
    case "staff":
      return l.maxStaff;
    case "brands":
      return l.maxBrands;
    case "locations":
      return l.maxLocations;
    case "storefronts":
      return l.maxStorefronts;
  }
}

export type UsageBar = {
  metric: UsageMetric;
  label: string;
  used: number;
  limit: number | null;
  percent: number;
  tone: "ok" | "warning" | "danger";
  reached: boolean;
};

export function buildUsageBar(plan: PlanKey, metric: UsageMetric, used: number): UsageBar {
  const limit = limitForMetric(plan, metric);
  if (limit === null) {
    return {
      metric,
      label: USAGE_METRIC_LABEL[metric],
      used,
      limit: null,
      percent: 0,
      tone: "ok",
      reached: false,
    };
  }
  const safe = Math.max(0, limit);
  const percent = safe === 0 ? 100 : Math.min(100, Math.round((used / safe) * 100));
  const tone: UsageBar["tone"] = percent >= 100 ? "danger" : percent >= 80 ? "warning" : "ok";
  return {
    metric,
    label: USAGE_METRIC_LABEL[metric],
    used,
    limit,
    percent,
    tone,
    reached: used >= safe,
  };
}

export function isOverLimit(plan: PlanKey, metric: UsageMetric, used: number): boolean {
  const limit = limitForMetric(plan, metric);
  if (limit === null) return false;
  return used > limit;
}
