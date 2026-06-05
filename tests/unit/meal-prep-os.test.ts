import { describe, expect, it } from "vitest";

import {
  buildCutoffsModule,
  buildForecastingModule,
  buildMealPrepOsDashboard,
  buildWeeklyMenuModule,
} from "@/lib/meal-prep/meal-prep-os-builders";
import {
  MEAL_PREP_OS_PATH,
  MEAL_PREP_OS_POLICY_ID,
  MEAL_PREP_OS_SERVICE,
} from "@/lib/meal-prep/meal-prep-os-policy";

describe("Meal Prep OS", () => {
  it("locks policy constants", () => {
    expect(MEAL_PREP_OS_POLICY_ID).toBe("meal-prep-os-v1");
    expect(MEAL_PREP_OS_SERVICE).toBe("services/meal-prep/meal-prep-os-service.ts");
    expect(MEAL_PREP_OS_PATH).toBe("/dashboard/meal-prep");
  });

  const weeklyMenus = [
    {
      menuId: "m1",
      title: "Week 23 Menu",
      startDateIso: "2026-06-02",
      endDateIso: "2026-06-08",
      preorderDeadlineIso: "2026-06-01",
      productCount: 12,
      published: true,
    },
  ];

  const kpis = {
    active: 18,
    paused: 2,
    needsReview: 1,
    cyclesDueThisWeek: 6,
    draftsNeeded: 3,
    mealsDueThisWeek: 84,
    estimatedRecurringRevenueCents: 420000,
  };

  it("builds weekly menu module", () => {
    const mod = buildWeeklyMenuModule(weeklyMenus);
    expect(mod.module).toBe("weekly_menu");
    expect(mod.status).toBe("healthy");
  });

  it("flags cutoffs when selections due", () => {
    const mod = buildCutoffsModule({
      cutoffMenusSoon: 1,
      storefrontCutoff: "18:00",
      draftsNeeded: 5,
    });
    expect(mod.status).toBe("critical");
  });

  it("builds forecasting module with committed meals", () => {
    const mod = buildForecastingModule({
      forecastCommittedMeals: 120,
      mealsDueThisWeek: 84,
      cyclesDueThisWeek: 6,
    });
    expect(mod.status).toBe("watch");
  });

  it("assembles dashboard with four modules", () => {
    const dashboard = buildMealPrepOsDashboard({
      workspaceId: "ws-1",
      kpis,
      weeklyMenus,
      cutoffMenusSoon: 1,
      storefrontCutoff: "17:30",
      forecastCommittedMeals: 96,
      upcomingCycles: [
        {
          cycleId: "c1",
          planName: "Family 5-pack",
          customerName: "Jordan Lee",
          cycleStartIso: "2026-06-09",
          status: "NEEDS_SELECTION",
          mealsPlanned: 5,
          selectionCount: 2,
        },
      ],
    });
    expect(dashboard.policyId).toBe(MEAL_PREP_OS_POLICY_ID);
    expect(dashboard.modules).toHaveLength(4);
    expect(dashboard.summary.recurringRevenue).toBe(4200);
    expect(dashboard.basePath).toBe(MEAL_PREP_OS_PATH);
  });
});
