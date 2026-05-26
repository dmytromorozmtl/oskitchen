"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { safeError } from "@/lib/security";
import { createMealPlan } from "@/services/meal-plans/meal-plan-service";
import {
  CustomerSubscriptionFrequency,
  CustomerSubscriptionStatus,
  FulfillmentType,
} from "@prisma/client";

const schema = z.object({
  customerEmail: z.string().email(),
  customerName: z.string().max(255).optional().or(z.literal("")),
  planName: z.string().min(1).max(255),
  frequency: z.nativeEnum(CustomerSubscriptionFrequency),
  mealsPerWeek: z.coerce.number().int().min(1).max(42),
  pickupOrDelivery: z.nativeEnum(FulfillmentType),
  nextOrderDate: z.string().optional(),
  notes: z.string().max(4000).optional().or(z.literal("")),
});

export async function createCustomerSubscriptionAction(formData: FormData) {
  try {
    const { sessionUser: user, dataUserId } = await requireTenantActor();
    const parsed = schema.safeParse({
      customerEmail: formData.get("customerEmail"),
      customerName: formData.get("customerName"),
      planName: formData.get("planName"),
      frequency: formData.get("frequency"),
      mealsPerWeek: formData.get("mealsPerWeek"),
      pickupOrDelivery: formData.get("pickupOrDelivery"),
      nextOrderDate: formData.get("nextOrderDate"),
      notes: formData.get("notes"),
    });
    if (!parsed.success) return { error: "Check subscription fields." };
    const d = parsed.data;

    const customer = await prisma.kitchenCustomer.upsert({
      where: {
        userId_email: {
          userId: dataUserId,
          email: d.customerEmail.trim().toLowerCase(),
        },
      },
      create: {
        userId: dataUserId,
        email: d.customerEmail.trim().toLowerCase(),
        name: d.customerName?.trim() || null,
      },
      update: {
        name: d.customerName?.trim() || undefined,
      },
    });

    const nextOrderDate =
      d.nextOrderDate && d.nextOrderDate.length >= 8
        ? new Date(d.nextOrderDate)
        : null;

    const subscription = await prisma.customerSubscription.create({
      data: {
        userId: dataUserId,
        customerId: customer.id,
        planName: d.planName.trim(),
        frequency: d.frequency,
        mealsPerWeek: d.mealsPerWeek,
        pickupOrDelivery: d.pickupOrDelivery,
        status: CustomerSubscriptionStatus.ACTIVE,
        nextOrderDate,
        notes: d.notes?.trim() || null,
      },
    });

    // Mirror into the new MealPlan center so the upgraded UI reflects this row.
    try {
      await createMealPlan({
        userId: dataUserId,
        customerEmail: d.customerEmail,
        customerName: d.customerName || null,
        name: d.planName.trim(),
        type: "INDIVIDUAL",
        frequency:
          d.frequency === "BIWEEKLY" ? "BIWEEKLY" :
          d.frequency === "MONTHLY" ? "MONTHLY" :
          "WEEKLY",
        mealsPerCycle: d.mealsPerWeek,
        fulfillmentMode: d.pickupOrDelivery === "DELIVERY" ? "DELIVERY" : "PICKUP",
        startDate: nextOrderDate ?? new Date(),
        notes: d.notes?.trim() || null,
        legacySubscriptionId: subscription.id,
        performedBy: user.email ?? null,
      });
    } catch (error) {
      logger.warn("[meal-plans] mirror create failed", error);
    }

    revalidatePath("/dashboard/meal-subscriptions");
    revalidatePath("/dashboard/meal-plans");
    revalidatePath("/dashboard/calendar");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function setSubscriptionStatusAction(formData: FormData) {
  try {
    const { sessionUser: user, dataUserId } = await requireTenantActor();
    const id = String(formData.get("id") ?? "");
    if (!/^[0-9a-f-]{36}$/i.test(id)) return { error: "Invalid subscription." };
    const status = String(formData.get("status") ?? "");
    if (!["ACTIVE", "PAUSED", "CANCELLED"].includes(status)) {
      return { error: "Invalid status." };
    }
    await prisma.customerSubscription.updateMany({
      where: { id, userId: dataUserId },
      data: {
        status: status as CustomerSubscriptionStatus,
      },
    });
    revalidatePath("/dashboard/meal-subscriptions");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function createCustomerSubscriptionFormAction(formData: FormData): Promise<void> {
  void (await createCustomerSubscriptionAction(formData));
}

export async function setSubscriptionStatusFormAction(formData: FormData): Promise<void> {
  void (await setSubscriptionStatusAction(formData));
}
