"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireMealPlanMutation } from "@/lib/meal-plans/require-meal-plan-mutation";
import {
  MEAL_PLAN_BILLING_VALUES,
  MEAL_PLAN_FREQUENCY_VALUES,
  MEAL_PLAN_FULFILLMENT_VALUES,
  MEAL_PLAN_GENERATION_VALUES,
  MEAL_PLAN_TYPE_VALUES,
  isMealPlanGenerationModeAllowed,
} from "@/lib/meal-plans/meal-plan-types";
import { MEAL_PLAN_STATUS_VALUES, canTransitionMealPlan } from "@/lib/meal-plans/meal-plan-status";
import { BUILT_IN_MEAL_PLAN_TEMPLATES } from "@/lib/meal-plans/meal-plan-templates";
import { prisma } from "@/lib/prisma";
import { safeError } from "@/lib/security";
import {
  backfillLegacySubscriptions,
  createMealPlan,
  materializeUpcomingCycles,
  removeSelection,
  setMealPlanStatus,
  setSelectionForCycle,
  skipCycle,
  updateMealPlan,
} from "@/services/meal-plans/meal-plan-service";
import {
  generateDraftOrderForCycle,
} from "@/services/meal-plans/meal-plan-order-generator";
import { MealPlanCycleStatus, type MealPlanStatus, Prisma } from "@prisma/client";

const REVALIDATE_PATHS = [
  "/dashboard/meal-plans",
  "/dashboard/meal-plans/cycles",
  "/dashboard/meal-plans/templates",
  "/dashboard/meal-plans/reports",
  "/dashboard/meal-subscriptions",
];

function revalidateAll(planId?: string) {
  for (const p of REVALIDATE_PATHS) revalidatePath(p);
  if (planId) revalidatePath(`/dashboard/meal-plans/${planId}`);
}

function splitCsv(value: string | null | undefined): string[] {
  if (!value) return [];
  return value.split(/[,\n;]+/).map((s) => s.trim()).filter((s) => s.length > 0);
}

/* ============================ create ============================ */

const createSchema = z.object({
  customerEmail: z.string().email(),
  customerName: z.string().max(255).optional().or(z.literal("")),
  customerPhone: z.string().max(64).optional().or(z.literal("")),
  companyName: z.string().max(255).optional().or(z.literal("")),
  name: z.string().min(1).max(255),
  type: z.enum(MEAL_PLAN_TYPE_VALUES).optional(),
  frequency: z.enum(MEAL_PLAN_FREQUENCY_VALUES).optional(),
  mealsPerCycle: z.coerce.number().int().min(1).max(99).optional(),
  servingsPerMeal: z.coerce.number().int().min(1).max(99).optional(),
  fulfillmentMode: z.enum(MEAL_PLAN_FULFILLMENT_VALUES).optional(),
  startDate: z.string().min(8),
  endDate: z.string().optional().or(z.literal("")),
  pricePerCycle: z.coerce.number().nonnegative().optional(),
  billingMode: z.enum(MEAL_PLAN_BILLING_VALUES).optional(),
  generationMode: z.enum(MEAL_PLAN_GENERATION_VALUES).optional(),
  brandId: z.string().uuid().optional().or(z.literal("")),
  locationId: z.string().uuid().optional().or(z.literal("")),
  allergies: z.string().optional().or(z.literal("")),
  dietary: z.string().optional().or(z.literal("")),
  favorites: z.string().optional().or(z.literal("")),
  dislikes: z.string().optional().or(z.literal("")),
  notes: z.string().max(4000).optional().or(z.literal("")),
});

export async function createMealPlanAction(formData: FormData) {
  try {
    const access = await requireMealPlanMutation();
    if (!access.ok) return { error: access.error };
    const { sessionUser: user, userId } = access.actor;
    const parsed = createSchema.safeParse({
      customerEmail: formData.get("customerEmail"),
      customerName: formData.get("customerName"),
      customerPhone: formData.get("customerPhone"),
      companyName: formData.get("companyName"),
      name: formData.get("name"),
      type: formData.get("type") || undefined,
      frequency: formData.get("frequency") || undefined,
      mealsPerCycle: formData.get("mealsPerCycle") || undefined,
      servingsPerMeal: formData.get("servingsPerMeal") || undefined,
      fulfillmentMode: formData.get("fulfillmentMode") || undefined,
      startDate: formData.get("startDate"),
      endDate: formData.get("endDate"),
      pricePerCycle: formData.get("pricePerCycle") || undefined,
      billingMode: formData.get("billingMode") || undefined,
      generationMode: formData.get("generationMode") || undefined,
      brandId: formData.get("brandId"),
      locationId: formData.get("locationId"),
      allergies: formData.get("allergies"),
      dietary: formData.get("dietary"),
      favorites: formData.get("favorites"),
      dislikes: formData.get("dislikes"),
      notes: formData.get("notes"),
    });
    if (!parsed.success) {
      return { error: "Check the form fields." };
    }
    const d = parsed.data;
    if (d.generationMode && !isMealPlanGenerationModeAllowed(d.generationMode)) {
      return { error: "Auto-confirm generation is reserved for a future release." };
    }

    const plan = await createMealPlan({
      userId,
      customerEmail: d.customerEmail,
      customerName: d.customerName || null,
      customerPhone: d.customerPhone || null,
      companyName: d.companyName || null,
      name: d.name,
      type: d.type,
      frequency: d.frequency,
      mealsPerCycle: d.mealsPerCycle,
      servingsPerMeal: d.servingsPerMeal,
      fulfillmentMode: d.fulfillmentMode,
      brandId: d.brandId || null,
      locationId: d.locationId || null,
      startDate: new Date(d.startDate),
      endDate: d.endDate ? new Date(d.endDate) : null,
      pricePerCycle: d.pricePerCycle ?? null,
      billingMode: d.billingMode,
      generationMode: d.generationMode,
      allergies: splitCsv(d.allergies),
      dietary: splitCsv(d.dietary),
      favoriteItems: splitCsv(d.favorites),
      dislikedItems: splitCsv(d.dislikes),
      notes: d.notes || null,
      performedBy: user.email ?? null,
    });
    revalidateAll(plan.id);
    return { ok: true as const, planId: plan.id };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function createMealPlanFormAction(formData: FormData): Promise<void> {
  const r = await createMealPlanAction(formData);
  if ("ok" in r && r.ok && r.planId) {
    redirect(`/dashboard/meal-plans/${r.planId}`);
  }
}

/* ============================ update plan ============================ */

const updateSchema = z.object({
  planId: z.string().uuid(),
  name: z.string().min(1).max(255).optional(),
  type: z.enum(MEAL_PLAN_TYPE_VALUES).optional(),
  frequency: z.enum(MEAL_PLAN_FREQUENCY_VALUES).optional(),
  mealsPerCycle: z.coerce.number().int().min(1).max(99).optional(),
  servingsPerMeal: z.coerce.number().int().min(1).max(99).optional(),
  fulfillmentMode: z.enum(MEAL_PLAN_FULFILLMENT_VALUES).optional(),
  billingMode: z.enum(MEAL_PLAN_BILLING_VALUES).optional(),
  pricePerCycle: z.coerce.number().nonnegative().optional(),
  generationMode: z.enum(MEAL_PLAN_GENERATION_VALUES).optional(),
  endDate: z.string().optional().or(z.literal("")),
  notes: z.string().max(4000).optional().or(z.literal("")),
});

export async function updateMealPlanAction(formData: FormData) {
  try {
    const access = await requireMealPlanMutation();
    if (!access.ok) return { error: access.error };
    const { sessionUser: user, userId } = access.actor;
    const parsed = updateSchema.safeParse({
      planId: formData.get("planId"),
      name: formData.get("name") || undefined,
      type: formData.get("type") || undefined,
      frequency: formData.get("frequency") || undefined,
      mealsPerCycle: formData.get("mealsPerCycle") || undefined,
      servingsPerMeal: formData.get("servingsPerMeal") || undefined,
      fulfillmentMode: formData.get("fulfillmentMode") || undefined,
      billingMode: formData.get("billingMode") || undefined,
      pricePerCycle: formData.get("pricePerCycle") || undefined,
      generationMode: formData.get("generationMode") || undefined,
      endDate: formData.get("endDate"),
      notes: formData.get("notes"),
    });
    if (!parsed.success) return { error: "Check fields." };
    const d = parsed.data;
    if (d.generationMode && !isMealPlanGenerationModeAllowed(d.generationMode)) {
      return { error: "Auto-confirm generation is reserved for a future release." };
    }

    await updateMealPlan(
      { userId },
      d.planId,
      {
        name: d.name,
        type: d.type,
        frequency: d.frequency,
        mealsPerCycle: d.mealsPerCycle,
        servingsPerMeal: d.servingsPerMeal,
        fulfillmentMode: d.fulfillmentMode,
        billingMode: d.billingMode,
        pricePerCycle: d.pricePerCycle != null ? new Prisma.Decimal(d.pricePerCycle) : null,
        generationMode: d.generationMode,
        endDate: d.endDate ? new Date(d.endDate) : null,
        notes: d.notes ?? null,
      },
      user.email ?? null,
    );
    revalidateAll(d.planId);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function updateMealPlanFormAction(formData: FormData): Promise<void> {
  void (await updateMealPlanAction(formData));
}

/* ============================ status changes ============================ */

const statusSchema = z.object({
  planId: z.string().uuid(),
  status: z.enum(MEAL_PLAN_STATUS_VALUES),
  pausedUntil: z.string().optional().or(z.literal("")),
  pauseReason: z.string().max(2000).optional().or(z.literal("")),
});

export async function setMealPlanStatusAction(formData: FormData) {
  try {
    const access = await requireMealPlanMutation();
    if (!access.ok) return { error: access.error };
    const { sessionUser: user, userId } = access.actor;
    const parsed = statusSchema.safeParse({
      planId: formData.get("planId"),
      status: formData.get("status"),
      pausedUntil: formData.get("pausedUntil"),
      pauseReason: formData.get("pauseReason"),
    });
    if (!parsed.success) return { error: "Invalid status payload." };
    const d = parsed.data;
    const existing = await prisma.mealPlan.findFirst({ where: { id: d.planId, userId } });
    if (!existing) return { error: "Plan not found." };
    if (!canTransitionMealPlan(existing.status, d.status)) {
      return { error: `Cannot transition from ${existing.status} to ${d.status}.` };
    }
    await setMealPlanStatus({ userId }, d.planId, d.status as MealPlanStatus, {
      performedBy: user.email ?? null,
      pausedUntil: d.pausedUntil ? new Date(d.pausedUntil) : null,
      pauseReason: d.pauseReason || null,
    });
    revalidateAll(d.planId);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function setMealPlanStatusFormAction(formData: FormData): Promise<void> {
  void (await setMealPlanStatusAction(formData));
}

/* ============================ cycles ============================ */

export async function materializeCyclesAction(formData: FormData) {
  try {
    const access = await requireMealPlanMutation();
    if (!access.ok) return { error: access.error };
    const { userId } = access.actor;
    const planId = String(formData.get("planId") ?? "");
    if (!/^[0-9a-f-]{36}$/i.test(planId)) return { error: "Invalid plan id." };
    await materializeUpcomingCycles({ userId }, planId, 4);
    revalidateAll(planId);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function materializeCyclesFormAction(formData: FormData): Promise<void> {
  void (await materializeCyclesAction(formData));
}

const skipCycleSchema = z.object({ cycleId: z.string().uuid() });

export async function skipCycleAction(formData: FormData) {
  try {
    const access = await requireMealPlanMutation();
    if (!access.ok) return { error: access.error };
    const { sessionUser: user, userId } = access.actor;
    const parsed = skipCycleSchema.safeParse({ cycleId: formData.get("cycleId") });
    if (!parsed.success) return { error: "Invalid cycle id." };
    const cycle = await prisma.mealPlanCycle.findFirst({
      where: { id: parsed.data.cycleId, mealPlan: { userId } },
      select: { mealPlanId: true },
    });
    if (!cycle) return { error: "Cycle not found." };
    await skipCycle({ userId }, parsed.data.cycleId, user.email ?? null);
    revalidateAll(cycle.mealPlanId);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function skipCycleFormAction(formData: FormData): Promise<void> {
  void (await skipCycleAction(formData));
}

const selectionSchema = z.object({
  cycleId: z.string().uuid(),
  productId: z.string().uuid().optional().or(z.literal("")),
  itemName: z.string().max(255).optional().or(z.literal("")),
  quantity: z.coerce.number().int().min(1).max(999).optional(),
  servings: z.coerce.number().int().min(1).max(99).optional(),
  notes: z.string().max(2000).optional().or(z.literal("")),
  locked: z.string().optional().or(z.literal("")),
});

export async function createSelectionAction(formData: FormData) {
  try {
    const access = await requireMealPlanMutation();
    if (!access.ok) return { error: access.error };
    const { sessionUser: user, userId } = access.actor;
    const parsed = selectionSchema.safeParse({
      cycleId: formData.get("cycleId"),
      productId: formData.get("productId"),
      itemName: formData.get("itemName"),
      quantity: formData.get("quantity") || undefined,
      servings: formData.get("servings") || undefined,
      notes: formData.get("notes"),
      locked: formData.get("locked"),
    });
    if (!parsed.success) return { error: "Invalid selection." };
    const cycle = await prisma.mealPlanCycle.findFirst({
      where: { id: parsed.data.cycleId, mealPlan: { userId } },
      select: { mealPlanId: true },
    });
    if (!cycle) return { error: "Cycle not found." };
    await setSelectionForCycle(
      { userId },
      parsed.data.cycleId,
      {
        productId: parsed.data.productId || null,
        itemName: parsed.data.itemName || null,
        quantity: parsed.data.quantity ?? 1,
        servings: parsed.data.servings ?? 1,
        notes: parsed.data.notes || null,
        locked: parsed.data.locked === "on",
      },
      user.email ?? null,
    );
    revalidateAll(cycle.mealPlanId);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function createSelectionFormAction(formData: FormData): Promise<void> {
  void (await createSelectionAction(formData));
}

export async function removeSelectionAction(formData: FormData) {
  try {
    const access = await requireMealPlanMutation();
    if (!access.ok) return { error: access.error };
    const { sessionUser: user, userId } = access.actor;
    const selectionId = String(formData.get("selectionId") ?? "");
    if (!/^[0-9a-f-]{36}$/i.test(selectionId)) return { error: "Invalid selection id." };
    const sel = await prisma.mealPlanSelection.findFirst({
      where: { id: selectionId, cycle: { mealPlan: { userId } } },
      include: { cycle: { select: { mealPlanId: true } } },
    });
    if (!sel) return { error: "Selection not found." };
    await removeSelection({ userId }, selectionId, user.email ?? null);
    revalidateAll(sel.cycle.mealPlanId);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function removeSelectionFormAction(formData: FormData): Promise<void> {
  void (await removeSelectionAction(formData));
}

/* ============================ generation ============================ */

export async function generateCycleDraftAction(formData: FormData) {
  try {
    const access = await requireMealPlanMutation();
    if (!access.ok) return { error: access.error };
    const { sessionUser: user, userId } = access.actor;
    const cycleId = String(formData.get("cycleId") ?? "");
    if (!/^[0-9a-f-]{36}$/i.test(cycleId)) return { error: "Invalid cycle id." };
    const cycle = await prisma.mealPlanCycle.findFirst({
      where: { id: cycleId, mealPlan: { userId } },
      select: { mealPlanId: true, status: true, orderId: true },
    });
    if (!cycle) return { error: "Cycle not found." };
    if (cycle.orderId || cycle.status === MealPlanCycleStatus.GENERATED) {
      return { error: "Cycle already has a generated order." };
    }
    const r = await generateDraftOrderForCycle({ userId }, cycleId, user.email ?? null);
    revalidateAll(cycle.mealPlanId);
    revalidatePath("/dashboard/orders");
    revalidatePath("/dashboard/order-hub");
    revalidatePath("/dashboard/customers");
    if (!r.ok) return { error: r.error };
    return { ok: true as const, orderId: r.orderId };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function generateCycleDraftFormAction(formData: FormData): Promise<void> {
  void (await generateCycleDraftAction(formData));
}

/* ============================ backfill ============================ */

export async function backfillLegacyAction(_formData: FormData) {
  try {
    const access = await requireMealPlanMutation();
    if (!access.ok) return { error: access.error };
    const { sessionUser: user } = access.actor;
    const r = await backfillLegacySubscriptions(user.id);
    revalidateAll();
    return { ok: true as const, ...r };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function backfillLegacyFormAction(formData: FormData): Promise<void> {
  void (await backfillLegacyAction(formData));
}

/* ============================ templates ============================ */

const templateSchema = z.object({
  builtInKey: z.string().max(80).optional().or(z.literal("")),
  name: z.string().min(1).max(255),
  description: z.string().max(4000).optional().or(z.literal("")),
});

export async function createTemplateAction(formData: FormData) {
  try {
    const access = await requireMealPlanMutation();
    if (!access.ok) return { error: access.error };
    const { userId } = access.actor;
    const parsed = templateSchema.safeParse({
      builtInKey: formData.get("builtInKey"),
      name: formData.get("name"),
      description: formData.get("description"),
    });
    if (!parsed.success) return { error: "Name is required." };

    let payload = {
      mealsPerCycle: 5,
      servingsPerMeal: 1,
      frequency: "WEEKLY" as const,
      fulfillmentDefault: "PICKUP" as const,
      type: "INDIVIDUAL" as const,
      defaultItems: [] as string[],
      dietaryPreset: [] as string[],
    };
    if (parsed.data.builtInKey) {
      const built = BUILT_IN_MEAL_PLAN_TEMPLATES.find((b) => b.key === parsed.data.builtInKey);
      if (built) {
        payload = {
          mealsPerCycle: built.mealsPerCycle,
          servingsPerMeal: built.servingsPerMeal,
          frequency: built.frequency as typeof payload.frequency,
          fulfillmentDefault: built.fulfillmentDefault as typeof payload.fulfillmentDefault,
          type: built.type as typeof payload.type,
          defaultItems: [...built.defaultItems],
          dietaryPreset: [...built.dietaryPreset],
        };
      }
    }

    await prisma.mealPlanTemplate.create({
      data: {
        userId,
        name: parsed.data.name,
        description: parsed.data.description || null,
        builtInKey: parsed.data.builtInKey || null,
        mealsPerCycle: payload.mealsPerCycle,
        servingsPerMeal: payload.servingsPerMeal,
        frequency: payload.frequency,
        fulfillmentDefault: payload.fulfillmentDefault,
        type: payload.type,
        defaultItemsJson: (payload.defaultItems.length > 0 ? payload.defaultItems : Prisma.JsonNull) as Prisma.InputJsonValue,
        dietaryPresetJson: (payload.dietaryPreset.length > 0 ? payload.dietaryPreset : Prisma.JsonNull) as Prisma.InputJsonValue,
      },
    });
    revalidateAll();
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function createTemplateFormAction(formData: FormData): Promise<void> {
  void (await createTemplateAction(formData));
}
