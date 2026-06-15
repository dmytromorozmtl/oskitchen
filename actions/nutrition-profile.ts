"use server";


import { LabelDataSourceType, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { recordAuditLog } from "@/lib/audit-log";
import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import type { PermissionKey } from "@/lib/permissions/permissions";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { productByIdWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import { safeError } from "@/lib/security";

const sourceEnum = z.nativeEnum(LabelDataSourceType);

const schema = z.object({
  productId: z.string().uuid(),
  calories: z.coerce.number().int().min(0).optional(),
  protein: z.coerce.number().min(0).optional(),
  carbs: z.coerce.number().min(0).optional(),
  fat: z.coerce.number().min(0).optional(),
  fiber: z.coerce.number().min(0).optional(),
  sugar: z.coerce.number().min(0).optional(),
  sodium: z.coerce.number().min(0).optional(),
  servingSize: z.string().max(120).optional().or(z.literal("")),
  servingSizeUnit: z.string().max(32).optional().or(z.literal("")),
  totalFat: z.coerce.number().min(0).optional(),
  saturatedFat: z.coerce.number().min(0).optional(),
  transFat: z.coerce.number().min(0).optional(),
  cholesterol: z.coerce.number().min(0).optional(),
  totalCarbohydrate: z.coerce.number().min(0).optional(),
  dietaryFiber: z.coerce.number().min(0).optional(),
  totalSugars: z.coerce.number().min(0).optional(),
  addedSugars: z.coerce.number().min(0).optional(),
  vitaminDMcg: z.coerce.number().min(0).optional(),
  calciumMg: z.coerce.number().min(0).optional(),
  ironMg: z.coerce.number().min(0).optional(),
  potassiumMg: z.coerce.number().min(0).optional(),
  ingredientsText: z.string().max(8000).optional().or(z.literal("")),
  allergens: z.string().max(2000).optional().or(z.literal("")),
  reheatingInstructions: z.string().max(4000).optional().or(z.literal("")),
  sourceType: sourceEnum.optional(),
  notes: z.string().max(4000).optional().or(z.literal("")),
  supplierDocumentRef: z.string().max(512).optional().or(z.literal("")),
  labResultRef: z.string().max(512).optional().or(z.literal("")),
});

async function requireNutritionProfileMutationPermission(
  operation: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const permission: PermissionKey = "products.edit";
  const access = await requireMutationPermission(permission);
  if (!access.ok) {
    await recordAuditLog({
      userId: access.actor?.sessionUserId ?? null,
      workspaceId: access.actor?.workspaceId ?? null,
      action: "nutrition_profile.permission_denied",
      entityType: "NutritionProfile",
      metadata: { operation, requiredPermission: permission },
    });
    return { ok: false, error: access.error };
  }
  return { ok: true };
}

export async function upsertNutritionProfileAction(formData: FormData) {
  try {
    const gate = await requireNutritionProfileMutationPermission("nutrition_profile.upsert");
    if (!gate.ok) return { error: gate.error };

    const { sessionUser: user, dataUserId } = await requireTenantActor();
    const parsed = schema.safeParse({
      productId: formData.get("productId"),
      calories: formData.get("calories"),
      protein: formData.get("protein"),
      carbs: formData.get("carbs"),
      fat: formData.get("fat"),
      fiber: formData.get("fiber"),
      sugar: formData.get("sugar"),
      sodium: formData.get("sodium"),
      servingSize: formData.get("servingSize"),
      servingSizeUnit: formData.get("servingSizeUnit"),
      totalFat: formData.get("totalFat"),
      saturatedFat: formData.get("saturatedFat"),
      transFat: formData.get("transFat"),
      cholesterol: formData.get("cholesterol"),
      totalCarbohydrate: formData.get("totalCarbohydrate"),
      dietaryFiber: formData.get("dietaryFiber"),
      totalSugars: formData.get("totalSugars"),
      addedSugars: formData.get("addedSugars"),
      vitaminDMcg: formData.get("vitaminDMcg"),
      calciumMg: formData.get("calciumMg"),
      ironMg: formData.get("ironMg"),
      potassiumMg: formData.get("potassiumMg"),
      ingredientsText: formData.get("ingredientsText"),
      allergens: formData.get("allergens"),
      reheatingInstructions: formData.get("reheatingInstructions"),
      sourceType: formData.get("sourceType"),
      notes: formData.get("notes"),
      supplierDocumentRef: formData.get("supplierDocumentRef"),
      labResultRef: formData.get("labResultRef"),
    });
    if (!parsed.success) return { error: "Check nutrition fields." };

    const product = await prisma.product.findFirst({
      where: await productByIdWhereForOwner(dataUserId, parsed.data.productId),
      select: { id: true, menu: { select: { userId: true } } },
    });
    if (!product) return { error: "Product not found." };

    const d = parsed.data;
    const dec = (n?: number) =>
      n != null && !Number.isNaN(n) ? new Prisma.Decimal(n.toFixed(4)) : null;

    const tf = d.totalFat ?? d.fat;
    const tc = d.totalCarbohydrate ?? d.carbs;
    const dfib = d.dietaryFiber ?? d.fiber;
    const tsug = d.totalSugars ?? d.sugar;

    const sourceType = d.sourceType ?? LabelDataSourceType.MANUAL;

    await prisma.nutritionProfile.upsert({
      where: { productId: d.productId },
      create: {
        productId: d.productId,
        userId: product.menu.userId,
        calories: d.calories ?? null,
        protein: dec(d.protein),
        carbs: dec(d.carbs),
        fat: dec(d.fat),
        fiber: dec(d.fiber),
        sugar: dec(d.sugar),
        sodium: dec(d.sodium),
        servingSize: d.servingSize?.trim() || null,
        servingSizeUnit: d.servingSizeUnit?.trim() || null,
        totalFat: dec(tf),
        saturatedFat: dec(d.saturatedFat),
        transFat: dec(d.transFat),
        cholesterol: dec(d.cholesterol),
        totalCarbohydrate: dec(tc),
        dietaryFiber: dec(dfib),
        totalSugars: dec(tsug),
        addedSugars: dec(d.addedSugars),
        vitaminDMcg: dec(d.vitaminDMcg),
        calciumMg: dec(d.calciumMg),
        ironMg: dec(d.ironMg),
        potassiumMg: dec(d.potassiumMg),
        ingredientsText: d.ingredientsText?.trim() || null,
        allergens: d.allergens?.trim() || null,
        sourceType,
        notes: d.notes?.trim() || null,
        supplierDocumentRef: d.supplierDocumentRef?.trim() || null,
        labResultRef: d.labResultRef?.trim() || null,
        verificationStatus: "NEEDS_REVIEW",
      },
      update: {
        userId: product.menu.userId,
        calories: d.calories ?? null,
        protein: dec(d.protein),
        carbs: dec(d.carbs),
        fat: dec(d.fat),
        fiber: dec(d.fiber),
        sugar: dec(d.sugar),
        sodium: dec(d.sodium),
        servingSize: d.servingSize?.trim() || null,
        servingSizeUnit: d.servingSizeUnit?.trim() || null,
        totalFat: dec(tf),
        saturatedFat: dec(d.saturatedFat),
        transFat: dec(d.transFat),
        cholesterol: dec(d.cholesterol),
        totalCarbohydrate: dec(tc),
        dietaryFiber: dec(dfib),
        totalSugars: dec(tsug),
        addedSugars: dec(d.addedSugars),
        vitaminDMcg: dec(d.vitaminDMcg),
        calciumMg: dec(d.calciumMg),
        ironMg: dec(d.ironMg),
        potassiumMg: dec(d.potassiumMg),
        ingredientsText: d.ingredientsText?.trim() || null,
        allergens: d.allergens?.trim() || null,
        sourceType,
        notes: d.notes?.trim() || null,
        supplierDocumentRef: d.supplierDocumentRef?.trim() || null,
        labResultRef: d.labResultRef?.trim() || null,
        verificationStatus: "NEEDS_REVIEW",
        verifiedAt: null,
        verifiedById: null,
      },
    });

    if (d.reheatingInstructions?.trim()) {
      await prisma.product.update({
        where: { id: d.productId },
        data: { reheatingInstructions: d.reheatingInstructions.trim() },
      });
    }

    revalidatePath("/dashboard/nutrition-labels");
    revalidatePath(`/dashboard/nutrition-labels/items/${d.productId}`);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function upsertNutritionProfileFormAction(formData: FormData): Promise<void> {
  void (await upsertNutritionProfileAction(formData));
}
