import type { ExecutiveInsightSeverity } from "@prisma/client";

/** Identifiers used in `ExecutiveInsight.type` so we can deduplicate. */
export type ExecutiveInsightType =
  | "packing_accuracy_low"
  | "production_overdue"
  | "production_capacity_warning"
  | "inventory_shortage_upcoming"
  | "low_repeat_rate"
  | "low_margin_item"
  | "failed_channel_integration"
  | "failed_delivery_stops"
  | "catering_followup_overdue"
  | "meal_plan_cycles_missing"
  | "overdue_tasks"
  | "revenue_drop"
  | "purchase_order_stale"
  | "all_clear";

export type ExecutiveInsightSeed = {
  type: ExecutiveInsightType;
  severity: ExecutiveInsightSeverity;
  title: string;
  description: string;
  actionLabel?: string | null;
  actionRoute?: string | null;
  sourceType?: string | null;
  sourceId?: string | null;
  metadata?: Record<string, unknown>;
};

export type InsightContext = {
  revenueTrend: number | null;
  orderTrend: number | null;
  packingAccuracy: number | null;
  productionCompletion: number | null;
  overdueProductionItems: number;
  failedDeliveries: number;
  inventoryShortages: number;
  imminentShortages: number;
  marginAtRiskItems: number;
  failedIntegrations: number;
  cateringFollowUpsOverdue: number;
  mealPlanCyclesMissing: number;
  overdueTasks: number;
  stalePurchaseOrders: number;
  repeatRate: number | null;
};

/**
 * Pure rule engine. Deterministic — given the same `InsightContext`,
 * the seeds always match. Callers can then upsert into the
 * `ExecutiveInsight` table.
 */
export function deriveInsights(ctx: InsightContext): ExecutiveInsightSeed[] {
  const seeds: ExecutiveInsightSeed[] = [];

  if (ctx.revenueTrend != null && ctx.revenueTrend <= -0.2) {
    seeds.push({
      type: "revenue_drop",
      severity: "WARNING",
      title: "Revenue down vs. previous period",
      description: `Revenue is ${(Math.abs(ctx.revenueTrend) * 100).toFixed(1)}% below the previous window. Open Analytics to compare channels and customers.`,
      actionLabel: "Open revenue analytics",
      actionRoute: "/dashboard/analytics/revenue",
    });
  }

  if (ctx.packingAccuracy != null && ctx.packingAccuracy < 0.9) {
    seeds.push({
      type: "packing_accuracy_low",
      severity: "WARNING",
      title: "Packing accuracy below target",
      description: `Pack-through rate is ${(ctx.packingAccuracy * 100).toFixed(1)}%. Review exceptions before the next packing wave.`,
      actionLabel: "Open packing",
      actionRoute: "/dashboard/packing",
    });
  }

  if (ctx.overdueProductionItems > 0) {
    seeds.push({
      type: "production_overdue",
      severity: ctx.overdueProductionItems >= 10 ? "CRITICAL" : "WARNING",
      title: "Production items behind schedule",
      description: `${ctx.overdueProductionItems} production item${ctx.overdueProductionItems === 1 ? "" : "s"} not yet completed. Re-prioritise the production board.`,
      actionLabel: "Open production",
      actionRoute: "/dashboard/production",
    });
  }

  if (ctx.orderTrend != null && ctx.orderTrend > 0.25 && ctx.productionCompletion != null && ctx.productionCompletion < 0.9) {
    seeds.push({
      type: "production_capacity_warning",
      severity: "WARNING",
      title: "Orders up but production lagging",
      description: `Orders grew ${(ctx.orderTrend * 100).toFixed(1)}% while production completion is ${(ctx.productionCompletion * 100).toFixed(1)}%. Plan extra shifts or trim the menu.`,
      actionLabel: "Open production",
      actionRoute: "/dashboard/production",
    });
  }

  if (ctx.imminentShortages > 0) {
    seeds.push({
      type: "inventory_shortage_upcoming",
      severity: "CRITICAL",
      title: "Ingredient shortages before production date",
      description: `${ctx.imminentShortages} ingredient${ctx.imminentShortages === 1 ? "" : "s"} short of required quantity within the next 3 days.`,
      actionLabel: "Open ingredient demand",
      actionRoute: "/dashboard/inventory/demand",
    });
  } else if (ctx.inventoryShortages > 0) {
    seeds.push({
      type: "inventory_shortage_upcoming",
      severity: "WARNING",
      title: "Ingredient shortages open",
      description: `${ctx.inventoryShortages} ingredient line${ctx.inventoryShortages === 1 ? "" : "s"} short of required quantity. Confirm purchasing covers the gap.`,
      actionLabel: "Open ingredient demand",
      actionRoute: "/dashboard/inventory/demand",
    });
  }

  if (ctx.repeatRate != null && ctx.repeatRate < 0.2) {
    seeds.push({
      type: "low_repeat_rate",
      severity: "INFO",
      title: "Low repeat-customer rate",
      description: `Repeat rate is ${(ctx.repeatRate * 100).toFixed(1)}%. Consider a retention campaign for at-risk customers.`,
      actionLabel: "Open customers",
      actionRoute: "/dashboard/customers/at-risk",
    });
  }

  if (ctx.marginAtRiskItems > 0) {
    seeds.push({
      type: "low_margin_item",
      severity: "WARNING",
      title: "Items below margin target",
      description: `${ctx.marginAtRiskItems} item${ctx.marginAtRiskItems === 1 ? "" : "s"} flagged in the latest costing run. Review pricing or recipe cost.`,
      actionLabel: "Open costing",
      actionRoute: "/dashboard/costing",
    });
  }

  if (ctx.failedIntegrations > 0) {
    seeds.push({
      type: "failed_channel_integration",
      severity: "CRITICAL",
      title: "Channel integration needs attention",
      description: `${ctx.failedIntegrations} integration connection${ctx.failedIntegrations === 1 ? "" : "s"} are not currently active.`,
      actionLabel: "Open integrations",
      actionRoute: "/dashboard/integrations",
    });
  }

  if (ctx.failedDeliveries > 0) {
    seeds.push({
      type: "failed_delivery_stops",
      severity: "WARNING",
      title: "Failed delivery stops",
      description: `${ctx.failedDeliveries} delivery stop${ctx.failedDeliveries === 1 ? "" : "s"} marked as failed. Reach out to the affected customers.`,
      actionLabel: "Open routes",
      actionRoute: "/dashboard/routes",
    });
  }

  if (ctx.cateringFollowUpsOverdue > 0) {
    seeds.push({
      type: "catering_followup_overdue",
      severity: "INFO",
      title: "Catering follow-ups overdue",
      description: `${ctx.cateringFollowUpsOverdue} catering quote${ctx.cateringFollowUpsOverdue === 1 ? "" : "s"} have follow-ups past the due date.`,
      actionLabel: "Open catering quotes",
      actionRoute: "/dashboard/catering-quotes",
    });
  }

  if (ctx.mealPlanCyclesMissing > 0) {
    seeds.push({
      type: "meal_plan_cycles_missing",
      severity: "WARNING",
      title: "Meal plan cycles need to be generated",
      description: `${ctx.mealPlanCyclesMissing} active meal plan${ctx.mealPlanCyclesMissing === 1 ? "" : "s"} have no upcoming cycle scheduled.`,
      actionLabel: "Open meal plans",
      actionRoute: "/dashboard/meal-plans",
    });
  }

  if (ctx.overdueTasks > 5) {
    seeds.push({
      type: "overdue_tasks",
      severity: "WARNING",
      title: "Overdue staff tasks",
      description: `${ctx.overdueTasks} kitchen / operations tasks are overdue.`,
      actionLabel: "Open tasks",
      actionRoute: "/dashboard/tasks",
    });
  }

  if (ctx.stalePurchaseOrders > 0) {
    seeds.push({
      type: "purchase_order_stale",
      severity: "INFO",
      title: "Draft purchase orders older than a week",
      description: `${ctx.stalePurchaseOrders} draft purchase order${ctx.stalePurchaseOrders === 1 ? "" : "s"} have not been sent for over 7 days.`,
      actionLabel: "Open purchasing",
      actionRoute: "/dashboard/purchasing",
    });
  }

  if (seeds.length === 0) {
    seeds.push({
      type: "all_clear",
      severity: "SUCCESS",
      title: "No risks detected",
      description: "All tracked operational signals are inside their guard rails.",
    });
  }

  return seeds;
}
