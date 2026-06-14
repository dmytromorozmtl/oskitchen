import type { CopilotInsightSeed } from "@/lib/ai/copilot-types";

export type DeterministicSnapshot = {
  rangeLabel: string;
  bulletSummary: string;
  insights: CopilotInsightSeed[];
};

/** Minimal executive overview fields used by deterministic AI briefing. */
export type DeterministicInsightsOverviewInput = {
  rangeLabel: string;
  orderCount: number;
  cancelledOrderCount: number;
  failedIntegrations: number;
  overdueProductionItems: number;
  packingAccuracy: number | null;
  failedDeliveries: number;
  inventoryShortages: number;
  imminentShortages: number;
  purchasingNeeds: number;
  stalePurchaseOrders: number;
  cateringFollowUpsOverdue: number;
  mealPlanCyclesMissing: number;
  overdueTasks: number;
  marginAtRiskItems: number;
  repeatRate: number | null;
};

/** Pure deterministic briefing from hub aggregates — ground truth for P2-61 benchmarks. */
export function buildDeterministicInsightsFromOverview(
  overview: DeterministicInsightsOverviewInput,
): DeterministicSnapshot {
  const seeds: CopilotInsightSeed[] = [];

  function add(seed: CopilotInsightSeed): void {
    seeds.push(seed);
  }

  add({
    type: "throughput_today",
    severity: "INFO",
    title: "Today's throughput",
    summary: `${overview.orderCount} order${overview.orderCount === 1 ? "" : "s"} in ${overview.rangeLabel}, ${overview.cancelledOrderCount} cancelled.`,
    sourceType: "orders",
    recommendedAction: "Open the Order Hub if anything looks unusual.",
    actionRoute: "/dashboard/orders",
  });

  if (overview.failedIntegrations > 0) {
    add({
      type: "failed_integrations",
      severity: "CRITICAL",
      title: "Channel integration needs attention",
      summary: `${overview.failedIntegrations} integration connection${overview.failedIntegrations === 1 ? "" : "s"} not currently active.`,
      sourceType: "channels",
      recommendedAction: "Re-authenticate the affected channel.",
      actionRoute: "/dashboard/integrations",
    });
  }

  if (overview.overdueProductionItems > 0) {
    add({
      type: "production_overdue",
      severity: overview.overdueProductionItems >= 10 ? "CRITICAL" : "WARNING",
      title: "Production items behind schedule",
      summary: `${overview.overdueProductionItems} production item${overview.overdueProductionItems === 1 ? "" : "s"} not yet completed.`,
      sourceType: "production",
      recommendedAction: "Re-prioritise the production board.",
      actionRoute: "/dashboard/production",
    });
  }

  if (overview.packingAccuracy != null && overview.packingAccuracy < 0.9) {
    add({
      type: "packing_accuracy_low",
      severity: "WARNING",
      title: "Packing accuracy below target",
      summary: `Pack-through rate is ${(overview.packingAccuracy * 100).toFixed(1)}%.`,
      sourceType: "packing",
      recommendedAction: "Review packing exceptions before the next wave.",
      actionRoute: "/dashboard/packing",
    });
  }

  if (overview.failedDeliveries > 0) {
    add({
      type: "failed_delivery_stops",
      severity: "WARNING",
      title: "Failed delivery stops",
      summary: `${overview.failedDeliveries} stop${overview.failedDeliveries === 1 ? "" : "s"} marked as failed.`,
      sourceType: "routes",
      recommendedAction: "Reach out to affected customers and re-attempt.",
      actionRoute: "/dashboard/routes",
    });
  }

  if (overview.inventoryShortages > 0) {
    add({
      type: overview.imminentShortages > 0 ? "inventory_shortage_upcoming" : "inventory_shortage",
      severity: overview.imminentShortages > 0 ? "CRITICAL" : "WARNING",
      title:
        overview.imminentShortages > 0
          ? "Ingredient shortages before production date"
          : "Ingredient shortages open",
      summary:
        overview.imminentShortages > 0
          ? `${overview.imminentShortages} ingredient${overview.imminentShortages === 1 ? "" : "s"} short within 3 days.`
          : `${overview.inventoryShortages} ingredient line${overview.inventoryShortages === 1 ? "" : "s"} short.`,
      sourceType: "inventory_demand",
      recommendedAction: "Open ingredient demand and reconcile with purchasing.",
      actionRoute: "/dashboard/inventory/demand",
    });
  }

  if (overview.purchasingNeeds > 0) {
    add({
      type: "purchasing_open",
      severity: overview.stalePurchaseOrders > 0 ? "WARNING" : "INFO",
      title: "Open purchase orders",
      summary: `${overview.purchasingNeeds} open PO${overview.purchasingNeeds === 1 ? "" : "s"} · ${overview.stalePurchaseOrders} stale > 7d.`,
      sourceType: "purchasing",
      recommendedAction: "Send or close stale draft purchase orders.",
      actionRoute: "/dashboard/purchasing",
    });
  }

  if (overview.cateringFollowUpsOverdue > 0) {
    add({
      type: "catering_followup_overdue",
      severity: "INFO",
      title: "Catering follow-ups overdue",
      summary: `${overview.cateringFollowUpsOverdue} catering quote follow-up${overview.cateringFollowUpsOverdue === 1 ? "" : "s"} past due.`,
      sourceType: "catering",
      recommendedAction: "Complete or reschedule the overdue follow-ups.",
      actionRoute: "/dashboard/catering-quotes",
    });
  }

  if (overview.mealPlanCyclesMissing > 0) {
    add({
      type: "meal_plan_cycles_missing",
      severity: "WARNING",
      title: "Meal plan cycles missing",
      summary: `${overview.mealPlanCyclesMissing} active meal plan${overview.mealPlanCyclesMissing === 1 ? "" : "s"} have no upcoming cycle scheduled.`,
      sourceType: "meal_plans",
      recommendedAction: "Generate the next cycle in Meal plans.",
      actionRoute: "/dashboard/meal-plans",
    });
  }

  if (overview.overdueTasks > 5) {
    add({
      type: "overdue_tasks",
      severity: "WARNING",
      title: "Overdue tasks",
      summary: `${overview.overdueTasks} kitchen / ops tasks overdue.`,
      sourceType: "tasks",
      recommendedAction: "Reassign or close stale tasks.",
      actionRoute: "/dashboard/tasks",
    });
  }

  if (overview.marginAtRiskItems > 0) {
    add({
      type: "low_margin_item",
      severity: "WARNING",
      title: "Items below margin target",
      summary: `${overview.marginAtRiskItems} item${overview.marginAtRiskItems === 1 ? "" : "s"} flagged in the latest costing run.`,
      sourceType: "costing",
      recommendedAction: "Review pricing or recipe cost in Costing.",
      actionRoute: "/dashboard/costing",
    });
  }

  if (overview.repeatRate != null && overview.repeatRate < 0.2) {
    add({
      type: "low_repeat_rate",
      severity: "INFO",
      title: "Low repeat-customer rate",
      summary: `Repeat rate is ${(overview.repeatRate * 100).toFixed(1)}%.`,
      sourceType: "customers",
      recommendedAction: "Open the CRM at-risk list.",
      actionRoute: "/dashboard/customers/at-risk",
    });
  }

  const bullets = seeds
    .map((s) => `- ${s.title}: ${s.summary}${s.recommendedAction ? ` → ${s.recommendedAction}` : ""}`)
    .join("\n");

  return {
    rangeLabel: overview.rangeLabel,
    bulletSummary: bullets || "- No deterministic operational signals detected in the window.",
    insights: seeds,
  };
}
