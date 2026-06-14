import type { DeterministicInsightsOverviewInput } from "@/lib/ai/deterministic-insights-from-overview";

export type AiBriefingAccuracyScenario = {
  id: string;
  label: string;
  overview: DeterministicInsightsOverviewInput;
  expectedInsightTypes: readonly string[];
};

const RANGE = "2026-06-14 → 2026-06-14";

function baseOverview(
  overrides: Partial<DeterministicInsightsOverviewInput> = {},
): DeterministicInsightsOverviewInput {
  return {
    rangeLabel: RANGE,
    orderCount: 24,
    cancelledOrderCount: 1,
    failedIntegrations: 0,
    overdueProductionItems: 0,
    packingAccuracy: 0.94,
    failedDeliveries: 0,
    inventoryShortages: 0,
    imminentShortages: 0,
    purchasingNeeds: 0,
    stalePurchaseOrders: 0,
    cateringFollowUpsOverdue: 0,
    mealPlanCyclesMissing: 0,
    overdueTasks: 0,
    marginAtRiskItems: 0,
    repeatRate: 0.32,
    ...overrides,
  };
}

/** 25 hub-snapshot scenarios with ground-truth expected insight types (P2-61). */
export const AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_SCENARIOS: readonly AiBriefingAccuracyScenario[] =
  [
    {
      id: "baseline-throughput",
      label: "Normal rush day — throughput only",
      overview: baseOverview(),
      expectedInsightTypes: ["throughput_today"],
    },
    {
      id: "zero-orders",
      label: "Quiet day — zero orders",
      overview: baseOverview({ orderCount: 0, cancelledOrderCount: 0 }),
      expectedInsightTypes: ["throughput_today"],
    },
    {
      id: "failed-integrations",
      label: "DoorDash webhook down",
      overview: baseOverview({ failedIntegrations: 2 }),
      expectedInsightTypes: ["throughput_today", "failed_integrations"],
    },
    {
      id: "production-overdue-warning",
      label: "Production backlog — warning severity",
      overview: baseOverview({ overdueProductionItems: 4 }),
      expectedInsightTypes: ["throughput_today", "production_overdue"],
    },
    {
      id: "production-overdue-critical",
      label: "Production backlog — critical severity",
      overview: baseOverview({ overdueProductionItems: 12 }),
      expectedInsightTypes: ["throughput_today", "production_overdue"],
    },
    {
      id: "packing-accuracy-low",
      label: "Packing below 90% target",
      overview: baseOverview({ packingAccuracy: 0.82 }),
      expectedInsightTypes: ["throughput_today", "packing_accuracy_low"],
    },
    {
      id: "packing-accuracy-null",
      label: "No packing data — skip packing insight",
      overview: baseOverview({ packingAccuracy: null }),
      expectedInsightTypes: ["throughput_today"],
    },
    {
      id: "failed-deliveries",
      label: "Route failures on delivery day",
      overview: baseOverview({ failedDeliveries: 3 }),
      expectedInsightTypes: ["throughput_today", "failed_delivery_stops"],
    },
    {
      id: "inventory-shortage-open",
      label: "Open ingredient shortages",
      overview: baseOverview({ inventoryShortages: 5, imminentShortages: 0 }),
      expectedInsightTypes: ["throughput_today", "inventory_shortage"],
    },
    {
      id: "inventory-shortage-imminent",
      label: "Imminent shortages within 3 days",
      overview: baseOverview({ inventoryShortages: 8, imminentShortages: 3 }),
      expectedInsightTypes: ["throughput_today", "inventory_shortage_upcoming"],
    },
    {
      id: "purchasing-open-info",
      label: "Open POs — no stale",
      overview: baseOverview({ purchasingNeeds: 2, stalePurchaseOrders: 0 }),
      expectedInsightTypes: ["throughput_today", "purchasing_open"],
    },
    {
      id: "purchasing-open-stale",
      label: "Stale POs over 7 days",
      overview: baseOverview({ purchasingNeeds: 4, stalePurchaseOrders: 2 }),
      expectedInsightTypes: ["throughput_today", "purchasing_open"],
    },
    {
      id: "catering-followups",
      label: "Overdue catering quote follow-ups",
      overview: baseOverview({ cateringFollowUpsOverdue: 2 }),
      expectedInsightTypes: ["throughput_today", "catering_followup_overdue"],
    },
    {
      id: "meal-plan-cycles",
      label: "Missing meal plan cycles",
      overview: baseOverview({ mealPlanCyclesMissing: 1 }),
      expectedInsightTypes: ["throughput_today", "meal_plan_cycles_missing"],
    },
    {
      id: "overdue-tasks",
      label: "Kitchen tasks overdue",
      overview: baseOverview({ overdueTasks: 8 }),
      expectedInsightTypes: ["throughput_today", "overdue_tasks"],
    },
    {
      id: "overdue-tasks-below-threshold",
      label: "Few overdue tasks — no alert",
      overview: baseOverview({ overdueTasks: 3 }),
      expectedInsightTypes: ["throughput_today"],
    },
    {
      id: "low-margin-items",
      label: "Costing flags below target margin",
      overview: baseOverview({ marginAtRiskItems: 6 }),
      expectedInsightTypes: ["throughput_today", "low_margin_item"],
    },
    {
      id: "low-repeat-rate",
      label: "CRM repeat rate below 20%",
      overview: baseOverview({ repeatRate: 0.12 }),
      expectedInsightTypes: ["throughput_today", "low_repeat_rate"],
    },
    {
      id: "repeat-rate-healthy",
      label: "Healthy repeat rate — no CRM alert",
      overview: baseOverview({ repeatRate: 0.45 }),
      expectedInsightTypes: ["throughput_today"],
    },
    {
      id: "meal-prep-combo",
      label: "Meal prep operator — production + meal plans",
      overview: baseOverview({ overdueProductionItems: 3, mealPlanCyclesMissing: 2 }),
      expectedInsightTypes: [
        "throughput_today",
        "production_overdue",
        "meal_plan_cycles_missing",
      ],
    },
    {
      id: "ghost-kitchen-combo",
      label: "Ghost kitchen — integrations + packing",
      overview: baseOverview({ failedIntegrations: 1, packingAccuracy: 0.75 }),
      expectedInsightTypes: [
        "throughput_today",
        "failed_integrations",
        "packing_accuracy_low",
      ],
    },
    {
      id: "commissary-combo",
      label: "Commissary — inventory + purchasing",
      overview: baseOverview({
        inventoryShortages: 4,
        imminentShortages: 2,
        purchasingNeeds: 3,
        stalePurchaseOrders: 1,
      }),
      expectedInsightTypes: [
        "throughput_today",
        "inventory_shortage_upcoming",
        "purchasing_open",
      ],
    },
    {
      id: "catering-heavy",
      label: "Catering week — quotes + deliveries",
      overview: baseOverview({ cateringFollowUpsOverdue: 1, failedDeliveries: 1 }),
      expectedInsightTypes: [
        "throughput_today",
        "catering_followup_overdue",
        "failed_delivery_stops",
      ],
    },
    {
      id: "full-signal-day",
      label: "Multi-signal stress test",
      overview: baseOverview({
        failedIntegrations: 1,
        overdueProductionItems: 2,
        packingAccuracy: 0.88,
        failedDeliveries: 1,
        inventoryShortages: 2,
        imminentShortages: 1,
        purchasingNeeds: 1,
        stalePurchaseOrders: 0,
        cateringFollowUpsOverdue: 1,
        mealPlanCyclesMissing: 1,
        overdueTasks: 6,
        marginAtRiskItems: 2,
        repeatRate: 0.15,
      }),
      expectedInsightTypes: [
        "throughput_today",
        "failed_integrations",
        "production_overdue",
        "packing_accuracy_low",
        "failed_delivery_stops",
        "inventory_shortage_upcoming",
        "purchasing_open",
        "catering_followup_overdue",
        "meal_plan_cycles_missing",
        "overdue_tasks",
        "low_margin_item",
        "low_repeat_rate",
      ],
    },
    {
      id: "high-cancellations",
      label: "Elevated cancellations — throughput still only",
      overview: baseOverview({ orderCount: 40, cancelledOrderCount: 9 }),
      expectedInsightTypes: ["throughput_today"],
    },
  ] as const;

export function buildAiBriefingAccuracyCorpusP261(): AiBriefingAccuracyScenario[] {
  return [...AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_SCENARIOS];
}
