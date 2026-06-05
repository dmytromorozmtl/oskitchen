"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { fail, ok } from "@/lib/action-result";
import type {
  QuickStartChannel,
  QuickStartRestaurantType,
} from "@/lib/onboarding/quick-start-types";
import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { safeError } from "@/lib/security";
import {
  applyQuickStartTemplate,
  completeQuickStartOnboarding,
} from "@/services/onboarding/quick-start-service";
import { onboardingSkipToDashboard } from "@/actions/onboarding";

const restaurantTypeSchema = z.enum([
  "full_service",
  "qsr",
  "bakery",
  "bar",
  "ghost_kitchen",
  "catering",
  "food_truck",
]);

const itemSchema = z.object({
  name: z.string().trim().min(1).max(200),
  price: z.coerce.number().positive(),
  category: z.string().trim().min(1).max(64),
});

const applySchema = z.object({
  restaurantType: restaurantTypeSchema,
  businessName: z.string().trim().min(1).max(200),
  items: z.array(itemSchema).default([]),
});

const finishSchema = z.object({
  restaurantType: restaurantTypeSchema,
  businessName: z.string().trim().min(1).max(200),
});

const DEFAULT_CHANNELS: QuickStartChannel[] = ["pos"];

export async function applyQuickStartAction(input: z.infer<typeof applySchema>) {
  try {
    const access = await requireMutationPermission("workspace.settings");
    if (!access.ok) return fail(access.error);

    const { sessionUser, userId } = await requireTenantActor();
    const parsed = applySchema.safeParse(input);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid quick start configuration");
    }

    const result = await applyQuickStartTemplate(
      userId,
      sessionUser.id,
      {
        restaurantType: parsed.data.restaurantType as QuickStartRestaurantType,
        channels: DEFAULT_CHANNELS,
        firstItems: parsed.data.items,
        businessName: parsed.data.businessName,
      },
      { deferCompletion: true },
    );

    revalidatePath("/dashboard");
    revalidatePath("/onboarding");
    revalidatePath("/dashboard/quick-start");
    revalidatePath("/dashboard/products");
    revalidatePath("/dashboard/pos/terminal");

    return ok({
      menuId: result.menuId,
      productCount: result.productCount,
      phase: "order" as const,
    });
  } catch (e) {
    return fail(safeError(e));
  }
}

export async function finishQuickStartAction(input: z.infer<typeof finishSchema>) {
  try {
    const access = await requireMutationPermission("workspace.settings");
    if (!access.ok) return fail(access.error);

    const { sessionUser, userId } = await requireTenantActor();
    const parsed = finishSchema.safeParse(input);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid quick start finish payload");
    }

    await completeQuickStartOnboarding(userId, sessionUser.id, {
      restaurantType: parsed.data.restaurantType as QuickStartRestaurantType,
      channels: DEFAULT_CHANNELS,
      firstItems: [],
      businessName: parsed.data.businessName,
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/quick-start");
    revalidatePath("/dashboard/today");

    return ok({
      redirectTo: "/dashboard/pos/terminal?welcome=true",
    });
  } catch (e) {
    return fail(safeError(e));
  }
}

export async function skipQuickStartAction() {
  return onboardingSkipToDashboard();
}
