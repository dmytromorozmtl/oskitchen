"use server";

import { revalidatePath } from "next/cache";

import { hasPermission } from "@/lib/permissions/guards";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { addToCart } from "@/services/marketplace/cart-service";

function cartActor(actor: Awaited<ReturnType<typeof requireWorkspacePermissionActor>>) {
  return {
    userId: actor.sessionUserId,
    email: actor.email,
    role: actor.staffRoleType ?? actor.workspaceRole,
  };
}

export async function oneClickReorderMarketplaceItemAction(input: {
  productId: string;
  slug: string;
  name: string;
  sku: string;
  vendorId: string;
  vendorName: string;
  quantity: number;
  unitPrice: number;
  currency: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const actor = await requireWorkspacePermissionActor();
  if (!actor.workspaceId) {
    return { ok: false, error: "Workspace required." };
  }
  if (!hasPermission(actor.granted, "marketplace:cart:write")) {
    return { ok: false, error: "You do not have permission to update the marketplace cart." };
  }

  if (input.quantity < 1) {
    return { ok: false, error: "Quantity must be at least 1." };
  }

  await addToCart(actor.workspaceId, input, cartActor(actor));

  revalidatePath("/dashboard/marketplace");
  revalidatePath("/dashboard/marketplace/catalog");
  revalidatePath("/dashboard/marketplace/checkout");
  revalidatePath(`/dashboard/marketplace/products/${input.slug}`);

  return { ok: true };
}
