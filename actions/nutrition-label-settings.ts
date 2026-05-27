"use server";


import { revalidatePath } from "next/cache";
import { z } from "zod";

import { recordAuditLog } from "@/lib/audit-log";
import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import type { PermissionKey } from "@/lib/permissions/permissions";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { prisma } from "@/lib/prisma";
import { safeError } from "@/lib/security";

async function requireNutritionLabelSettingsPermission(
  operation: string,
  permission: PermissionKey,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const access = await requireMutationPermission(permission);
  if (!access.ok) {
    await recordAuditLog({
      userId: access.actor?.sessionUserId ?? null,
      workspaceId: access.actor?.workspaceId ?? null,
      action: "nutrition_label_settings.permission_denied",
      entityType: "NutritionLabelSettings",
      metadata: { operation, requiredPermission: permission },
    });
    return { ok: false, error: access.error };
  }
  return { ok: true };
}

export async function updateNutritionPackingGatesAction(formData: FormData) {
  try {
    const gate = await requireNutritionLabelSettingsPermission(
      "nutrition_label_settings.update_packing_gates",
      "workspace.settings",
    );
    if (!gate.ok) return { error: gate.error };

    const { dataUserId } = await requireTenantActor();
    const blockAllergen = z.enum(["on", "off"]).safeParse(formData.get("blockAllergen"));
    const blockNutrition = z.enum(["on", "off"]).safeParse(formData.get("blockNutrition"));
    if (!blockAllergen.success || !blockNutrition.success) return { error: "Invalid form." };

    await prisma.kitchenSettings.update({
      where: { userId: dataUserId },
      data: {
        blockPackingWithoutVerifiedAllergen: blockAllergen.data === "on",
        blockPackingWithoutVerifiedNutrition: blockNutrition.data === "on",
      },
    });
    revalidatePath("/dashboard/nutrition-labels");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function updateStorefrontLabelVisibilityAction(formData: FormData) {
  try {
    const gate = await requireNutritionLabelSettingsPermission(
      "nutrition_label_settings.update_storefront_visibility",
      "storefront.manage",
    );
    if (!gate.ok) return { error: gate.error };

    const { dataUserId } = await requireTenantActor();
    const sf = await prisma.storefrontSettings.findFirst({
      where: { userId: dataUserId },
      orderBy: { updatedAt: "desc" },
      select: { id: true },
    });
    if (!sf) return { error: "No storefront found for this workspace." };

    const n = z.enum(["on", "off"]).safeParse(formData.get("publicNutrition"));
    const a = z.enum(["on", "off"]).safeParse(formData.get("publicAllergens"));
    const i = z.enum(["on", "off"]).safeParse(formData.get("publicIngredients"));
    if (!n.success || !a.success || !i.success) return { error: "Invalid form." };

    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: {
        publicShowNutritionWhenUnverified: n.data === "on",
        publicShowAllergensWhenUnverified: a.data === "on",
        publicShowIngredientsWhenUnverified: i.data === "on",
      },
    });
    revalidatePath("/dashboard/nutrition-labels");
    revalidatePath("/dashboard/storefront");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function updateNutritionPackingGatesFormAction(formData: FormData): Promise<void> {
  void (await updateNutritionPackingGatesAction(formData));
}

export async function updateStorefrontLabelVisibilityFormAction(formData: FormData): Promise<void> {
  void (await updateStorefrontLabelVisibilityAction(formData));
}
