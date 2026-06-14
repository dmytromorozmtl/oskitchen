import type { DeterministicInsightsOverviewInput } from "@/lib/ai/deterministic-insights-from-overview";

export type CopilotAccuracyScenarioP269 = {
  id: string;
  label: string;
  question: string;
  overview: DeterministicInsightsOverviewInput;
  expectedKeywords: readonly string[];
  expectedSourceType?: string;
};

const RANGE = "2026-06-14 → 2026-06-14";

function baseOverview(
  overrides: Partial<DeterministicInsightsOverviewInput> = {},
): DeterministicInsightsOverviewInput {
  return {
    rangeLabel: RANGE,
    orderCount: 42,
    cancelledOrderCount: 2,
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
    repeatRate: 0.35,
    ...overrides,
  };
}

export function buildCopilotAccuracyCorpusP269(): CopilotAccuracyScenarioP269[] {
  return [
    {
      id: "qa-01-orders-today",
      label: "How many orders today?",
      question: "How many orders did we do today?",
      overview: baseOverview(),
      expectedKeywords: ["42", "order"],
      expectedSourceType: "throughput_today",
    },
    {
      id: "qa-02-cancelled",
      label: "Cancelled order count",
      question: "How many orders were cancelled?",
      overview: baseOverview(),
      expectedKeywords: ["2", "cancelled"],
      expectedSourceType: "throughput_today",
    },
    {
      id: "qa-03-integrations-down",
      label: "Integration failures",
      question: "Any channel integrations down?",
      overview: baseOverview({ failedIntegrations: 3 }),
      expectedKeywords: ["integration", "3"],
      expectedSourceType: "failed_integrations",
    },
    {
      id: "qa-04-production-behind",
      label: "Production overdue",
      question: "Are we behind on production prep?",
      overview: baseOverview({ overdueProductionItems: 8 }),
      expectedKeywords: ["production", "8"],
      expectedSourceType: "production_overdue",
    },
    {
      id: "qa-05-packing-accuracy",
      label: "Packing accuracy",
      question: "What is our packing accuracy?",
      overview: baseOverview({ packingAccuracy: 0.82 }),
      expectedKeywords: ["pack", "82"],
      expectedSourceType: "packing_accuracy_low",
    },
    {
      id: "qa-06-failed-deliveries",
      label: "Failed deliveries",
      question: "Any failed delivery stops today?",
      overview: baseOverview({ failedDeliveries: 4 }),
      expectedKeywords: ["deliver", "4"],
      expectedSourceType: "failed_delivery_stops",
    },
    {
      id: "qa-07-inventory-shortage",
      label: "Inventory shortages",
      question: "Do we have inventory shortages?",
      overview: baseOverview({ inventoryShortages: 5 }),
      expectedKeywords: ["ingredient", "5"],
      expectedSourceType: "inventory_shortage",
    },
    {
      id: "qa-08-imminent-shortage",
      label: "Imminent shortages",
      question: "Any stock running out soon?",
      overview: baseOverview({ imminentShortages: 6, inventoryShortages: 2 }),
      expectedKeywords: ["ingredient", "6"],
      expectedSourceType: "inventory_shortage_upcoming",
    },
    {
      id: "qa-09-purchasing-open",
      label: "Open purchasing needs",
      question: "What purchasing orders are open?",
      overview: baseOverview({ purchasingNeeds: 7 }),
      expectedKeywords: ["purchas", "7"],
      expectedSourceType: "purchasing_open",
    },
    {
      id: "qa-10-catering-followup",
      label: "Catering follow-ups",
      question: "Any overdue catering quotes to follow up?",
      overview: baseOverview({ cateringFollowUpsOverdue: 2 }),
      expectedKeywords: ["catering", "2"],
      expectedSourceType: "catering_followup_overdue",
    },
    {
      id: "qa-11-meal-plan-cycles",
      label: "Meal plan cycles missing",
      question: "Are meal plan cycles missing?",
      overview: baseOverview({ mealPlanCyclesMissing: 3 }),
      expectedKeywords: ["meal plan", "3"],
      expectedSourceType: "meal_plan_cycles_missing",
    },
    {
      id: "qa-12-overdue-tasks",
      label: "Overdue kitchen tasks",
      question: "How many overdue tasks do we have?",
      overview: baseOverview({ overdueTasks: 9 }),
      expectedKeywords: ["task", "9"],
      expectedSourceType: "overdue_tasks",
    },
    {
      id: "qa-13-low-margin",
      label: "Low margin items",
      question: "Which items are below margin target?",
      overview: baseOverview({ marginAtRiskItems: 4 }),
      expectedKeywords: ["margin", "4"],
      expectedSourceType: "low_margin_item",
    },
    {
      id: "qa-14-repeat-rate",
      label: "Repeat customer rate",
      question: "How is our repeat customer rate?",
      overview: baseOverview({ repeatRate: 0.15 }),
      expectedKeywords: ["repeat", "15"],
      expectedSourceType: "low_repeat_rate",
    },
    {
      id: "qa-15-rush-throughput",
      label: "Friday rush throughput",
      question: "How was lunch rush throughput?",
      overview: baseOverview({ orderCount: 88 }),
      expectedKeywords: ["88", "order"],
      expectedSourceType: "throughput_today",
    },
    {
      id: "qa-16-shopify-sync",
      label: "Shopify channel sync",
      question: "Is Shopify channel sync healthy?",
      overview: baseOverview({ failedIntegrations: 1 }),
      expectedKeywords: ["integration"],
      expectedSourceType: "failed_integrations",
    },
    {
      id: "qa-17-prep-board",
      label: "Prep board status",
      question: "What's the prep board status?",
      overview: baseOverview({ overdueProductionItems: 12 }),
      expectedKeywords: ["production", "12"],
      expectedSourceType: "production_overdue",
    },
    {
      id: "qa-18-driver-routes",
      label: "Driver route failures",
      question: "Any driver route issues?",
      overview: baseOverview({ failedDeliveries: 2 }),
      expectedKeywords: ["deliver", "2"],
      expectedSourceType: "failed_delivery_stops",
    },
    {
      id: "qa-19-vendor-pos",
      label: "Vendor PO status",
      question: "Do we need to place vendor POs?",
      overview: baseOverview({ purchasingNeeds: 11 }),
      expectedKeywords: ["purchas", "11"],
      expectedSourceType: "purchasing_open",
    },
    {
      id: "qa-20-food-cost",
      label: "Food cost margin risk",
      question: "Any food cost margin risks?",
      overview: baseOverview({ marginAtRiskItems: 6 }),
      expectedKeywords: ["margin", "6"],
      expectedSourceType: "low_margin_item",
    },
    {
      id: "qa-21-quiet-day",
      label: "Quiet day zero orders",
      question: "How many orders today?",
      overview: baseOverview({ orderCount: 0, cancelledOrderCount: 0 }),
      expectedKeywords: ["0", "order"],
      expectedSourceType: "throughput_today",
    },
    {
      id: "qa-22-multi-signal",
      label: "Integrations + production",
      question: "Channel sync and production status?",
      overview: baseOverview({ failedIntegrations: 2, overdueProductionItems: 5 }),
      expectedKeywords: ["integration", "2"],
      expectedSourceType: "failed_integrations",
    },
    {
      id: "qa-23-crm-retention",
      label: "CRM retention question",
      question: "Should we worry about customer retention?",
      overview: baseOverview({ repeatRate: 0.12 }),
      expectedKeywords: ["repeat", "12"],
      expectedSourceType: "low_repeat_rate",
    },
    {
      id: "qa-24-unknown-topic",
      label: "Unknown topic falls back safely",
      question: "What is the weather forecast for Paris?",
      overview: baseOverview(),
      expectedKeywords: ["workspace signals", "42"],
    },
    {
      id: "qa-25-packing-check",
      label: "Packing line check",
      question: "How is packing going?",
      overview: baseOverview({ packingAccuracy: 0.78 }),
      expectedKeywords: ["pack", "78"],
      expectedSourceType: "packing_accuracy_low",
    },
  ];
}
