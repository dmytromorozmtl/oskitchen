"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { fail, ok } from "@/lib/action-result";
import { ONBOARDING_MENU_TEMPLATE_IDS } from "@/lib/onboarding/quick-start-types";
import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { safeError } from "@/lib/security";
import { applyOnboardingMenuTemplate } from "@/services/onboarding/quick-start-service";

const templateIdSchema = z.enum(ONBOARDING_MENU_TEMPLATE_IDS);

export async function applyOnboardingMenuTemplateAction(templateId: string) {
  try {
    const access = await requireMutationPermission("products.edit");
    if (!access.ok) return fail(access.error);

    const parsed = templateIdSchema.safeParse(templateId);
    if (!parsed.success) {
      return fail("Unknown menu template.");
    }

    const { userId } = await requireTenantActor();
    const result = await applyOnboardingMenuTemplate(userId, parsed.data);

    revalidatePath("/dashboard/menus");
    revalidatePath("/dashboard/products");
    revalidatePath("/dashboard/menus/templates");

    return ok({
      menuId: result.menuId,
      productCount: result.productCount,
      redirectTo: `/dashboard/products?menuId=${result.menuId}&templateApplied=1`,
    });
  } catch (e) {
    return fail(safeError(e));
  }
}
