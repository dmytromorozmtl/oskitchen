"use server";

import { revalidatePath } from "next/cache";

import { hasPermission } from "@/lib/permissions/guards";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { toggleFavoriteVendorId } from "@/lib/marketplace/vendor-preferences";
import { addToCart } from "@/services/marketplace/cart-service";
import {
  loadLastMarketplaceOrderLinesForReorder,
  loadMarketplaceVendorPreferences,
  saveMarketplaceVendorPreferences,
  submitMarketplaceVendorReview,
  upsertMarketplaceVendorContract,
} from "@/services/marketplace/marketplace-vendors-service";

async function requireMarketplaceRead() {
  const actor = await requireWorkspacePermissionActor();
  if (!actor.workspaceId) return { ok: false as const, error: "Workspace required." };
  if (!hasPermission(actor.granted, "marketplace:read")) {
    return { ok: false as const, error: "You do not have permission to view marketplace vendors." };
  }
  return { ok: true as const, actor };
}

function cartActor(actor: Awaited<ReturnType<typeof requireWorkspacePermissionActor>>) {
  return {
    userId: actor.sessionUserId,
    email: actor.email,
    role: actor.staffRoleType ?? actor.workspaceRole,
  };
}

export async function toggleMarketplaceVendorFavoriteAction(vendorId: string) {
  const access = await requireMarketplaceRead();
  if (!access.ok) return access;

  const prefs = await loadMarketplaceVendorPreferences(access.actor.dataUserId);
  const next = toggleFavoriteVendorId(prefs, vendorId);
  await saveMarketplaceVendorPreferences(access.actor.dataUserId, next);

  revalidatePath("/dashboard/marketplace/vendors");
  revalidatePath(`/dashboard/marketplace/vendors/${vendorId}`);
  revalidatePath("/dashboard/marketplace");

  return { ok: true as const, isFavorite: next.favoriteVendorIds.includes(vendorId) };
}

export async function uploadMarketplaceVendorContractAction(input: {
  vendorId: string;
  fileName: string;
  fileUrl?: string | null;
  effectiveDate?: string | null;
  expiresAt?: string | null;
  notes?: string | null;
}) {
  const access = await requireMarketplaceRead();
  if (!access.ok) return access;
  if (!hasPermission(access.actor.granted, "marketplace:orders:create")) {
    return { ok: false as const, error: "You do not have permission to manage vendor contracts." };
  }

  if (!input.fileName.trim()) {
    return { ok: false as const, error: "Contract file name is required." };
  }

  await upsertMarketplaceVendorContract({
    dataUserId: access.actor.dataUserId,
    vendorId: input.vendorId,
    contract: {
      fileName: input.fileName.trim(),
      fileUrl: input.fileUrl ?? null,
      effectiveDate: input.effectiveDate ?? null,
      expiresAt: input.expiresAt ?? null,
      notes: input.notes ?? null,
    },
  });

  revalidatePath(`/dashboard/marketplace/vendors/${input.vendorId}`);
  return { ok: true as const };
}

export async function rateMarketplaceVendorAction(input: {
  vendorId: string;
  purchaseOrderId: string;
  qualityScore: number;
  accuracyScore: number;
  deliveryScore: number;
  packagingScore: number;
  comment?: string | null;
}) {
  const access = await requireMarketplaceRead();
  if (!access.ok) return access;
  if (!hasPermission(access.actor.granted, "marketplace:reviews:write")) {
    return { ok: false as const, error: "You do not have permission to rate vendors." };
  }

  const result = await submitMarketplaceVendorReview({
    workspaceId: access.actor.workspaceId!,
    vendorId: input.vendorId,
    purchaseOrderId: input.purchaseOrderId,
    qualityScore: input.qualityScore,
    accuracyScore: input.accuracyScore,
    deliveryScore: input.deliveryScore,
    packagingScore: input.packagingScore,
    comment: input.comment,
  });

  if (result.ok) {
    revalidatePath(`/dashboard/marketplace/vendors/${input.vendorId}`);
    revalidatePath("/dashboard/marketplace/vendors");
  }

  return result;
}

export async function quickReorderMarketplaceVendorAction(vendorId: string) {
  const access = await requireMarketplaceRead();
  if (!access.ok) return access;
  if (!hasPermission(access.actor.granted, "marketplace:cart:write")) {
    return { ok: false as const, error: "You do not have permission to update the cart." };
  }

  const lines = await loadLastMarketplaceOrderLinesForReorder({
    workspaceId: access.actor.workspaceId!,
    vendorId,
  });

  if (!lines || lines.length === 0) {
    return { ok: false as const, error: "No previous order found for quick reorder." };
  }

  for (const line of lines) {
    await addToCart(access.actor.workspaceId!, line, cartActor(access.actor));
  }

  revalidatePath("/dashboard/marketplace/checkout");
  revalidatePath("/dashboard/marketplace/catalog");

  return { ok: true as const, itemCount: lines.length };
}
