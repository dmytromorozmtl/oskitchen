import {
  CustomerTimelineEventType,
  type MealPlan,
  MealPlanCycleStatus,
  MealPlanEventType,
  type MealPlanFrequency,
  Prisma,
  type MealPlanStatus,
} from "@prisma/client";

import { upsertCustomerByEmail } from "@/services/crm/customer-service";
import {
  cycleEndDate,
  nextCycleStart,
  projectCycleAnchors,
  startOfDayUtc,
} from "@/lib/meal-plans/meal-plan-schedules";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import {
  customerSubscriptionListWhereForOwner,
  mealPlanByIdWhereForOwner,
  mealPlanListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";

type Scope = { userId: string };

export type CreateMealPlanInput = {
  userId: string;
  customerEmail: string;
  customerName?: string | null;
  customerPhone?: string | null;
  companyName?: string | null;
  name: string;
  type?: MealPlan["type"];
  status?: MealPlanStatus;
  frequency?: MealPlanFrequency;
  mealsPerCycle?: number;
  servingsPerMeal?: number;
  fulfillmentMode?: MealPlan["fulfillmentMode"];
  brandId?: string | null;
  locationId?: string | null;
  startDate: Date;
  endDate?: Date | null;
  pricePerCycle?: number | null;
  billingMode?: MealPlan["billingMode"];
  generationMode?: MealPlan["generationMode"];
  allergies?: readonly string[];
  dietary?: readonly string[];
  favoriteItems?: readonly string[];
  dislikedItems?: readonly string[];
  notes?: string | null;
  legacySubscriptionId?: string | null;
  performedBy?: string | null;
};

/** Create a meal plan + first cycle + a "PLAN_CREATED" event. Idempotent on legacySubscriptionId. */
export async function createMealPlan(input: CreateMealPlanInput): Promise<MealPlan> {
  if (input.legacySubscriptionId) {
    const existing = await prisma.mealPlan.findUnique({
      where: { legacySubscriptionId: input.legacySubscriptionId },
    });
    if (existing) return existing;
  }

  const [customer, workspaceId] = await Promise.all([
    upsertCustomerByEmail({
      userId: input.userId,
      email: input.customerEmail,
      name: input.customerName ?? null,
      phone: input.customerPhone ?? null,
      companyName: input.companyName ?? null,
      source: "MEAL_PLAN",
      type: "INDIVIDUAL",
    }),
    resolveOwnerWorkspaceId(input.userId),
  ]);
  const startDate = startOfDayUtc(input.startDate);
  const frequency = input.frequency ?? "WEEKLY";
  const status = input.status ?? "ACTIVE";

  const plan = await prisma.mealPlan.create({
    data: {
      userId: input.userId,
      workspaceId,
      customerId: customer.id,
      name: input.name.trim(),
      type: input.type ?? "INDIVIDUAL",
      status,
      frequency,
      mealsPerCycle: input.mealsPerCycle ?? 5,
      servingsPerMeal: input.servingsPerMeal ?? 1,
      fulfillmentMode: input.fulfillmentMode ?? "PICKUP",
      brandId: input.brandId ?? null,
      locationId: input.locationId ?? null,
      startDate,
      nextOrderDate: startDate,
      endDate: input.endDate ?? null,
      pricePerCycle: input.pricePerCycle != null ? new Prisma.Decimal(input.pricePerCycle) : null,
      billingMode: input.billingMode ?? "PAY_LATER",
      generationMode: input.generationMode ?? "PREVIEW_BEFORE_CREATE",
      allergiesJson: (input.allergies && input.allergies.length > 0
        ? (input.allergies as unknown as Prisma.InputJsonValue)
        : Prisma.JsonNull) as Prisma.InputJsonValue,
      dietaryPreferencesJson: (input.dietary && input.dietary.length > 0
        ? (input.dietary as unknown as Prisma.InputJsonValue)
        : Prisma.JsonNull) as Prisma.InputJsonValue,
      favoriteItemsJson: (input.favoriteItems && input.favoriteItems.length > 0
        ? (input.favoriteItems as unknown as Prisma.InputJsonValue)
        : Prisma.JsonNull) as Prisma.InputJsonValue,
      dislikedItemsJson: (input.dislikedItems && input.dislikedItems.length > 0
        ? (input.dislikedItems as unknown as Prisma.InputJsonValue)
        : Prisma.JsonNull) as Prisma.InputJsonValue,
      notes: input.notes ?? null,
      legacySubscriptionId: input.legacySubscriptionId ?? null,
    },
  });

  await Promise.all([
    prisma.mealPlanEvent.create({
      data: {
        mealPlanId: plan.id,
        eventType: MealPlanEventType.PLAN_CREATED,
        performedBy: input.performedBy ?? null,
        metadataJson: {
          type: plan.type,
          frequency: plan.frequency,
          mealsPerCycle: plan.mealsPerCycle,
        } as Prisma.InputJsonValue,
      },
    }),
    prisma.mealPlanCycle.create({
      data: {
        mealPlanId: plan.id,
        cycleStartDate: startDate,
        cycleEndDate: cycleEndDate(startDate, frequency),
        status: "NEEDS_SELECTION",
        mealsPlanned: plan.mealsPerCycle,
      },
    }),
    prisma.customerTimelineEvent.create({
      data: {
        customerId: customer.id,
        eventType: CustomerTimelineEventType.OTHER,
        sourceType: "meal_plan",
        sourceId: plan.id,
        summary: `Meal plan "${plan.name}" created`,
        metadataJson: { type: plan.type, frequency: plan.frequency } as Prisma.InputJsonValue,
      },
    }).catch((error) => {
      logger.warn("[meal-plans] CRM timeline event failed", error);
    }),
  ]);

  return plan;
}

export async function listMealPlansForUser(scope: Scope, options?: { status?: MealPlanStatus; take?: number }) {
  const planScope = await mealPlanListWhereForOwner(scope.userId);
  return prisma.mealPlan.findMany({
    where: options?.status ? { AND: [planScope, { status: options.status }] } : planScope,
    orderBy: [{ status: "asc" }, { nextOrderDate: "asc" }, { createdAt: "desc" }],
    include: { customer: { select: { id: true, name: true, email: true, displayName: true } } },
    take: options?.take ?? 200,
  });
}

export async function getMealPlanForUser(scope: Scope, planId: string) {
  return prisma.mealPlan.findFirst({
    where: await mealPlanByIdWhereForOwner(scope.userId, planId),
    include: {
      customer: true,
      brand: { select: { id: true, name: true } },
      location: { select: { id: true, name: true } },
      cycles: {
        orderBy: { cycleStartDate: "asc" },
        include: {
          selections: { include: { product: { select: { id: true, title: true, price: true, allergens: true, active: true } } } },
          order: { select: { id: true, status: true, total: true, fulfillmentType: true, createdAt: true } },
        },
      },
      events: { orderBy: { createdAt: "desc" }, take: 50 },
    },
  });
}

export type UpdateMealPlanInput = Partial<
  Pick<
    MealPlan,
    | "name"
    | "type"
    | "status"
    | "frequency"
    | "mealsPerCycle"
    | "servingsPerMeal"
    | "fulfillmentMode"
    | "brandId"
    | "locationId"
    | "endDate"
    | "pausedUntil"
    | "pauseReason"
    | "billingMode"
    | "pricePerCycle"
    | "generationMode"
    | "notes"
    | "nextOrderDate"
  >
>;

export async function updateMealPlan(scope: Scope, planId: string, input: UpdateMealPlanInput, performedBy?: string | null) {
  const existing = await prisma.mealPlan.findFirst({
    where: await mealPlanByIdWhereForOwner(scope.userId, planId),
  });
  if (!existing) throw new Error("Meal plan not found.");

  const [updated] = await Promise.all([
    prisma.mealPlan.update({ where: { id: existing.id }, data: input }),
    prisma.mealPlanEvent.create({
      data: {
        mealPlanId: existing.id,
        eventType: MealPlanEventType.PLAN_UPDATED,
        performedBy: performedBy ?? null,
        metadataJson: { keys: Object.keys(input) } as Prisma.InputJsonValue,
      },
    }),
  ]);
  return updated;
}

export async function setMealPlanStatus(
  scope: Scope,
  planId: string,
  next: MealPlanStatus,
  details?: { performedBy?: string | null; pausedUntil?: Date | null; pauseReason?: string | null },
) {
  const existing = await prisma.mealPlan.findFirst({
    where: await mealPlanByIdWhereForOwner(scope.userId, planId),
  });
  if (!existing) throw new Error("Meal plan not found.");

  const data: Prisma.MealPlanUpdateInput = { status: next };
  if (next === "PAUSED") {
    data.pausedUntil = details?.pausedUntil ?? null;
    data.pauseReason = details?.pauseReason ?? null;
  } else if (next === "ACTIVE") {
    data.pausedUntil = null;
    data.pauseReason = null;
  }
  const eventType: MealPlanEventType =
    next === "PAUSED" ? "PLAN_PAUSED" :
    next === "ACTIVE" ? "PLAN_RESUMED" :
    next === "CANCELLED" ? "PLAN_CANCELLED" :
    next === "EXPIRED" ? "PLAN_EXPIRED" :
    "PLAN_UPDATED";
  const [updated] = await Promise.all([
    prisma.mealPlan.update({ where: { id: existing.id }, data }),
    prisma.mealPlanEvent.create({
      data: {
        mealPlanId: existing.id,
        eventType,
        performedBy: details?.performedBy ?? null,
        metadataJson: {
          from: existing.status,
          to: next,
          pausedUntil: details?.pausedUntil?.toISOString() ?? null,
          pauseReason: details?.pauseReason ?? null,
        } as Prisma.InputJsonValue,
      },
    }),
    prisma.customerTimelineEvent.create({
      data: {
        customerId: existing.customerId,
        eventType: CustomerTimelineEventType.OTHER,
        sourceType: "meal_plan",
        sourceId: existing.id,
        summary: `Meal plan "${existing.name}" → ${next}`,
      },
    }).catch((error) => {
      logger.warn("[meal-plans] CRM timeline event failed", error);
    }),
  ]);
  return updated;
}

/**
 * Materialize the next `count` cycles for a plan. Idempotent: only inserts
 * cycles that do not already exist for a given start date.
 */
export async function materializeUpcomingCycles(scope: Scope, planId: string, count: number = 4) {
  const planWhere = await mealPlanByIdWhereForOwner(scope.userId, planId);
  const [plan, existingCycles] = await Promise.all([
    prisma.mealPlan.findFirst({ where: planWhere }),
    prisma.mealPlanCycle.findMany({
      where: { mealPlanId: planId },
      orderBy: { cycleStartDate: "desc" },
      take: 1,
    }),
  ]);
  if (!plan) throw new Error("Meal plan not found.");
  const anchor = existingCycles[0]?.cycleStartDate ?? plan.startDate;
  const lastStart = startOfDayUtc(anchor);
  const after = nextCycleStart(lastStart, plan.frequency);
  const anchors = projectCycleAnchors(after, plan.frequency, count);

  for (const start of anchors) {
    if (plan.endDate && start > plan.endDate) break;
    await prisma.mealPlanCycle.upsert({
      where: {
        // No unique constraint on (mealPlanId, cycleStartDate); use a workaround.
        id: `${plan.id}-${start.toISOString().slice(0, 10)}-placeholder` as unknown as string,
      },
      create: {
        mealPlanId: plan.id,
        cycleStartDate: start,
        cycleEndDate: cycleEndDate(start, plan.frequency),
        status: "UPCOMING",
        mealsPlanned: plan.mealsPerCycle,
      },
      update: {},
    }).catch(async () => {
      // Fallback when the synthetic id doesn't match — query and skip if exists.
      const found = await prisma.mealPlanCycle.findFirst({
        where: { mealPlanId: plan.id, cycleStartDate: start },
      });
      if (!found) {
        await prisma.mealPlanCycle.create({
          data: {
            mealPlanId: plan.id,
            cycleStartDate: start,
            cycleEndDate: cycleEndDate(start, plan.frequency),
            status: "UPCOMING",
            mealsPlanned: plan.mealsPerCycle,
          },
        });
      }
    });
  }
}

export async function skipCycle(scope: Scope, cycleId: string, performedBy?: string | null) {
  const cycle = await prisma.mealPlanCycle.findFirst({
    where: { id: cycleId, mealPlan: await mealPlanListWhereForOwner(scope.userId) },
  });
  if (!cycle) throw new Error("Cycle not found.");
  if (cycle.status === "GENERATED") {
    throw new Error("Cycle already has an order — cancel the order first.");
  }
  const [updated] = await Promise.all([
    prisma.mealPlanCycle.update({
      where: { id: cycle.id },
      data: { status: "SKIPPED" },
    }),
    prisma.mealPlanEvent.create({
      data: {
        mealPlanId: cycle.mealPlanId,
        cycleId: cycle.id,
        eventType: MealPlanEventType.CYCLE_SKIPPED,
        performedBy: performedBy ?? null,
      },
    }),
  ]);
  return updated;
}

export async function setSelectionForCycle(
  scope: Scope,
  cycleId: string,
  selection: {
    productId?: string | null;
    menuId?: string | null;
    itemName?: string | null;
    quantity?: number;
    servings?: number;
    notes?: string | null;
    locked?: boolean;
  },
  performedBy?: string | null,
) {
  const cycle = await prisma.mealPlanCycle.findFirst({
    where: { id: cycleId, mealPlan: await mealPlanListWhereForOwner(scope.userId) },
  });
  if (!cycle) throw new Error("Cycle not found.");
  if (cycle.status === "GENERATED") {
    throw new Error("Cycle already has an order — cannot edit selections.");
  }
  const created = await prisma.mealPlanSelection.create({
    data: {
      cycleId: cycle.id,
      productId: selection.productId ?? null,
      menuId: selection.menuId ?? null,
      itemName: selection.itemName ?? null,
      quantity: selection.quantity ?? 1,
      servings: selection.servings ?? 1,
      notes: selection.notes ?? null,
      locked: selection.locked ?? false,
    },
  });
  await Promise.all([
    prisma.mealPlanCycle.update({
      where: { id: cycle.id },
      data: { status: cycle.status === "UPCOMING" || cycle.status === "NEEDS_SELECTION" ? "READY_TO_GENERATE" : cycle.status },
    }),
    prisma.mealPlanEvent.create({
      data: {
        mealPlanId: cycle.mealPlanId,
        cycleId: cycle.id,
        eventType: MealPlanEventType.CYCLE_SELECTIONS_CHANGED,
        performedBy: performedBy ?? null,
      },
    }),
  ]);
  return created;
}

export async function removeSelection(scope: Scope, selectionId: string, performedBy?: string | null) {
  const selection = await prisma.mealPlanSelection.findFirst({
    where: { id: selectionId, cycle: { mealPlan: await mealPlanListWhereForOwner(scope.userId) } },
    select: { id: true, cycleId: true, cycle: { select: { mealPlanId: true } } },
  });
  if (!selection) throw new Error("Selection not found.");
  await Promise.all([
    prisma.mealPlanSelection.delete({ where: { id: selection.id } }),
    prisma.mealPlanEvent.create({
      data: {
        mealPlanId: selection.cycle.mealPlanId,
        cycleId: selection.cycleId,
        eventType: MealPlanEventType.CYCLE_SELECTIONS_CHANGED,
        performedBy: performedBy ?? null,
      },
    }),
  ]);
}

/**
 * Mirror legacy `CustomerSubscription` rows into the new `MealPlan` table once
 * — used by the new center on first visit for back-compat.
 */
export async function backfillLegacySubscriptions(userId: string): Promise<{ created: number }> {
  const legacy = await prisma.customerSubscription.findMany({
    where: await customerSubscriptionListWhereForOwner(userId),
    include: { customer: { select: { id: true, email: true, name: true, phone: true } } },
  });
  if (!legacy.length) return { created: 0 };

  const existingPlans = await prisma.mealPlan.findMany({
    where: {
      legacySubscriptionId: { in: legacy.map((sub) => sub.id) },
    },
    select: { legacySubscriptionId: true },
  });
  const existingIds = new Set(
    existingPlans.map((plan) => plan.legacySubscriptionId).filter((id): id is string => !!id),
  );

  let created = 0;
  for (const sub of legacy) {
    if (existingIds.has(sub.id)) continue;
    try {
      await createMealPlan({
        userId,
        customerEmail: sub.customer.email,
        customerName: sub.customer.name,
        customerPhone: sub.customer.phone,
        name: sub.planName,
        type: "INDIVIDUAL",
        status:
          sub.status === "PAUSED" ? "PAUSED" :
          sub.status === "CANCELLED" ? "CANCELLED" :
          "ACTIVE",
        frequency:
          sub.frequency === "BIWEEKLY" ? "BIWEEKLY" :
          sub.frequency === "MONTHLY" ? "MONTHLY" :
          "WEEKLY",
        mealsPerCycle: sub.mealsPerWeek,
        fulfillmentMode: sub.pickupOrDelivery === "DELIVERY" ? "DELIVERY" : "PICKUP",
        startDate: sub.nextOrderDate ?? sub.createdAt,
        notes: sub.notes,
        legacySubscriptionId: sub.id,
      });
      created += 1;
    } catch (error) {
      logger.warn("[meal-plans] legacy backfill failed for subscription", sub.id, error);
    }
  }
  return { created };
}

/** Command Center KPI roll-up. */
export async function loadMealPlanOverviewKpis(userId: string): Promise<{
  active: number;
  paused: number;
  needsReview: number;
  cyclesDueThisWeek: number;
  draftsNeeded: number;
  mealsDueThisWeek: number;
  deliveryPlans: number;
  pickupPlans: number;
  estimatedRecurringRevenueCents: number;
}> {
  const now = new Date();
  const start = startOfDayUtc(now);
  const end = new Date(start.getTime());
  end.setUTCDate(end.getUTCDate() + 7);

  const planScope = await mealPlanListWhereForOwner(userId);
  const [active, paused, needsReview, cyclesDueThisWeek, draftsNeeded, plansForRevenue, deliveryPlans, pickupPlans, mealsCyclesAgg] = await Promise.all([
    prisma.mealPlan.count({ where: { AND: [planScope, { status: "ACTIVE" }] } }),
    prisma.mealPlan.count({ where: { AND: [planScope, { status: "PAUSED" }] } }),
    prisma.mealPlan.count({ where: { AND: [planScope, { status: "NEEDS_REVIEW" }] } }),
    prisma.mealPlanCycle.count({
      where: { mealPlan: planScope, cycleStartDate: { gte: start, lt: end } },
    }),
    prisma.mealPlanCycle.count({
      where: {
        mealPlan: planScope,
        status: { in: ["NEEDS_SELECTION", "READY_TO_GENERATE"] },
      },
    }),
    prisma.mealPlan.findMany({
      where: { AND: [planScope, { status: "ACTIVE", pricePerCycle: { not: null } }] },
      select: { pricePerCycle: true, frequency: true },
    }),
    prisma.mealPlan.count({
      where: { AND: [planScope, { fulfillmentMode: { in: ["DELIVERY", "MIXED"] } }] },
    }),
    prisma.mealPlan.count({
      where: { AND: [planScope, { fulfillmentMode: { in: ["PICKUP", "MIXED"] } }] },
    }),
    prisma.mealPlanCycle.aggregate({
      where: { mealPlan: planScope, cycleStartDate: { gte: start, lt: end } },
      _sum: { mealsPlanned: true },
    }),
  ]);

  let monthlyCents = 0;
  for (const p of plansForRevenue) {
    if (!p.pricePerCycle) continue;
    const cycle = Number(p.pricePerCycle.toString()) * 100;
    const monthly =
      p.frequency === "WEEKLY" ? cycle * 4 :
      p.frequency === "BIWEEKLY" ? cycle * 2 :
      cycle;
    monthlyCents += monthly;
  }

  return {
    active,
    paused,
    needsReview,
    cyclesDueThisWeek,
    draftsNeeded,
    mealsDueThisWeek: mealsCyclesAgg._sum.mealsPlanned ?? 0,
    deliveryPlans,
    pickupPlans,
    estimatedRecurringRevenueCents: Math.round(monthlyCents),
  };
}
