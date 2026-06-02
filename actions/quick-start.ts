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
import { applyQuickStartTemplate } from "@/services/onboarding/quick-start-service";
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

const channelSchema = z.enum(["pos", "qr", "website", "delivery_apps", "all"]);

const itemSchema = z.object({
  name: z.string().trim().min(1).max(200),
  price: z.coerce.number().positive(),
  category: z.string().trim().min(1).max(64),
});

const applySchema = z.object({
  restaurantType: restaurantTypeSchema,
  channels: z.array(channelSchema).min(1),
  businessName: z.string().trim().max(200).optional(),
  items: z.array(itemSchema).min(1),
});

export async function applyQuickStartAction(input: z.infer<typeof applySchema>) {
  try {
    const access = await requireMutationPermission("workspace.settings");
    if (!access.ok) return fail(access.error);

    const { sessionUser, userId } = await requireTenantActor();
    const parsed = applySchema.safeParse(input);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid quick start configuration");
    }

    const result = await applyQuickStartTemplate(userId, sessionUser.id, {
      restaurantType: parsed.data.restaurantType as QuickStartRestaurantType,
      channels: parsed.data.channels as QuickStartChannel[],
      firstItems: parsed.data.items,
      businessName: parsed.data.businessName,
    });

    revalidatePath("/dashboard");
    revalidatePath("/onboarding");
    revalidatePath("/dashboard/quick-start");
    revalidatePath("/dashboard/products");
    revalidatePath("/dashboard/pos/terminal");

    return ok({
      nextUrl: result.nextUrl,
      menuId: result.menuId,
      productCount: result.productCount,
    });
  } catch (e) {
    return fail(safeError(e));
  }
}

export async function skipQuickStartAction() {
  return onboardingSkipToDashboard();
}
