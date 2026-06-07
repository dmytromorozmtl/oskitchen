import { addDays, startOfDay } from "date-fns";

import { buildMealPrepOsDashboard } from "@/lib/meal-prep/meal-prep-os-builders";
import type { UpcomingCycleRow, WeeklyMenuRow } from "@/lib/meal-prep/meal-prep-os-types";
import { MEAL_PREP_FORECAST_HORIZON_DAYS } from "@/lib/meal-prep/meal-prep-os-policy";
import { prisma } from "@/lib/prisma";
import { resolveMealPrepCustomerName } from "@/lib/safety/null-reference-guards";
import { resolveOwnerWorkspaceId, resolveWorkspaceOwnerUserId } from "@/lib/scope/resolve-owner-workspace-id";
import { menuListWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { loadMealPlanOverviewKpis } from "@/services/meal-plans/meal-plan-service";

export type {
  MealPrepOsDashboard,
  MealPrepOsModuleSnapshot,
} from "@/lib/meal-prep/meal-prep-os-types";

export async function loadMealPrepOsDashboard(workspaceId: string) {
  const ownerUserId = await resolveWorkspaceOwnerUserId(workspaceId);
  if (!ownerUserId) {
    throw new Error(`Workspace not found: ${workspaceId}`);
  }

  const today = startOfDay(new Date());
  const cutoffHorizon = addDays(today, 7);
  const forecastHorizon = addDays(today, MEAL_PREP_FORECAST_HORIZON_DAYS);
  const menuScope = await menuListWhereForOwner(ownerUserId);

  const [kpis, menus, storefront, cycles, forecastCycles] = await Promise.all([
    loadMealPlanOverviewKpis(ownerUserId),
    prisma.menu.findMany({
      where: {
        AND: [
          menuScope,
          { strategy: "WEEKLY_PREORDER" },
          { endDate: { gte: today } },
        ],
      },
      select: {
        id: true,
        title: true,
        startDate: true,
        endDate: true,
        preorderDeadline: true,
        published: true,
        _count: { select: { products: true } },
      },
      orderBy: { startDate: "asc" },
      take: 12,
    }),
    prisma.storefrontSettings.findFirst({
      where: { userId: ownerUserId },
      select: { orderCutoffTime: true },
    }),
    prisma.mealPlanCycle.findMany({
      where: {
        mealPlan: { userId: ownerUserId },
        status: { in: ["UPCOMING", "NEEDS_SELECTION", "READY_TO_GENERATE"] },
        cycleStartDate: { gte: today, lte: forecastHorizon },
      },
      include: {
        mealPlan: {
          select: {
            name: true,
            customer: { select: { name: true, displayName: true } },
          },
        },
        _count: { select: { selections: true } },
      },
      orderBy: { cycleStartDate: "asc" },
      take: 20,
    }),
    prisma.mealPlanCycle.findMany({
      where: {
        cycleStartDate: { gte: today, lte: forecastHorizon },
        status: { in: ["UPCOMING", "NEEDS_SELECTION", "READY_TO_GENERATE"] },
        mealPlan: { userId: ownerUserId, status: "ACTIVE" },
      },
      select: { mealsPlanned: true },
    }),
  ]);

  const weeklyMenus: WeeklyMenuRow[] = menus.map((menu) => ({
    menuId: menu.id,
    title: menu.title,
    startDateIso: menu.startDate.toISOString().slice(0, 10),
    endDateIso: menu.endDate.toISOString().slice(0, 10),
    preorderDeadlineIso: menu.preorderDeadline.toISOString().slice(0, 10),
    productCount: menu._count.products,
    published: menu.published,
  }));

  const cutoffMenusSoon = menus.filter(
    (menu) => menu.preorderDeadline >= today && menu.preorderDeadline <= cutoffHorizon,
  ).length;

  const upcomingCycles: UpcomingCycleRow[] = cycles.map((cycle) => ({
    cycleId: cycle.id,
    planName: cycle.mealPlan.name,
    customerName: resolveMealPrepCustomerName(
      cycle.mealPlan.customer.displayName,
      cycle.mealPlan.customer.name,
    ),
    cycleStartIso: cycle.cycleStartDate.toISOString().slice(0, 10),
    status: cycle.status,
    mealsPlanned: cycle.mealsPlanned,
    selectionCount: cycle._count.selections,
  }));

  const forecastCommittedMeals = forecastCycles.reduce((sum, row) => sum + row.mealsPlanned, 0);

  return buildMealPrepOsDashboard({
    workspaceId,
    kpis,
    weeklyMenus,
    cutoffMenusSoon,
    storefrontCutoff: storefront?.orderCutoffTime ?? null,
    forecastCommittedMeals,
    upcomingCycles,
  });
}

export async function loadMealPrepOsDashboardForUser(userId: string) {
  const workspaceId = await resolveOwnerWorkspaceId(userId);
  if (!workspaceId) {
    throw new Error(`No workspace for user: ${userId}`);
  }
  return loadMealPrepOsDashboard(workspaceId);
}
