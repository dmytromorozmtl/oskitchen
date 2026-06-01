"use server";

import { revalidatePath } from "next/cache";

import { requirePlatformAccess } from "@/lib/platform/platform-guards";
import { hasPlatformPermission } from "@/lib/platform/platform-permissions";
import {
  bulkModeratePlatformVendors,
  moderatePlatformVendor,
} from "@/services/marketplace/platform-vendor-moderation-service";

function revalidateVendorModerationPaths(vendorId?: string) {
  revalidatePath("/platform/marketplace/vendors");
  revalidatePath("/platform/marketplace/vendor-verification");
  revalidatePath("/vendor/register/status");
  if (vendorId) {
    revalidatePath(`/platform/marketplace/vendors/${vendorId}`);
  }
}

export async function moderatePlatformVendorAction(input: {
  vendorId: string;
  action: "approve" | "reject" | "suspend" | "reactivate" | "review";
  notes?: string | null;
}) {
  const ctx = await requirePlatformAccess();
  if (!hasPlatformPermission(ctx.permissions, "platform:organizations:write")) {
    return { ok: false as const, error: "You do not have permission to moderate marketplace vendors." };
  }

  const result = await moderatePlatformVendor({
    vendorId: input.vendorId,
    action: input.action,
    reviewerUserId: ctx.userId,
    reviewerEmail: ctx.email,
    notes: input.notes,
  });

  if (result.ok) {
    revalidateVendorModerationPaths(input.vendorId);
  }

  return result;
}

export async function bulkModeratePlatformVendorsAction(input: {
  vendorIds: string[];
  action: "approve" | "suspend";
}) {
  const ctx = await requirePlatformAccess();
  if (!hasPlatformPermission(ctx.permissions, "platform:organizations:write")) {
    return { ok: false as const, error: "You do not have permission to moderate marketplace vendors." };
  }

  const result = await bulkModeratePlatformVendors({
    vendorIds: input.vendorIds,
    action: input.action,
    reviewerUserId: ctx.userId,
    reviewerEmail: ctx.email,
  });

  if (result.ok) {
    revalidateVendorModerationPaths();
  }

  return result;
}
