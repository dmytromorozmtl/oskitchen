import type { ExecutivePermission } from "@/lib/executive/executive-permissions";

/** Canonical KPI identifiers surfaced on the Executive dashboard. */
export type ExecutiveKpiKey =
  | "revenue"
  | "orders"
  | "average_order_value"
  | "repeat_customers"
  | "new_customers"
  | "top_channel"
  | "production_completion"
  | "packing_accuracy"
  | "delivery_performance"
  | "margin_estimate"
  | "inventory_alerts"
  | "purchasing_needs"
  | "overdue_tasks"
  | "catering_pipeline"
  | "meal_plan_recurring"
  | "top_brand"
  | "top_location";

export type ExecutiveKpiGroup =
  | "Revenue"
  | "Orders"
  | "Customers"
  | "Channels"
  | "Production"
  | "Packing"
  | "Delivery"
  | "Margin"
  | "Inventory"
  | "Purchasing"
  | "Tasks / Labor"
  | "Brands"
  | "Locations"
  | "Catering"
  | "Meal Plans";

export type ExecutiveKpiFormat = "currency" | "number" | "percent" | "text";

export type ExecutiveKpiDefinition = {
  key: ExecutiveKpiKey;
  label: string;
  description: string;
  group: ExecutiveKpiGroup;
  source: string;
  period: "selected" | "rolling_7d" | "rolling_30d";
  comparison: "previous_period" | "previous_week" | "previous_month" | "none";
  requiredPermission: ExecutivePermission;
  emptyState: string;
  drilldownRoute: string;
  warningRules: string[];
  format: ExecutiveKpiFormat;
};

export const EXECUTIVE_KPIS: Record<ExecutiveKpiKey, ExecutiveKpiDefinition> = {
  revenue: {
    key: "revenue",
    label: "Net revenue",
    description: "Sum of order totals in the selected window, excluding cancelled orders.",
    group: "Revenue",
    source: "Order.total + orderContributesToRevenue",
    period: "selected",
    comparison: "previous_period",
    requiredPermission: "executive.read.financial",
    emptyState: "Create or import orders to see revenue.",
    drilldownRoute: "/dashboard/analytics/revenue",
    warningRules: ["Revenue down > 20% vs. previous period", "Cancellation rate > 10%"],
    format: "currency",
  },
  orders: {
    key: "orders",
    label: "Orders",
    description: "Total orders within the selected window (all statuses).",
    group: "Orders",
    source: "Order.count",
    period: "selected",
    comparison: "previous_period",
    requiredPermission: "executive.view",
    emptyState: "No orders yet for this window.",
    drilldownRoute: "/dashboard/analytics/orders",
    warningRules: ["Order count down > 25% vs. previous period"],
    format: "number",
  },
  average_order_value: {
    key: "average_order_value",
    label: "Average order value",
    description: "Net revenue ÷ orders in the selected window.",
    group: "Revenue",
    source: "sum(Order.total)/count(Order)",
    period: "selected",
    comparison: "previous_period",
    requiredPermission: "executive.read.financial",
    emptyState: "AOV will appear once you have orders.",
    drilldownRoute: "/dashboard/analytics/revenue",
    warningRules: ["AOV down > 15% vs. previous period"],
    format: "currency",
  },
  repeat_customers: {
    key: "repeat_customers",
    label: "Repeat rate",
    description: "Customers with ≥ 2 orders in the window ÷ unique customers.",
    group: "Customers",
    source: "computeRepeatRate(Order.customerEmail)",
    period: "selected",
    comparison: "previous_period",
    requiredPermission: "executive.read.financial",
    emptyState: "Repeat rate appears after the second visit.",
    drilldownRoute: "/dashboard/analytics/customers",
    warningRules: ["Repeat rate < 20%"],
    format: "percent",
  },
  new_customers: {
    key: "new_customers",
    label: "New customers",
    description: "Customers whose first order falls within the window.",
    group: "Customers",
    source: "KitchenCustomer.firstOrderAt in window",
    period: "selected",
    comparison: "previous_period",
    requiredPermission: "executive.view",
    emptyState: "No new customers in this window.",
    drilldownRoute: "/dashboard/customers",
    warningRules: ["No new customers across two consecutive periods"],
    format: "number",
  },
  top_channel: {
    key: "top_channel",
    label: "Top channel",
    description: "Channel with highest net revenue in the window.",
    group: "Channels",
    source: "channelForOrder + sumRevenue",
    period: "selected",
    comparison: "none",
    requiredPermission: "executive.read.financial",
    emptyState: "Connect a channel or take manual orders.",
    drilldownRoute: "/dashboard/analytics/channels",
    warningRules: ["Top channel concentration > 80% — diversify"],
    format: "text",
  },
  production_completion: {
    key: "production_completion",
    label: "Production completion",
    description: "Completed items ÷ total items across production batches in the window.",
    group: "Production",
    source: "ProductionBatch.completedItems / totalItems",
    period: "selected",
    comparison: "previous_period",
    requiredPermission: "executive.read.operations",
    emptyState: "Schedule a production batch to see completion.",
    drilldownRoute: "/dashboard/production",
    warningRules: ["Completion rate < 90%"],
    format: "percent",
  },
  packing_accuracy: {
    key: "packing_accuracy",
    label: "Packing accuracy",
    description: "Packed items ÷ total items across packing batches in the window.",
    group: "Packing",
    source: "PackingBatch.packedItems / totalItems",
    period: "selected",
    comparison: "previous_period",
    requiredPermission: "executive.read.operations",
    emptyState: "Run a packing batch to see accuracy.",
    drilldownRoute: "/dashboard/packing",
    warningRules: ["Pack-through < 95%"],
    format: "percent",
  },
  delivery_performance: {
    key: "delivery_performance",
    label: "Delivery performance",
    description: "DeliveryStops in DELIVERED status ÷ total stops in the window.",
    group: "Delivery",
    source: "DeliveryStop.status",
    period: "selected",
    comparison: "previous_period",
    requiredPermission: "executive.read.operations",
    emptyState: "Create a delivery route to see performance.",
    drilldownRoute: "/dashboard/routes",
    warningRules: ["Delivered % < 90%", "Failed stops > 0"],
    format: "percent",
  },
  margin_estimate: {
    key: "margin_estimate",
    label: "Margin estimate",
    description:
      "Median gross-margin % across the latest costing run. Operational estimate, not an accounting statement.",
    group: "Margin",
    source: "ProfitabilityLine.grossMarginPercent (latest CostingRun)",
    period: "selected",
    comparison: "none",
    requiredPermission: "executive.read.financial",
    emptyState: "Run a costing pass to see margin signals.",
    drilldownRoute: "/dashboard/costing",
    warningRules: ["Median margin < 60%", "Any item with food-cost % > 40%"],
    format: "percent",
  },
  inventory_alerts: {
    key: "inventory_alerts",
    label: "Inventory alerts",
    description: "Open ingredient demand lines with shortage > 0.",
    group: "Inventory",
    source: "IngredientDemandRunLine.shortageQuantity",
    period: "rolling_30d",
    comparison: "none",
    requiredPermission: "executive.read.operations",
    emptyState: "Run an ingredient-demand pass to see alerts.",
    drilldownRoute: "/dashboard/inventory/demand",
    warningRules: ["≥ 5 lines with shortage", "Any shortage with date ≤ 3 days out"],
    format: "number",
  },
  purchasing_needs: {
    key: "purchasing_needs",
    label: "Purchasing needs",
    description: "Open / draft purchase orders not yet sent.",
    group: "Purchasing",
    source: "PurchaseOrder.status in DRAFT/READY_FOR_REVIEW/APPROVED",
    period: "rolling_30d",
    comparison: "none",
    requiredPermission: "executive.read.financial",
    emptyState: "No outstanding purchase orders.",
    drilldownRoute: "/dashboard/purchasing",
    warningRules: ["Any draft PO older than 7 days"],
    format: "number",
  },
  overdue_tasks: {
    key: "overdue_tasks",
    label: "Overdue tasks",
    description: "Kitchen tasks not done with dueAt in the past.",
    group: "Tasks / Labor",
    source: "KitchenTask.dueAt < now and status != DONE",
    period: "selected",
    comparison: "none",
    requiredPermission: "executive.read.operations",
    emptyState: "No overdue tasks.",
    drilldownRoute: "/dashboard/tasks",
    warningRules: ["Overdue count > 5"],
    format: "number",
  },
  catering_pipeline: {
    key: "catering_pipeline",
    label: "Catering pipeline",
    description: "Open catering quotes plus accepted-revenue this window.",
    group: "Catering",
    source: "CateringQuote",
    period: "selected",
    comparison: "previous_period",
    requiredPermission: "executive.read.financial",
    emptyState: "No catering quotes yet.",
    drilldownRoute: "/dashboard/catering-quotes",
    warningRules: ["Conversion rate < 20%"],
    format: "text",
  },
  meal_plan_recurring: {
    key: "meal_plan_recurring",
    label: "Meal-plan recurring",
    description:
      "Estimated weekly recurring revenue from active meal plans (Σ pricePerCycle ÷ frequency factor).",
    group: "Meal Plans",
    source: "MealPlan.pricePerCycle * activePlans",
    period: "selected",
    comparison: "none",
    requiredPermission: "executive.read.financial",
    emptyState: "Activate a meal plan to see recurring revenue.",
    drilldownRoute: "/dashboard/meal-plans",
    warningRules: ["Recurring revenue fell vs. previous month"],
    format: "currency",
  },
  top_brand: {
    key: "top_brand",
    label: "Top brand",
    description: "Brand with highest net revenue in the window.",
    group: "Brands",
    source: "Order.brandId + sumRevenue",
    period: "selected",
    comparison: "none",
    requiredPermission: "executive.read.brand_location",
    emptyState: "Add a brand to compare performance.",
    drilldownRoute: "/dashboard/brands",
    warningRules: ["One brand is > 80% of revenue"],
    format: "text",
  },
  top_location: {
    key: "top_location",
    label: "Top location",
    description: "Location with highest net revenue in the window.",
    group: "Locations",
    source: "Order.locationId + sumRevenue",
    period: "selected",
    comparison: "none",
    requiredPermission: "executive.read.brand_location",
    emptyState: "Add a location to compare performance.",
    drilldownRoute: "/dashboard/locations",
    warningRules: ["A location dropped > 30% week over week"],
    format: "text",
  },
};

export const EXECUTIVE_KPI_KEYS = Object.keys(EXECUTIVE_KPIS) as ExecutiveKpiKey[];

export function getKpiDefinition(key: ExecutiveKpiKey): ExecutiveKpiDefinition {
  return EXECUTIVE_KPIS[key];
}
