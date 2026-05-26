"use server";


import { fail, ok } from "@/lib/action-result";
import { PackagingLabelType, PrintedLabelStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { printedLabelByIdWhereForOwner } from "@/lib/scope/workspace-printed-label-scope";
import { productByIdWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import { safeError } from "@/lib/security";
import { appendLabelVerificationEvent } from "@/services/nutrition-labels/label-verification-log";

export async function createPrintedLabelJobAction(formData: FormData) {
  try {
    const { sessionUser: user, dataUserId } = await requireTenantActor();
    const templateId = z.string().uuid().safeParse(formData.get("templateId"));
    const productId = z.string().uuid().safeParse(formData.get("productId"));
    const copies = z.coerce.number().int().min(1).max(99).safeParse(formData.get("copies") ?? 1);
    if (!templateId.success || !productId.success || !copies.success) return { error: "Invalid job." };

    const template = await prisma.labelTemplate.findFirst({
      where: { id: templateId.data, userId: dataUserId, active: true },
    });
    if (!template) return { error: "Template not found." };

    const product = await prisma.product.findFirst({
      where: await productByIdWhereForOwner(dataUserId, productId.data),
      select: { id: true },
    });
    if (!product) return { error: "Product not found." };

    await prisma.printedLabel.create({
      data: {
        userId: dataUserId,
        templateId: template.id,
        productId: product.id,
        type: template.type,
        status: PrintedLabelStatus.QUEUED,
        copies: copies.data,
      },
    });

    await appendLabelVerificationEvent({
      userId: dataUserId,
      productId: product.id,
      profileType: "LABEL",
      action: "PRINT_JOB_CREATED",
      performedById: user.id,
      metadata: { templateId: template.id, copies: copies.data },
    });

    revalidatePath("/dashboard/nutrition-labels/print-queue");
    revalidatePath("/dashboard/nutrition-labels");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function markPrintedLabelJobAction(formData: FormData) {
  try {
    const { sessionUser: user, dataUserId } = await requireTenantActor();
    const id = z.string().uuid().safeParse(formData.get("id"));
    if (!id.success) return { error: "Invalid label job." };

    const row = await prisma.printedLabel.findFirst({
      where: await printedLabelByIdWhereForOwner(dataUserId, id.data),
    });
    if (!row) return { error: "Not found." };

    await prisma.printedLabel.update({
      where: { id: row.id },
      data: {
        status: PrintedLabelStatus.PRINTED,
        printedAt: new Date(),
        printedById: user.id,
      },
    });

    if (row.productId) {
      await appendLabelVerificationEvent({
        userId: dataUserId,
        productId: row.productId,
        profileType: "LABEL",
        action: "PRINTED",
        performedById: user.id,
        metadata: { printedLabelId: row.id },
      });
    }

    revalidatePath("/dashboard/nutrition-labels/print-queue");
    revalidatePath("/dashboard/nutrition-labels");
    if (row.productId) revalidatePath(`/dashboard/nutrition-labels/items/${row.productId}`);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function ensureDefaultLabelTemplatesAction() {
  try {
    const { sessionUser: user, dataUserId } = await requireTenantActor();
    const count = await prisma.labelTemplate.count({ where: { userId: dataUserId } });
    if (count > 0) return { ok: true as const, created: 0 };

    await prisma.labelTemplate.createMany({
      data: [
        {
          userId: dataUserId,
          name: "Meal prep item label",
          type: "ITEM",
          packagingLabelType: PackagingLabelType.ITEM_LABEL,
          size: "4x6",
          contentJson: { version: 1, fields: ["title", "allergens", "ingredients", "qr", "disclaimer"] },
          active: true,
        },
        {
          userId: dataUserId,
          name: "Nutrition facts (compact)",
          type: "NUTRITION",
          packagingLabelType: PackagingLabelType.NUTRITION,
          size: "2x3",
          contentJson: { version: 1, fields: ["nutrition", "serving", "disclaimer"] },
          active: true,
        },
        {
          userId: dataUserId,
          name: "Allergen warning",
          type: "ALLERGEN",
          packagingLabelType: PackagingLabelType.ALLERGEN,
          size: "2x1",
          contentJson: { version: 1, fields: ["allergens", "disclaimer"] },
          active: true,
        },
      ],
    });
    revalidatePath("/dashboard/nutrition-labels");
    return { ok: true as const, created: 3 };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function createPrintedLabelJobFormAction(formData: FormData): Promise<void> {
  void (await createPrintedLabelJobAction(formData));
}

export async function markPrintedLabelJobFormAction(formData: FormData): Promise<void> {
  void (await markPrintedLabelJobAction(formData));
}
