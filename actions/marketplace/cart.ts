"use server";

import { revalidatePath } from "next/cache";

import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { hasPermission } from "@/lib/permissions/guards";
import {
  addToCart,
  getCart,
  loadSavedCart,
  removeFromCart,
  saveCart,
  updateQuantity,
} from "@/services/marketplace/cart-service";

function cartActor(actor: Awaited<ReturnType<typeof requireWorkspacePermissionActor>>) {
  return {
    userId: actor.sessionUserId,
    email: actor.email,
    role: actor.staffRoleType ?? actor.workspaceRole,
  };
}

async function requireCartWrite() {
  const actor = await requireWorkspacePermissionActor();
  if (!actor.workspaceId) {
    return { ok: false as const, error: "Workspace required." };
  }
  if (!hasPermission(actor.granted, "marketplace:cart:write")) {
    return { ok: false as const, error: "You do not have permission to update the marketplace cart." };
  }
  return { ok: true as const, actor };
}

export async function addMarketplaceProductToCartAction(input: {
  productId: string;
  slug: string;
  name: string;
  sku: string;
  vendorId: string;
  vendorName: string;
  quantity: number;
  unitPrice: number;
  currency: string;
  variantId?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const access = await requireCartWrite();
  if (!access.ok) return access;

  await addToCart(access.actor.workspaceId!, input, cartActor(access.actor));
  revalidatePath("/dashboard/marketplace");
  revalidatePath("/dashboard/marketplace/catalog");
  revalidatePath("/dashboard/marketplace/checkout");
  revalidatePath(`/dashboard/marketplace/products/${input.slug}`);
  return { ok: true };
}

export async function getMarketplaceCartAction() {
  const actor = await requireWorkspacePermissionActor();
  if (!actor.workspaceId || !hasPermission(actor.granted, "marketplace:read")) {
    return null;
  }
  return getCart(actor.workspaceId);
}

export async function removeMarketplaceCartItemAction(itemIndex: number) {
  const access = await requireCartWrite();
  if (!access.ok) return access;
  await removeFromCart(access.actor.workspaceId!, itemIndex, cartActor(access.actor));
  revalidatePath("/dashboard/marketplace/checkout");
  return { ok: true as const };
}

export async function updateMarketplaceCartQuantityAction(itemIndex: number, quantity: number) {
  const access = await requireCartWrite();
  if (!access.ok) return access;
  try {
    await updateQuantity(access.actor.workspaceId!, itemIndex, quantity, cartActor(access.actor));
  } catch (error) {
    return { ok: false as const, error: error instanceof Error ? error.message : "Update failed." };
  }
  revalidatePath("/dashboard/marketplace/checkout");
  return { ok: true as const };
}

export async function saveMarketplaceCartTemplateAction(name: string) {
  const access = await requireCartWrite();
  if (!access.ok) return access;
  try {
    await saveCart(access.actor.workspaceId!, name, cartActor(access.actor));
  } catch (error) {
    return { ok: false as const, error: error instanceof Error ? error.message : "Save failed." };
  }
  revalidatePath("/dashboard/marketplace/checkout");
  return { ok: true as const };
}

export async function loadMarketplaceCartTemplateAction(templateId: string) {
  const access = await requireCartWrite();
  if (!access.ok) return access;
  try {
    await loadSavedCart(access.actor.workspaceId!, templateId, cartActor(access.actor));
  } catch (error) {
    return { ok: false as const, error: error instanceof Error ? error.message : "Load failed." };
  }
  revalidatePath("/dashboard/marketplace/checkout");
  return { ok: true as const };
}
