import type { MEAL_PREP_OS_POLICY_ID } from "@/lib/meal-prep/meal-prep-os-policy";

export type MealPrepOsModule = "weekly_menu" | "cutoffs" | "forecasting" | "subscriptions";

export type MealPrepOsModuleStatus = "healthy" | "watch" | "critical" | "idle";

export type MealPrepOsModuleSnapshot = {
  module: MealPrepOsModule;
  label: string;
  status: MealPrepOsModuleStatus;
  headline: string;
  metrics: { label: string; value: string | number }[];
  recommendation: string;
  href: string;
};

export type WeeklyMenuRow = {
  menuId: string;
  title: string;
  startDateIso: string;
  endDateIso: string;
  preorderDeadlineIso: string;
  productCount: number;
  published: boolean;
};

export type UpcomingCycleRow = {
  cycleId: string;
  planName: string;
  customerName: string;
  cycleStartIso: string;
  status: string;
  mealsPlanned: number;
  selectionCount: number;
};

export type MealPrepOsAlert = {
  id: string;
  module: MealPrepOsModule;
  severity: "warning" | "info";
  message: string;
};

export type MealPrepOsDashboard = {
  policyId: typeof MEAL_PREP_OS_POLICY_ID;
  workspaceId: string;
  generatedAtIso: string;
  modules: MealPrepOsModuleSnapshot[];
  weeklyMenus: WeeklyMenuRow[];
  upcomingCycles: UpcomingCycleRow[];
  alerts: MealPrepOsAlert[];
  summary: {
    activePlans: number;
    cyclesDueThisWeek: number;
    mealsDueThisWeek: number;
    draftsNeeded: number;
    weeklyMenuCount: number;
    cutoffMenusSoon: number;
    forecastCommittedMeals: number;
    recurringRevenue: number;
    storefrontCutoff: string | null;
  };
  basePath: string;
};
