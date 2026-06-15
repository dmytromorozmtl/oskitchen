import {
  MEAL_PREP_OS_PATH,
  MEAL_PREP_OS_POLICY_ID,
} from "@/lib/meal-prep/meal-prep-os-policy";
import type {
  MealPrepOsAlert,
  MealPrepOsDashboard,
  MealPrepOsModuleSnapshot,
  MealPrepOsModuleStatus,
  UpcomingCycleRow,
  WeeklyMenuRow,
} from "@/lib/meal-prep/meal-prep-os-types";

export type MealPrepOsRawInput = {
  workspaceId: string;
  kpis: {
    active: number;
    paused: number;
    needsReview: number;
    cyclesDueThisWeek: number;
    draftsNeeded: number;
    mealsDueThisWeek: number;
    estimatedRecurringRevenueCents: number;
  };
  weeklyMenus: WeeklyMenuRow[];
  cutoffMenusSoon: number;
  storefrontCutoff: string | null;
  forecastCommittedMeals: number;
  upcomingCycles: UpcomingCycleRow[];
  analyzedAt?: Date;
};

function moduleStatus(score: number): MealPrepOsModuleStatus {
  if (score >= 2) return "critical";
  if (score >= 1) return "watch";
  if (score <= -1) return "idle";
  return "healthy";
}

export function buildWeeklyMenuModule(menus: WeeklyMenuRow[]): MealPrepOsModuleSnapshot {
  const published = menus.filter((row) => row.published).length;
  const score = menus.length === 0 ? -1 : published === 0 ? 1 : 0;

  return {
    module: "weekly_menu",
    label: "Weekly menu",
    status: moduleStatus(score),
    headline:
      menus.length > 0
        ? `${menus.length} weekly menu${menus.length === 1 ? "" : "s"} in rotation`
        : "No weekly preorder menus configured",
    metrics: [
      { label: "Menus", value: menus.length },
      { label: "Published", value: published },
      { label: "Items", value: menus.reduce((sum, row) => sum + row.productCount, 0) },
    ],
    recommendation:
      menus.length === 0
        ? "Create a WEEKLY_PREORDER menu with start/end dates and preorder deadline."
        : published === 0
          ? "Publish the active weekly menu before opening storefront preorders."
          : "Review next week's menu swap before the preorder window closes.",
    href: "/dashboard/menus",
  };
}

export function buildCutoffsModule(input: {
  cutoffMenusSoon: number;
  storefrontCutoff: string | null;
  draftsNeeded: number;
}): MealPrepOsModuleSnapshot {
  const score =
    input.draftsNeeded >= 5 ? 2 : input.cutoffMenusSoon > 0 || input.draftsNeeded > 0 ? 1 : input.cutoffMenusSoon === 0 && !input.storefrontCutoff ? -1 : 0;

  return {
    module: "cutoffs",
    label: "Cutoffs",
    status: moduleStatus(score),
    headline:
      input.cutoffMenusSoon > 0
        ? `${input.cutoffMenusSoon} menu deadline${input.cutoffMenusSoon === 1 ? "" : "s"} within 7 days`
        : input.storefrontCutoff
          ? `Storefront cutoff ${input.storefrontCutoff}`
          : "No cutoff deadlines this week",
    metrics: [
      { label: "Menu deadlines", value: input.cutoffMenusSoon },
      { label: "Selections due", value: input.draftsNeeded },
      { label: "Store cutoff", value: input.storefrontCutoff ?? "—" },
    ],
    recommendation:
      input.draftsNeeded > 0
        ? `${input.draftsNeeded} cycle${input.draftsNeeded === 1 ? "" : "s"} need customer selections before generation.`
        : input.cutoffMenusSoon > 0
          ? "Close preorders on time — freeze menu for production batching."
          : "Set storefront orderCutoffTime to block late same-day orders.",
    href: "/dashboard/meal-plans/cycles",
  };
}

export function buildForecastingModule(input: {
  forecastCommittedMeals: number;
  mealsDueThisWeek: number;
  cyclesDueThisWeek: number;
}): MealPrepOsModuleSnapshot {
  const score =
    input.mealsDueThisWeek >= 100
      ? 1
      : input.forecastCommittedMeals === 0 && input.cyclesDueThisWeek > 0
        ? 1
        : input.forecastCommittedMeals === 0
          ? -1
          : input.forecastCommittedMeals > input.mealsDueThisWeek && input.cyclesDueThisWeek >= 3
            ? 1
            : 0;

  return {
    module: "forecasting",
    label: "Forecasting",
    status: moduleStatus(score),
    headline:
      input.forecastCommittedMeals > 0
        ? `${input.forecastCommittedMeals} committed meal${input.forecastCommittedMeals === 1 ? "" : "s"} in forecast window`
        : "No committed meal-plan demand in forecast",
    metrics: [
      { label: "Committed", value: input.forecastCommittedMeals },
      { label: "Meals this week", value: input.mealsDueThisWeek },
      { label: "Cycles", value: input.cyclesDueThisWeek },
    ],
    recommendation:
      input.forecastCommittedMeals === 0 && input.cyclesDueThisWeek > 0
        ? "Collect cycle selections to feed ingredient demand forecast."
        : input.forecastCommittedMeals > 0
          ? "Align purchasing and prep batches with committed meal-plan volume."
          : "Activate meal plans or open weekly preorders to build forecast signal.",
    href: "/dashboard/forecast",
  };
}

export function buildSubscriptionsModule(kpis: MealPrepOsRawInput["kpis"]): MealPrepOsModuleSnapshot {
  const score =
    kpis.needsReview > 0 ? 1 : kpis.active === 0 ? -1 : kpis.paused >= kpis.active ? 1 : 0;

  return {
    module: "subscriptions",
    label: "Subscriptions",
    status: moduleStatus(score),
    headline:
      kpis.active > 0
        ? `${kpis.active} active meal plan${kpis.active === 1 ? "" : "s"}`
        : "No active meal subscriptions",
    metrics: [
      { label: "Active", value: kpis.active },
      { label: "Paused", value: kpis.paused },
      { label: "Needs review", value: kpis.needsReview },
    ],
    recommendation:
      kpis.active === 0
        ? "Create weekly meal plans for subscription customers."
        : kpis.needsReview > 0
          ? "Review paused or flagged plans before the next cycle generates."
          : `${kpis.cyclesDueThisWeek} cycle${kpis.cyclesDueThisWeek === 1 ? "" : "s"} due this week — confirm auto-renew.`,
    href: "/dashboard/meal-plans",
  };
}

export function buildMealPrepOsAlerts(modules: MealPrepOsModuleSnapshot[]): MealPrepOsAlert[] {
  return modules
    .filter((row) => row.status === "critical" || row.status === "watch" || row.status === "idle")
    .map((row) => ({
      id: `${row.module}-${row.status}`,
      module: row.module,
      severity: row.status === "critical" ? "warning" : "info",
      message: `${row.label}: ${row.recommendation}`,
    }));
}

export function buildMealPrepOsDashboard(input: MealPrepOsRawInput): MealPrepOsDashboard {
  const analyzedAt = input.analyzedAt ?? new Date();
  const modules = [
    buildWeeklyMenuModule(input.weeklyMenus),
    buildCutoffsModule({
      cutoffMenusSoon: input.cutoffMenusSoon,
      storefrontCutoff: input.storefrontCutoff,
      draftsNeeded: input.kpis.draftsNeeded,
    }),
    buildForecastingModule({
      forecastCommittedMeals: input.forecastCommittedMeals,
      mealsDueThisWeek: input.kpis.mealsDueThisWeek,
      cyclesDueThisWeek: input.kpis.cyclesDueThisWeek,
    }),
    buildSubscriptionsModule(input.kpis),
  ];

  return {
    policyId: MEAL_PREP_OS_POLICY_ID,
    workspaceId: input.workspaceId,
    generatedAtIso: analyzedAt.toISOString(),
    modules,
    weeklyMenus: input.weeklyMenus.slice(0, 6),
    upcomingCycles: input.upcomingCycles.slice(0, 8),
    alerts: buildMealPrepOsAlerts(modules),
    summary: {
      activePlans: input.kpis.active,
      cyclesDueThisWeek: input.kpis.cyclesDueThisWeek,
      mealsDueThisWeek: input.kpis.mealsDueThisWeek,
      draftsNeeded: input.kpis.draftsNeeded,
      weeklyMenuCount: input.weeklyMenus.length,
      cutoffMenusSoon: input.cutoffMenusSoon,
      forecastCommittedMeals: input.forecastCommittedMeals,
      recurringRevenue: input.kpis.estimatedRecurringRevenueCents / 100,
      storefrontCutoff: input.storefrontCutoff,
    },
    basePath: MEAL_PREP_OS_PATH,
  };
}
