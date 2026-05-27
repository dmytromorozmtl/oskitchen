"use server";


import { revalidatePath } from "next/cache";
import { z } from "zod";

import { recordAuditLog } from "@/lib/audit-log";
import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import type { PermissionKey } from "@/lib/permissions/permissions";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { prisma } from "@/lib/prisma";
import { safeError } from "@/lib/security";
import { appendLabelVerificationEvent } from "@/services/nutrition-labels/label-verification-log";

const statusSchema = z.enum(["NOT_STARTED", "NEEDS_REVIEW", "VERIFIED", "EXPIRED", "BLOCKED"]);

async function requireNutritionLabelVerificationPermission(
  operation: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const permission: PermissionKey = "reports.read.audit";
  const access = await requireMutationPermission(permission);
  if (!access.ok) {
    await recordAuditLog({
      userId: access.actor?.sessionUserId ?? null,
      workspaceId: access.actor?.workspaceId ?? null,
      action: "nutrition_label_verification.permission_denied",
      entityType: "NutritionLabelVerification",
      metadata: { operation, requiredPermission: permission },
    });
    return { ok: false, error: access.error };
  }
  return { ok: true };
}

export async function verifyNutritionProfileAction(formData: FormData) {
  try {
    const gate = await requireNutritionLabelVerificationPermission("nutrition_label.verify_profile");
    if (!gate.ok) return { error: gate.error };

    const { sessionUser: user, dataUserId } = await requireTenantActor();
    const productId = z.string().uuid().safeParse(formData.get("productId"));
    const note = z.string().max(2000).optional().parse(String(formData.get("note") ?? "").trim() || undefined);
    if (!productId.success) return { error: "Invalid product." };

    const profile = await prisma.nutritionProfile.findFirst({
      where: { productId: productId.data, userId: dataUserId },
    });
    if (!profile) return { error: "Nutrition profile not found." };
    if (!profile.servingSize?.trim()) return { error: "Serving size is required before verification." };

    await prisma.nutritionProfile.update({
      where: { id: profile.id },
      data: {
        verificationStatus: "VERIFIED",
        verifiedAt: new Date(),
        verifiedById: user.id,
        notes: note ?? profile.notes,
      },
    });
    await appendLabelVerificationEvent({
      userId: dataUserId,
      productId: productId.data,
      profileType: "NUTRITION",
      action: "VERIFIED",
      performedById: user.id,
      metadata: { note },
    });
    revalidatePath("/dashboard/nutrition-labels");
    revalidatePath(`/dashboard/nutrition-labels/items/${productId.data}`);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function setNutritionVerificationStatusAction(formData: FormData) {
  try {
    const gate = await requireNutritionLabelVerificationPermission("nutrition_label.set_status");
    if (!gate.ok) return { error: gate.error };

    const { sessionUser: user, dataUserId } = await requireTenantActor();
    const productId = z.string().uuid().safeParse(formData.get("productId"));
    const status = statusSchema.safeParse(formData.get("status"));
    if (!productId.success || !status.success) return { error: "Invalid input." };

    const profile = await prisma.nutritionProfile.findFirst({
      where: { productId: productId.data, userId: dataUserId },
    });
    if (!profile) return { error: "Nutrition profile not found." };

    await prisma.nutritionProfile.update({
      where: { id: profile.id },
      data: {
        verificationStatus: status.data,
        verifiedAt: status.data === "VERIFIED" ? new Date() : null,
        verifiedById: status.data === "VERIFIED" ? user.id : null,
      },
    });
    await appendLabelVerificationEvent({
      userId: dataUserId,
      productId: productId.data,
      profileType: "NUTRITION",
      action: `STATUS_${status.data}`,
      performedById: user.id,
    });
    revalidatePath("/dashboard/nutrition-labels");
    revalidatePath(`/dashboard/nutrition-labels/items/${productId.data}`);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function verifyAllergenProfileAction(formData: FormData) {
  try {
    const gate = await requireNutritionLabelVerificationPermission("nutrition_label.verify_allergen");
    if (!gate.ok) return { error: gate.error };

    const { sessionUser: user, dataUserId } = await requireTenantActor();
    const productId = z.string().uuid().safeParse(formData.get("productId"));
    if (!productId.success) return { error: "Invalid product." };

    const row = await prisma.allergenProfile.findFirst({
      where: { productId: productId.data, userId: dataUserId },
    });
    if (!row) return { error: "Allergen profile not found." };

    await prisma.allergenProfile.update({
      where: { id: row.id },
      data: { verificationStatus: "VERIFIED", verifiedAt: new Date(), verifiedById: user.id },
    });
    await appendLabelVerificationEvent({
      userId: dataUserId,
      productId: productId.data,
      profileType: "ALLERGEN",
      action: "VERIFIED",
      performedById: user.id,
    });
    revalidatePath("/dashboard/nutrition-labels");
    revalidatePath(`/dashboard/nutrition-labels/items/${productId.data}`);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function verifyIngredientDeclarationAction(formData: FormData) {
  try {
    const gate = await requireNutritionLabelVerificationPermission("nutrition_label.verify_ingredients");
    if (!gate.ok) return { error: gate.error };

    const { sessionUser: user, dataUserId } = await requireTenantActor();
    const productId = z.string().uuid().safeParse(formData.get("productId"));
    if (!productId.success) return { error: "Invalid product." };

    const row = await prisma.ingredientDeclaration.findFirst({
      where: { productId: productId.data, userId: dataUserId },
    });
    if (!row) return { error: "Ingredient declaration not found." };

    await prisma.ingredientDeclaration.update({
      where: { id: row.id },
      data: { verificationStatus: "VERIFIED", verifiedAt: new Date(), verifiedById: user.id },
    });
    await appendLabelVerificationEvent({
      userId: dataUserId,
      productId: productId.data,
      profileType: "INGREDIENTS",
      action: "VERIFIED",
      performedById: user.id,
    });
    revalidatePath("/dashboard/nutrition-labels");
    revalidatePath(`/dashboard/nutrition-labels/items/${productId.data}`);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function verifyNutritionProfileFormAction(formData: FormData): Promise<void> {
  void (await verifyNutritionProfileAction(formData));
}

export async function setNutritionVerificationStatusFormAction(formData: FormData): Promise<void> {
  void (await setNutritionVerificationStatusAction(formData));
}

export async function verifyAllergenProfileFormAction(formData: FormData): Promise<void> {
  void (await verifyAllergenProfileAction(formData));
}

export async function verifyIngredientDeclarationFormAction(formData: FormData): Promise<void> {
  void (await verifyIngredientDeclarationAction(formData));
}
