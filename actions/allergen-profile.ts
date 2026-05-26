"use server";


import { fail, ok } from "@/lib/action-result";
import { LabelDataSourceType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { parseAllergenListCsv } from "@/lib/nutrition/allergen-registry";
import { productByIdWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import { safeError } from "@/lib/security";
import { appendLabelVerificationEvent } from "@/services/nutrition-labels/label-verification-log";

function toJsonArray(csv: string): string[] {
  return parseAllergenListCsv(csv);
}

export async function upsertAllergenProfileFormAction(formData: FormData) {
  try {
    const { sessionUser: user, dataUserId } = await requireTenantActor();
    const productId = z.string().uuid().safeParse(formData.get("productId"));
    if (!productId.success) return;

    const product = await prisma.product.findFirst({
      where: await productByIdWhereForOwner(dataUserId, productId.data),
      select: { id: true, allergens: true, menu: { select: { userId: true } } },
    });
    if (!product) return;

    const contains = toJsonArray(String(formData.get("containsCsv") ?? ""));
    const mayContain = toJsonArray(String(formData.get("mayContainCsv") ?? ""));
    const freeFrom = toJsonArray(String(formData.get("freeFromCsv") ?? ""));
    const notes = z.string().max(4000).optional().parse(String(formData.get("notes") ?? "").trim() || undefined);
    const sourceRaw = String(formData.get("sourceType") ?? "MANUAL");
    const sourceType = z.nativeEnum(LabelDataSourceType).safeParse(sourceRaw);
    const st = sourceType.success ? sourceType.data : LabelDataSourceType.MANUAL;

    const mergedContains =
      contains.length > 0 ? contains : parseAllergenListCsv(product.allergens ?? "");

    await prisma.allergenProfile.upsert({
      where: { productId: product.id },
      create: {
        productId: product.id,
        userId: product.menu.userId,
        containsJson: mergedContains,
        mayContainJson: mayContain,
        freeFromJson: freeFrom,
        sourceType: st,
        notes: notes ?? null,
        verificationStatus: "NEEDS_REVIEW",
      },
      update: {
        containsJson: mergedContains,
        mayContainJson: mayContain,
        freeFromJson: freeFrom,
        sourceType: st,
        notes: notes ?? null,
        verificationStatus: "NEEDS_REVIEW",
        verifiedAt: null,
        verifiedById: null,
      },
    });

    await appendLabelVerificationEvent({
      userId: dataUserId,
      productId: product.id,
      profileType: "ALLERGEN",
      action: "UPSERT",
      performedById: user.id,
    });

    revalidatePath("/dashboard/nutrition-labels");
    revalidatePath(`/dashboard/nutrition-labels/items/${product.id}`);
  } catch (e) {
    console.error(safeError(e));
  }
}
