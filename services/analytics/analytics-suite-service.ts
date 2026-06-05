import { defaultFilters } from "@/lib/analytics/filters";
import {
  buildAnalyticsSuiteLane,
  buildAnalyticsSuiteMetric,
  buildAnalyticsSuiteSnapshot,
  formatMoney,
  formatRate,
} from "@/lib/analytics/analytics-suite-builders";
import type { AnalyticsSuiteSnapshot } from "@/lib/analytics/analytics-suite-types";
import {
  loadCateringAnalytics,
  loadCustomerAnalytics,
  loadExecutiveOverview,
  loadInventoryAnalytics,
  loadMealPlanAnalytics,
  loadOrderAnalytics,
  loadPackingDeliveryAnalytics,
  loadProductionAnalytics,
} from "@/services/analytics/analytics-service";
import { loadForecasting2Snapshot } from "@/services/ai/forecasting";

export type { AnalyticsSuiteSnapshot } from "@/lib/analytics/analytics-suite-types";

export async function loadAnalyticsSuiteSnapshot(userId: string): Promise<AnalyticsSuiteSnapshot> {
  const filters = defaultFilters();
  const scope = { userId };

  const [
    executive,
    orders,
    customers,
    production,
    packingDelivery,
    catering,
    mealPlans,
    inventory,
    forecast,
  ] = await Promise.all([
    loadExecutiveOverview(scope, filters),
    loadOrderAnalytics(scope, filters),
    loadCustomerAnalytics(scope, filters),
    loadProductionAnalytics(scope, filters),
    loadPackingDeliveryAnalytics(scope, filters),
    loadCateringAnalytics(scope, filters),
    loadMealPlanAnalytics(scope, filters),
    loadInventoryAnalytics(scope),
    loadForecasting2Snapshot(userId),
  ]);

  const lanes = [
    buildAnalyticsSuiteLane({
      id: "revenue",
      metrics: [
        buildAnalyticsSuiteMetric({
          id: "gross-revenue",
          label: "Gross revenue",
          value: formatMoney(executive.grossRevenue),
          hint: `Net ${formatMoney(executive.netRevenue)}`,
          href: "/dashboard/analytics/revenue",
        }),
        buildAnalyticsSuiteMetric({
          id: "aov",
          label: "AOV",
          value: executive.aov != null ? formatMoney(executive.aov) : "—",
          href: "/dashboard/analytics/revenue",
        }),
        buildAnalyticsSuiteMetric({
          id: "top-channel",
          label: "Top channel",
          value: executive.topChannel?.label ?? "—",
          hint: executive.topChannel ? formatMoney(executive.topChannel.revenue) : null,
          href: "/dashboard/analytics/channels",
        }),
        buildAnalyticsSuiteMetric({
          id: "top-brand",
          label: "Top brand",
          value: executive.topBrand?.name ?? "—",
          hint: executive.topBrand ? formatMoney(executive.topBrand.revenue) : null,
        }),
      ],
    }),
    buildAnalyticsSuiteLane({
      id: "orders",
      metrics: [
        buildAnalyticsSuiteMetric({
          id: "order-count",
          label: "Orders",
          value: String(orders.totalOrders),
          hint: `${orders.cancelledOrders} cancelled`,
          href: "/dashboard/analytics/orders",
        }),
        buildAnalyticsSuiteMetric({
          id: "cancellation-rate",
          label: "Cancellation rate",
          value: formatRate(orders.cancellationRate),
          href: "/dashboard/analytics/orders",
        }),
        buildAnalyticsSuiteMetric({
          id: "pickup-delivery",
          label: "Pickup / delivery",
          value: `${orders.fulfillmentMix.pickup} / ${orders.fulfillmentMix.delivery}`,
          href: "/dashboard/analytics/orders",
        }),
        buildAnalyticsSuiteMetric({
          id: "late-orders",
          label: "Late orders",
          value: String(executive.lateOrderCount),
          href: "/dashboard/analytics/orders",
        }),
      ],
    }),
    buildAnalyticsSuiteLane({
      id: "customers",
      metrics: [
        buildAnalyticsSuiteMetric({
          id: "active-customers",
          label: "Active customers",
          value: String(executive.activeCustomerCount),
          hint: `${executive.newCustomerCount} new`,
          href: "/dashboard/analytics/customers",
        }),
        buildAnalyticsSuiteMetric({
          id: "repeat-rate",
          label: "Repeat rate",
          value: executive.repeatRateLabel,
          href: "/dashboard/analytics/customers",
        }),
        buildAnalyticsSuiteMetric({
          id: "unique-customers",
          label: "Unique buyers",
          value: String(customers.uniqueCustomers),
          hint: `${customers.repeatCustomers} repeat`,
          href: "/dashboard/analytics/customers",
        }),
        buildAnalyticsSuiteMetric({
          id: "vip-revenue",
          label: "VIP lifetime",
          value: formatMoney(customers.vipRevenue),
          href: "/dashboard/customers/vip",
        }),
      ],
    }),
    buildAnalyticsSuiteLane({
      id: "operations",
      metrics: [
        buildAnalyticsSuiteMetric({
          id: "production-completion",
          label: "Production completion",
          value: formatRate(executive.productionCompletionRate),
          href: "/dashboard/analytics/production",
        }),
        buildAnalyticsSuiteMetric({
          id: "packing-completion",
          label: "Packing completion",
          value: formatRate(executive.packingCompletionRate),
          href: "/dashboard/analytics/delivery",
        }),
        buildAnalyticsSuiteMetric({
          id: "delivery-completion",
          label: "Delivery completion",
          value: formatRate(executive.deliveryCompletionRate),
          href: "/dashboard/analytics/delivery",
        }),
        buildAnalyticsSuiteMetric({
          id: "production-delayed",
          label: "Delayed batches",
          value: String(production.delayed),
          hint: `${production.completedItems}/${production.totalItems} items`,
          href: "/dashboard/analytics/production",
        }),
        buildAnalyticsSuiteMetric({
          id: "packing-tasks",
          label: "Packing tasks",
          value: String(packingDelivery.packing.total),
          hint: formatRate(packingDelivery.packing.completionRate),
          href: "/dashboard/analytics/delivery",
        }),
        buildAnalyticsSuiteMetric({
          id: "delivery-stops",
          label: "Delivery stops",
          value: String(
            packingDelivery.deliveryStops.reduce((sum, row) => sum + row.count, 0),
          ),
          hint: formatRate(packingDelivery.onTimeRate),
          href: "/dashboard/analytics/delivery",
        }),
      ],
    }),
    buildAnalyticsSuiteLane({
      id: "catering",
      metrics: [
        buildAnalyticsSuiteMetric({
          id: "catering-revenue",
          label: "Catering revenue",
          value: formatMoney(executive.cateringRevenue),
          href: "/dashboard/analytics/catering",
        }),
        buildAnalyticsSuiteMetric({
          id: "accepted-revenue",
          label: "Accepted revenue",
          value: formatMoney(catering.acceptedRevenue),
          hint: `${catering.totalQuotes} quotes`,
          href: "/dashboard/analytics/catering",
        }),
        buildAnalyticsSuiteMetric({
          id: "pipeline-value",
          label: "Pipeline value",
          value: formatMoney(catering.pipelineValue),
          hint: catering.conversionRate != null ? formatRate(catering.conversionRate) : null,
          href: "/dashboard/catering",
        }),
      ],
    }),
    buildAnalyticsSuiteLane({
      id: "meal_plans",
      metrics: [
        buildAnalyticsSuiteMetric({
          id: "meal-plan-revenue",
          label: "Meal plan revenue",
          value: formatMoney(executive.mealPlanRevenue),
          href: "/dashboard/analytics/meal-plans",
        }),
        buildAnalyticsSuiteMetric({
          id: "active-plans",
          label: "Active plans",
          value: String(mealPlans.activePlans),
          hint: `${mealPlans.cyclesInWindow} cycles in window`,
          href: "/dashboard/analytics/meal-plans",
        }),
        buildAnalyticsSuiteMetric({
          id: "recurring-orders",
          label: "Recurring orders",
          value: String(orders.recurringOrders),
          href: "/dashboard/analytics/meal-plans",
        }),
      ],
    }),
    buildAnalyticsSuiteLane({
      id: "inventory",
      metrics: [
        buildAnalyticsSuiteMetric({
          id: "ingredients",
          label: "Ingredients tracked",
          value: String(inventory.ingredientsTracked),
          href: "/dashboard/analytics/inventory",
        }),
        buildAnalyticsSuiteMetric({
          id: "recipes",
          label: "Recipes tracked",
          value: String(inventory.recipesTracked),
          href: "/dashboard/analytics/inventory",
        }),
        buildAnalyticsSuiteMetric({
          id: "usage-rows",
          label: "Demand lines",
          value: String(inventory.ingredientUsageRows),
          href: "/dashboard/analytics/inventory",
        }),
      ],
    }),
    buildAnalyticsSuiteLane({
      id: "forecast",
      metrics: [
        buildAnalyticsSuiteMetric({
          id: "forecast-90-orders",
          label: "90-day orders (est.)",
          value: String(forecast.summary.projectedTotalOrders),
          hint: `${forecast.summary.confidence} confidence`,
          href: "/dashboard/forecast/forecasting-2",
        }),
        buildAnalyticsSuiteMetric({
          id: "forecast-90-revenue",
          label: "90-day revenue (est.)",
          value: formatMoney(forecast.summary.projectedTotalRevenueUsd),
          href: "/dashboard/forecast/forecasting-2",
        }),
        buildAnalyticsSuiteMetric({
          id: "forecast-holiday-days",
          label: "Holiday uplift days",
          value: String(forecast.summary.holidayUpliftDays),
          href: "/dashboard/forecast/forecasting-2",
        }),
      ],
    }),
  ];

  const warnings = [
    ...executive.warnings,
    ...(forecast.summary.warning ? [forecast.summary.warning] : []),
  ];

  return buildAnalyticsSuiteSnapshot({
    rangeLabel: executive.filtersRangeLabel,
    lanes,
    warnings,
  });
}
