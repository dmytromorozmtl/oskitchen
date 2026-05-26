import { KPI_DEFINITIONS, type KpiDefinition, type KpiId } from "@/lib/analytics/kpi-definitions";

import type { ExecutiveOverview } from "@/services/analytics/analytics-service";

export type KpiValue = {
  definition: KpiDefinition;
  value: number | string | null;
  /** Optional change vs previous-period value, expressed as a percent (-100 → +Infinity). */
  changePct?: number | null;
};

function pct(current: number | null | undefined, previous: number | null | undefined): number | null {
  if (current == null || previous == null) return null;
  if (previous === 0) return current === 0 ? 0 : null;
  return Math.round(((current - previous) / Math.abs(previous)) * 1000) / 10;
}

export function buildKpiValues(current: ExecutiveOverview, previous?: ExecutiveOverview | null): Record<KpiId, KpiValue> {
  const result: Record<string, KpiValue> = {};
  const set = (id: KpiId, value: KpiValue["value"], cur?: number | null, prev?: number | null) => {
    const change = cur != null || prev != null ? pct(cur ?? null, prev ?? null) : null;
    result[id] = { definition: KPI_DEFINITIONS[id], value, changePct: change };
  };
  set("gross_revenue", current.grossRevenue, current.grossRevenue, previous?.grossRevenue);
  set("net_revenue", current.netRevenue, current.netRevenue, previous?.netRevenue);
  set("order_count", current.orderCount, current.orderCount, previous?.orderCount);
  set("average_order_value", current.aov, current.aov ?? 0, previous?.aov ?? 0);
  set("repeat_rate", current.repeatRate, current.repeatRate ?? 0, previous?.repeatRate ?? 0);
  set("new_customers", current.newCustomerCount, current.newCustomerCount, previous?.newCustomerCount);
  set("active_customers", current.activeCustomerCount, current.activeCustomerCount, previous?.activeCustomerCount);
  set("cancelled_orders", current.cancelledOrderCount, current.cancelledOrderCount, previous?.cancelledOrderCount);
  set("late_orders", current.lateOrderCount, current.lateOrderCount, previous?.lateOrderCount);
  set("production_completion_rate", current.productionCompletionRate, current.productionCompletionRate ?? 0, previous?.productionCompletionRate ?? 0);
  set("packing_completion_rate", current.packingCompletionRate, current.packingCompletionRate ?? 0, previous?.packingCompletionRate ?? 0);
  set("delivery_completion_rate", current.deliveryCompletionRate, current.deliveryCompletionRate ?? 0, previous?.deliveryCompletionRate ?? 0);
  set("catering_revenue", current.cateringRevenue, current.cateringRevenue, previous?.cateringRevenue);
  set("meal_plan_revenue", current.mealPlanRevenue, current.mealPlanRevenue, previous?.mealPlanRevenue);
  set("top_channel", current.topChannel?.label ?? null);
  set("top_brand", current.topBrand?.name ?? null);
  set("top_location", current.topLocation?.name ?? null);
  return result as Record<KpiId, KpiValue>;
}
