"use server";


import { LabelDataSourceType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { recordAuditLog } from "@/lib/audit-log";
import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import type { PermissionKey } from "@/lib/permissions/permissions";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import { productByIdWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import { safeError } from "@/lib/security";
import { appendLabelVerificationEvent } from "@/services/nutrition-labels/label-verification-log";

async function requireIngredientDeclarationMutationPermission(
  operation: string,
): Promise<{ ok: true } | { ok: false }> {
  const permission: PermissionKey = "products.edit";
  const access = await requireMutationPermission(permission);
  if (!access.ok) {
    await recordAuditLog({
      userId: access.actor?.sessionUserId ?? null,
      workspaceId: access.actor?.workspaceId ?? null,
      action: "ingredient_declaration.permission_denied",
      entityType: "IngredientDeclaration",
      metadata: { operation, requiredPermission: permission },
    });
    return { ok: false };
  }
  return { ok: true };
}

export async function upsertIngredientDeclarationFormAction(formData: FormData) {
  try {
    const gate = await requireIngredientDeclarationMutationPermission("ingredient_declaration.upsert");
    if (!gate.ok) return;

    const { sessionUser: user, dataUserId } = await requireTenantActor();
    const productId = z.string().uuid().safeParse(formData.get("productId"));
    if (!productId.success) return;

    const text = z.string().min(1).max(8000).safeParse(String(formData.get("ingredientsText") ?? "").trim());
    if (!text.success) return;

    const product = await prisma.product.findFirst({
      where: await productByIdWhereForOwner(dataUserId, productId.data),
      select: { id: true, ingredients: true, menu: { select: { userId: true } } },
    });
    if (!product) return;

    const sourceRaw = String(formData.get("sourceType") ?? "MANUAL");
    const sourceType = z.nativeEnum(LabelDataSourceType).safeParse(sourceRaw);
    const st = sourceType.success ? sourceType.data : LabelDataSourceType.MANUAL;

    const workspaceId = await resolveOwnerWorkspaceId(dataUserId);
    await prisma.ingredientDeclaration.upsert({
      where: { productId: product.id },
      create: {
        productId: product.id,
        userId: product.menu.userId,
        workspaceId,
        ingredientsText: text.data,
        sourceType: st,
        verificationStatus: "NEEDS_REVIEW",
      },
      update: {
        ingredientsText: text.data,
        sourceType: st,
        verificationStatus: "NEEDS_REVIEW",
        verifiedAt: null,
        verifiedById: null,
      },
    });

    await appendLabelVerificationEvent({
      userId: dataUserId,
      productId: product.id,
      profileType: "INGREDIENTS",
      action: "UPSERT",
      performedById: user.id,
    });

    revalidatePath("/dashboard/nutrition-labels");
    revalidatePath(`/dashboard/nutrition-labels/items/${product.id}`);
  } catch (e) {
    console.error(safeError(e));
  }
}
