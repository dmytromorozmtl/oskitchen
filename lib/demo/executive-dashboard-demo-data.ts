import type { HealthScore } from "@/lib/executive/executive-health";
import type { CostingAlertsSummary } from "@/services/costing/costing-alert-service";
import type { ExecutiveKpi } from "@/services/executive/executive-dashboard-service";

export const EXECUTIVE_DEMO_DISCLAIMER =
  "Demo mode — synthetic data for sales previews. Numbers are illustrative, not your workspace totals.";

export type ExecutiveDashboardDemoInsight = {
  id: string;
  type: string;
  severity: "INFO" | "WARNING" | "CRITICAL" | "SUCCESS";
  title: string;
  description: string;
  actionLabel: string | null;
  actionRoute: string | null;
  createdAt: Date;
};

export type ExecutiveDashboardDemoSnapshot = {
  rangeLabel: string;
  focusBullets: string[];
  health: HealthScore;
  kpis: ExecutiveKpi[];
  dailyRevenue: { date: string; value: number }[];
  topProducts: { title: string; quantity: number }[];
  insights: ExecutiveDashboardDemoInsight[];
  costingVarianceAlerts: CostingAlertsSummary;
};

function kpi(
  key: string,
  label: string,
  value: string,
  rawValue: number,
  previousValue: number,
  sub: string,
  drilldownRoute: string,
  format: ExecutiveKpi["format"],
): ExecutiveKpi {
  const deltaPct =
    previousValue === 0 ? (rawValue === 0 ? 0 : null) : (rawValue - previousValue) / Math.abs(previousValue);
  return {
    key,
    label,
    value,
    rawValue,
    comparison: { previousValue, deltaPct },
    sub,
    drilldownRoute,
    format,
  };
}

/** Static executive dashboard snapshot for `/dashboard/analytics/executive-demo`. */
export function getExecutiveDashboardDemoSnapshot(): ExecutiveDashboardDemoSnapshot {
  return {
    rangeLabel: "May 27 → Jun 2, 2026 (sample week)",
    focusBullets: [
      "Net revenue up 6.4% vs prior week",
      "Shopify channel leading mix at 41%",
      "Packing accuracy at 96.8% — above guard rail",
      "Two inventory items need reorder before Friday",
    ],
    health: {
      score: 82,
      status: "Watch",
      explanation:
        "Operational estimate from synthetic demo signals — healthy throughput with minor inventory and margin watch items.",
      contributions: [
        {
          key: "inventory",
          label: "Inventory",
          deduction: 8,
          reason: "2 SKUs below par level in the sample window.",
        },
        {
          key: "margin",
          label: "Margin estimate",
          deduction: 6,
          reason: "1 menu item flagged below target margin band.",
        },
        {
          key: "integration",
          label: "Integrations",
          deduction: 4,
          reason: "Shopify webhook lag detected in demo scenario.",
        },
      ],
    },
    kpis: [
      kpi("revenue", "Net revenue", "$128,420.00", 128420, 120680, "Excludes cancelled orders", "/dashboard/analytics/revenue", "currency"),
      kpi("orders", "Orders", "1,842", 1842, 1736, "38 cancelled", "/dashboard/analytics/orders", "number"),
      kpi("average_order_value", "Average order value", "$69.72", 69.72, 69.52, "Net revenue ÷ orders", "/dashboard/analytics/revenue", "currency"),
      kpi("repeat_customers", "Repeat rate", "34.2%", 0.342, 0.318, "Customers with ≥ 2 orders", "/dashboard/analytics/customers", "percent"),
      kpi("top_channel", "Top channel", "Shopify", 52840, 49120, "41% of net revenue", "/dashboard/analytics/channels", "text"),
      kpi("production_completion", "Production completion", "94.6%", 0.946, 0.921, "412/436 items", "/dashboard/production", "percent"),
      kpi("packing_accuracy", "Packing accuracy", "96.8%", 0.968, 0.955, "398/411 items", "/dashboard/packing", "percent"),
      kpi("delivery_performance", "Delivery on-time", "91.3%", 0.913, 0.902, "168/184 stops", "/dashboard/routes", "percent"),
      kpi("margin_estimate", "Margin estimate", "58.4%", 0.584, 0.571, "Operational estimate", "/dashboard/costing", "percent"),
      kpi("inventory_alerts", "Inventory alerts", "2", 2, 3, "1 within 3 days", "/dashboard/inventory/demand", "number"),
      kpi("purchasing_needs", "Purchasing needs", "4", 4, 5, "0 stale > 7d", "/dashboard/purchasing", "number"),
      kpi("overdue_tasks", "Overdue tasks", "3", 3, 6, "18 open total", "/dashboard/tasks", "number"),
      kpi("catering_pipeline", "Catering pipeline", "2 open · $4,800.00 accepted", 2, 1, "1 accepted quote", "/dashboard/catering-quotes", "text"),
      kpi("meal_plan_recurring", "Meal plan recurring", "$12,640.00", 12640, 11880, "86 active plans", "/dashboard/meal-plans", "currency"),
      kpi("top_brand", "Top brand", "Harbor Kitchen", 68420, 64200, "53% of net revenue", "/dashboard/brands", "text"),
      kpi("top_location", "Top location", "Downtown commissary", 74210, 70120, "Primary fulfillment hub", "/dashboard/locations", "text"),
    ],
    dailyRevenue: [
      { date: "2026-05-27", value: 16240 },
      { date: "2026-05-28", value: 17120 },
      { date: "2026-05-29", value: 18400 },
      { date: "2026-05-30", value: 19880 },
      { date: "2026-05-31", value: 20640 },
      { date: "2026-06-01", value: 18920 },
      { date: "2026-06-02", value: 17220 },
    ],
    topProducts: [
      { title: "Family meal box", quantity: 412 },
      { title: "Grain bowl (large)", quantity: 286 },
      { title: "Roast chicken plate", quantity: 241 },
      { title: "Seasonal salad kit", quantity: 198 },
      { title: "House sauce flight", quantity: 156 },
    ],
    insights: [
      {
        id: "demo-insight-inventory",
        type: "inventory_shortage_upcoming",
        severity: "WARNING",
        title: "Chicken breast below par",
        description: "Reorder 40 kg suggested before Friday lunch production.",
        actionLabel: "Review inventory",
        actionRoute: "/dashboard/inventory/demand",
        createdAt: new Date("2026-06-02T08:00:00.000Z"),
      },
      {
        id: "demo-insight-margin",
        type: "low_margin_item",
        severity: "INFO",
        title: "Family meal box margin watch",
        description: "Margin at 38.2% in demo window — review vendor SKU PKG-4412 packaging cost.",
        actionLabel: "Open costing",
        actionRoute: "/dashboard/costing",
        createdAt: new Date("2026-06-02T07:30:00.000Z"),
      },
      {
        id: "demo-insight-integration",
        type: "failed_channel_integration",
        severity: "CRITICAL",
        title: "Shopify webhook lag",
        description: "Verify integration health — orders may delay syncing to KDS.",
        actionLabel: "Integration health",
        actionRoute: "/dashboard/integrations",
        createdAt: new Date("2026-06-02T06:45:00.000Z"),
      },
    ],
    costingVarianceAlerts: {
      count: 2,
      hasAlerts: true,
      topAlerts: [
        {
          productId: "demo-family-meal",
          productName: "Family meal box",
          theoreticalCost: 8.4,
          actualCost: 9.12,
          variancePercent: 8.6,
          thresholdPercent: 5,
          period: "2026-05-27 → 2026-06-02",
          source: "cost_snapshot",
        },
        {
          productId: "demo-grain-bowl",
          productName: "Grain bowl (large)",
          theoreticalCost: 4.2,
          actualCost: 4.54,
          variancePercent: 8.1,
          thresholdPercent: 5,
          period: "2026-05-27 → 2026-06-02",
          source: "profitability_run",
        },
      ],
      theftAlerts: [],
    },
  };
}
