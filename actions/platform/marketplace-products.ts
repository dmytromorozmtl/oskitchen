"use server";

import { revalidatePath } from "next/cache";

import { requirePlatformAccess } from "@/lib/platform/platform-guards";
import { hasPlatformPermission } from "@/lib/platform/platform-permissions";
import {
  bulkModeratePlatformProducts,
  moderatePlatformProduct,
} from "@/services/marketplace/platform-product-moderation-service";

function revalidateProductModerationPaths() {
  revalidatePath("/platform/marketplace/products");
  revalidatePath("/dashboard/marketplace/catalog");
  revalidatePath("/vendor/products");
}

export async function moderatePlatformProductAction(input: {
  productId: string;
  action: "approve" | "reject" | "request_changes" | "flag" | "unflag";
  notes?: string | null;
  flagReason?: string | null;
}) {
  const ctx = await requirePlatformAccess();
  if (!hasPlatformPermission(ctx.permissions, "platform:organizations:write")) {
    return { ok: false as const, error: "You do not have permission to moderate marketplace products." };
  }

  const result = await moderatePlatformProduct({
    productId: input.productId,
    action: input.action,
    reviewerUserId: ctx.userId,
    reviewerEmail: ctx.email,
    notes: input.notes,
    flagReason: input.flagReason,
  });

  if (result.ok) revalidateProductModerationPaths();
  return result;
}

export async function bulkModeratePlatformProductsAction(input: {
  productIds: string[];
  action: "approve" | "reject" | "flag";
  notes?: string | null;
}) {
  const ctx = await requirePlatformAccess();
  if (!hasPlatformPermission(ctx.permissions, "platform:organizations:write")) {
    return { ok: false as const, error: "You do not have permission to moderate marketplace products." };
  }

  const result = await bulkModeratePlatformProducts({
    productIds: input.productIds,
    action: input.action,
    reviewerUserId: ctx.userId,
    reviewerEmail: ctx.email,
    notes: input.notes,
  });

  if (result.ok) revalidateProductModerationPaths();
  return result;
}
