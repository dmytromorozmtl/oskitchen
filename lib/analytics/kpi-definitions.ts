/**
 * Canonical KPI catalogue. Every metric used in the analytics module
 * references one of these definitions so the UI and exports use the
 * same human-friendly name + description. No metric is invented here
 * that isn't derivable from real DB rows.
 */

export type KpiId =
  | "gross_revenue"
  | "net_revenue"
  | "order_count"
  | "average_order_value"
  | "repeat_rate"
  | "new_customers"
  | "active_customers"
  | "cancelled_orders"
  | "late_orders"
  | "production_completion_rate"
  | "packing_completion_rate"
  | "delivery_completion_rate"
  | "catering_revenue"
  | "meal_plan_revenue"
  | "top_channel"
  | "top_brand"
  | "top_location";

export type KpiFormat = "currency" | "count" | "percent" | "text";

export type KpiDefinition = {
  id: KpiId;
  label: string;
  description: string;
  format: KpiFormat;
  /**
   * Concise plain-English source-of-truth note. Surfaced in the UI so
   * owners know exactly how each number is computed.
   */
  formula: string;
};

export const KPI_DEFINITIONS: Record<KpiId, KpiDefinition> = {
  gross_revenue: {
    id: "gross_revenue",
    label: "Gross revenue",
    description: "Sum of order totals in the window (any status except CANCELLED).",
    format: "currency",
    formula: "SUM(orders.total WHERE status != CANCELLED)",
  },
  net_revenue: {
    id: "net_revenue",
    label: "Net revenue",
    description: "Gross revenue minus refunds and cancelled order totals.",
    format: "currency",
    formula: "gross_revenue - SUM(orders.total WHERE status = CANCELLED)",
  },
  order_count: {
    id: "order_count",
    label: "Orders",
    description: "Count of orders created in the window.",
    format: "count",
    formula: "COUNT(orders WHERE createdAt BETWEEN from AND to)",
  },
  average_order_value: {
    id: "average_order_value",
    label: "Average order value",
    description: "Gross revenue / non-cancelled order count.",
    format: "currency",
    formula: "gross_revenue / COUNT(orders WHERE status != CANCELLED)",
  },
  repeat_rate: {
    id: "repeat_rate",
    label: "Repeat rate",
    description: "Share of customers with 2+ orders in the window.",
    format: "percent",
    formula: "COUNT(customers WITH >=2 orders) / COUNT(distinct customers)",
  },
  new_customers: {
    id: "new_customers",
    label: "New customers",
    description: "Customers whose first order in the workspace falls in the window.",
    format: "count",
    formula: "COUNT(kitchen_customers WHERE firstOrderAt BETWEEN from AND to)",
  },
  active_customers: {
    id: "active_customers",
    label: "Active customers",
    description: "Distinct customers (by email) with at least one order in the window.",
    format: "count",
    formula: "COUNT(distinct lower(customerEmail))",
  },
  cancelled_orders: {
    id: "cancelled_orders",
    label: "Cancelled orders",
    description: "Orders with status = CANCELLED in the window.",
    format: "count",
    formula: "COUNT(orders WHERE status = CANCELLED)",
  },
  late_orders: {
    id: "late_orders",
    label: "Late orders",
    description: "Orders past pickup/event date and not yet completed.",
    format: "count",
    formula: "COUNT(orders WHERE pickupDate < today AND status NOT IN (READY, COMPLETED))",
  },
  production_completion_rate: {
    id: "production_completion_rate",
    label: "Production completion",
    description: "Sum of completedItems / totalItems across production batches in the window.",
    format: "percent",
    formula: "SUM(completedItems) / SUM(totalItems)",
  },
  packing_completion_rate: {
    id: "packing_completion_rate",
    label: "Packing completion",
    description: "Sum of packedItems / totalItems across packing batches in the window.",
    format: "percent",
    formula: "SUM(packedItems) / SUM(totalItems)",
  },
  delivery_completion_rate: {
    id: "delivery_completion_rate",
    label: "Delivery completion",
    description: "Delivery stops marked DELIVERED divided by total stops in the window.",
    format: "percent",
    formula: "COUNT(stops WHERE status = DELIVERED) / COUNT(stops)",
  },
  catering_revenue: {
    id: "catering_revenue",
    label: "Catering revenue",
    description: "Sum of accepted/converted catering quote totals in the window.",
    format: "currency",
    formula: "SUM(catering_quotes.total WHERE status IN (ACCEPTED, CONVERTED_TO_ORDER))",
  },
  meal_plan_revenue: {
    id: "meal_plan_revenue",
    label: "Meal plan revenue",
    description: "Sum of order totals where the order was generated from a meal plan cycle.",
    format: "currency",
    formula: "SUM(orders.total WHERE order.mealPlanCycle IS NOT NULL)",
  },
  top_channel: {
    id: "top_channel",
    label: "Top channel",
    description: "Channel with the highest gross revenue in the window.",
    format: "text",
    formula: "ARGMAX(gross_revenue) GROUP BY channel",
  },
  top_brand: {
    id: "top_brand",
    label: "Top brand",
    description: "Brand with the highest gross revenue in the window.",
    format: "text",
    formula: "ARGMAX(gross_revenue) GROUP BY brandId",
  },
  top_location: {
    id: "top_location",
    label: "Top location",
    description: "Location with the highest gross revenue in the window.",
    format: "text",
    formula: "ARGMAX(gross_revenue) GROUP BY locationId",
  },
};
