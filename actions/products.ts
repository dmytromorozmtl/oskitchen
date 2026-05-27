"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { recordAuditLog } from "@/lib/audit-log";
import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import type { PermissionKey } from "@/lib/permissions/permissions";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import {
  menuByIdWhereForOwner,
  productByIdWhereForOwner,
  productByIdWhereForOwnerWithMenuFallback,
} from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import { productCategorySchema, productUpsertSchema } from "@/lib/schemas";
import type { OperatingMode } from "@/lib/operating-modes/types";
import { revalidateStorefrontDashboardAndPublic } from "@/lib/storefront/revalidate-storefront-dashboard";
import { safeError } from "@/lib/security";
import { getAllowedCategoryCodes } from "@/services/products/category-service";

async function requireProductMutationPermission(
  operation: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const permission: PermissionKey = "products.edit";
  const access = await requireMutationPermission(permission);
  if (!access.ok) {
    await recordAuditLog({
      userId: access.actor?.sessionUserId ?? null,
      workspaceId: access.actor?.workspaceId ?? null,
      action: "products.permission_denied",
      entityType: "Product",
      metadata: { operation, requiredPermission: permission },
    });
    return { ok: false, error: access.error };
  }
  return { ok: true };
}

async function revalidateProductPaths(userId: string) {
  revalidatePath("/dashboard/products");
  revalidatePath("/dashboard/production");
  const sf = await prisma.storefrontSettings.findFirst({ where: { userId  }, orderBy: [{ isPrimary: "desc" }, { updatedAt: "desc" }],
    select: { storeSlug: true },
  });
  if (sf) revalidateStorefrontDashboardAndPublic(sf.storeSlug);
}

const productImagePatchSchema = z.object({
  productId: z.string().uuid(),
  image: z
    .string()
    .optional()
    .nullable()
    .transform((s) => (!s || !String(s).trim() ? null : String(s).trim()))
    .refine((s) => s === null || /^https?:\/\/.+/i.test(s), {
      message: "Enter a valid image URL",
    }),
});

async function validateProductCategory(
  userId: string,
  categoryRaw: string,
  operatingMode: OperatingMode,
): Promise<string | null> {
  const parsed = productCategorySchema.safeParse(categoryRaw);
  if (!parsed.success) {
    return parsed.error.issues[0]?.message ?? "Invalid category";
  }
  const allowed = await getAllowedCategoryCodes(userId, operatingMode);
  if (!allowed.includes(parsed.data)) {
    return "Invalid category";
  }
  return null;
}

function parseProductForm(formData: FormData) {
  const categoryRaw = String(formData.get("category") ?? "OTHER");
  const category = productCategorySchema.safeParse(categoryRaw);
  return productUpsertSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") ?? undefined,
    category: category.success ? category.data : "OTHER",
    allergens: formData.get("allergens") ?? undefined,
    ingredients: formData.get("ingredients") ?? undefined,
    portionSize: formData.get("portionSize") ?? undefined,
    reheatingInstructions: formData.get("reheatingInstructions") ?? undefined,
    kitchenNotes: formData.get("kitchenNotes") ?? undefined,
    price: formData.get("price"),
    preparedDate: formData.get("preparedDate"),
    pickupDate: formData.get("pickupDate") || undefined,
    deliveryAvailable: formData.get("deliveryAvailable") === "on",
    active: formData.get("active") !== "off",
    image: formData.get("image") ?? undefined,
  });
}

export async function createProduct(formData: FormData) {
  try {
    const gate = await requireProductMutationPermission("products.create");
    if (!gate.ok) return { error: gate.error };

    const { userId, workspaceId } = await requireTenantActor();
    const menuId = String(formData.get("menuId"));

    const menu = await prisma.menu.findFirst({
      where: await menuByIdWhereForOwner(userId, menuId),
    });
    if (!menu) return { error: "Menu not found" };

    const operatingMode = String(formData.get("operatingMode") ?? "WEEKLY_PREORDER") as OperatingMode;

    const parsed = parseProductForm(formData);
    if (!parsed.success) {
      const err = parsed.error.flatten().fieldErrors;
      return {
        error: Object.values(err).flat()[0] ?? "Invalid product",
      };
    }

    const d = parsed.data;
    const categoryError = await validateProductCategory(userId, d.category, operatingMode);
    if (categoryError) return { error: categoryError };

    const isDailyService = operatingMode === "DAILY_SERVICE";

    const product = await prisma.product.create({
      data: {
        menuId,
        workspaceId: workspaceId ?? undefined,
        title: d.title,
        description: d.description,
        category: d.category,
        allergens: d.allergens,
        ingredients: d.ingredients,
        portionSize: isDailyService ? null : d.portionSize,
        reheatingInstructions: isDailyService ? null : d.reheatingInstructions,
        kitchenNotes: d.kitchenNotes,
        preparedDate: d.preparedDate,
        pickupDate: isDailyService ? null : d.pickupDate,
        deliveryAvailable: d.deliveryAvailable,
        active: d.active,
        price: d.price,
        image: d.image,
        storefrontVisible: true,
        posVisible: true,
      },
    });

    if (!isDailyService) {
      await prisma.productionTask.create({
        data: { productId: product.id },
      });
    }

    await revalidateProductPaths(userId);
    return ok(undefined);
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function updateProduct(productId: string, formData: FormData) {
  try {
    const gate = await requireProductMutationPermission("products.update");
    if (!gate.ok) return { error: gate.error };

    const { userId } = await requireTenantActor();

    const existing = await prisma.product.findFirst({
      where: await productByIdWhereForOwnerWithMenuFallback(userId, productId),
    });
    if (!existing) return { error: "Product not found" };

    const operatingMode = String(formData.get("operatingMode") ?? "WEEKLY_PREORDER") as OperatingMode;

    const parsed = parseProductForm(formData);
    if (!parsed.success) {
      const err = parsed.error.flatten().fieldErrors;
      return {
        error: Object.values(err).flat()[0] ?? "Invalid product",
      };
    }

    const d = parsed.data;
    const categoryError = await validateProductCategory(userId, d.category, operatingMode);
    if (categoryError) return { error: categoryError };

    const isDailyService = operatingMode === "DAILY_SERVICE";

    await prisma.product.update({
      where: { id: productId },
      data: {
        title: d.title,
        description: d.description,
        category: d.category,
        allergens: d.allergens,
        ingredients: d.ingredients,
        portionSize: isDailyService ? null : d.portionSize,
        reheatingInstructions: isDailyService ? null : d.reheatingInstructions,
        kitchenNotes: d.kitchenNotes,
        preparedDate: d.preparedDate,
        pickupDate: isDailyService ? null : d.pickupDate,
        deliveryAvailable: d.deliveryAvailable,
        active: d.active,
        price: d.price,
        image: d.image,
      },
    });

    await revalidateProductPaths(userId);
    return ok(undefined);
  } catch (e) {
    return { error: safeError(e) };
  }
}

/** Quick image update from products table (media library pick). */
export async function updateProductImageFormAction(formData: FormData) {
  try {
    const gate = await requireProductMutationPermission("products.update_image");
    if (!gate.ok) return { error: gate.error };

    const { userId } = await requireTenantActor();
    const parsed = productImagePatchSchema.safeParse({
      productId: formData.get("productId"),
      image: formData.get("image"),
    });
    if (!parsed.success) {
      return { error: parsed.error.flatten().fieldErrors.image?.[0] ?? "Invalid image" };
    }

    const existing = await prisma.product.findFirst({
      where: await productByIdWhereForOwner(userId, parsed.data.productId),
    });
    if (!existing) return { error: "Product not found" };

    await prisma.product.update({
      where: { id: existing.id },
      data: { image: parsed.data.image },
    });

    await revalidateProductPaths(userId);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function deleteProduct(productId: string) {
  try {
    const gate = await requireProductMutationPermission("products.delete");
    if (!gate.ok) return { error: gate.error };

    const { userId } = await requireTenantActor();
    const existing = await prisma.product.findFirst({
      where: await productByIdWhereForOwnerWithMenuFallback(userId, productId),
    });
    if (!existing) return { error: "Not found" };

    await prisma.product.delete({ where: { id: productId } });
    await revalidateProductPaths(userId);
    return ok(undefined);
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function reorderProducts(menuId: string, orderedIds: string[]) {
  try {
    const gate = await requireProductMutationPermission("products.reorder");
    if (!gate.ok) return { error: gate.error };

    const { userId } = await requireTenantActor();
    const menu = await prisma.menu.findFirst({
      where: await menuByIdWhereForOwner(userId, menuId),
    });
    if (!menu) return { error: "Menu not found" };

    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.product.updateMany({
          where: { id, menuId },
          data: { sortOrder: index },
        }),
      ),
    );

    revalidatePath("/dashboard/products");
    return ok(undefined);
  } catch (e) {
    return { error: safeError(e) };
  }
}
