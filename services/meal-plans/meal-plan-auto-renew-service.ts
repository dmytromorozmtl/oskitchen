import { startOfDay } from "date-fns";
import { MealPlanCycleStatus, MealPlanStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { generateDraftOrderForCycle } from "@/services/meal-plans/meal-plan-order-generator";

export type MealPlanAutoRenewSummary = {
  scanned: number;
  renewed: number;
  skipped: number;
  errors: number;
  errorDetails: { cycleId: string; error: string }[];
};

/**
 * Creates draft orders for due meal-plan cycles on AUTO generation plans.
 */
export async function runMealPlanAutoRenewForAllTenants(): Promise<MealPlanAutoRenewSummary> {
  const today = startOfDay(new Date());
  const summary: MealPlanAutoRenewSummary = {
    scanned: 0,
    renewed: 0,
    skipped: 0,
    errors: 0,
    errorDetails: [],
  };

  const cycles = await prisma.mealPlanCycle.findMany({
    where: {
      status: { in: [MealPlanCycleStatus.READY_TO_GENERATE, MealPlanCycleStatus.UPCOMING] },
      cycleStartDate: { lte: today },
      orderId: null,
      mealPlan: {
        status: MealPlanStatus.ACTIVE,
        generationMode: { in: ["AUTO_CREATE_DRAFT_ORDERS", "AUTO_CREATE_CONFIRMED_ORDERS"] },
        OR: [{ pausedUntil: null }, { pausedUntil: { lt: today } }],
      },
    },
    include: { mealPlan: { select: { userId: true } } },
    take: 200,
  });

  summary.scanned = cycles.length;

  for (const cycle of cycles) {
    const userId = cycle.mealPlan.userId;
    if (cycle.status === MealPlanCycleStatus.UPCOMING) {
      const selections = await prisma.mealPlanSelection.count({ where: { cycleId: cycle.id } });
      if (selections === 0) {
        summary.skipped += 1;
        continue;
      }
    }

    const result = await generateDraftOrderForCycle({ userId }, cycle.id, "cron:meal-plan-auto-renew");
    if (result.ok) {
      summary.renewed += 1;
    } else {
      summary.errors += 1;
      summary.errorDetails.push({ cycleId: cycle.id, error: result.error });
    }
  }

  return summary;
}
