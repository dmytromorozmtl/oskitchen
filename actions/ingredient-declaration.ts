"use server";


import { fail, ok } from "@/lib/action-result";
import { LabelDataSourceType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import { productByIdWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import { safeError } from "@/lib/security";
import { appendLabelVerificationEvent } from "@/services/nutrition-labels/label-verification-log";

export async function upsertIngredientDeclarationFormAction(formData: FormData) {
  try {
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
