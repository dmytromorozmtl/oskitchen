"use server";

import { revalidatePath } from "next/cache";

import type { MarketplacePaymentMethod } from "@prisma/client";

import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { hasPermission } from "@/lib/permissions/guards";
import { prisma } from "@/lib/prisma";
import { checkoutMarketplaceCart } from "@/services/marketplace/checkout-service";

export async function checkoutMarketplaceCartAction(input: {
  paymentMethod: MarketplacePaymentMethod;
  notes?: string;
}): Promise<
  | { ok: true; orderIds: string[]; requiresApproval: boolean; clientSecret?: string | null }
  | { ok: false; error: string }
> {
  const actor = await requireWorkspacePermissionActor();
  if (!actor.workspaceId) {
    return { ok: false, error: "Workspace required." };
  }
  if (!hasPermission(actor.granted, "marketplace:cart:write")) {
    return { ok: false, error: "You do not have permission to checkout." };
  }
  if (!hasPermission(actor.granted, "marketplace:orders:create")) {
    return { ok: false, error: "You do not have permission to create purchase orders." };
  }

  const settings = await prisma.kitchenSettings.findUnique({
    where: { userId: actor.userId },
    select: {
      pickupAddress: true,
      businessName: true,
    },
  });

  try {
    const result = await checkoutMarketplaceCart({
      workspaceId: actor.workspaceId,
      userId: actor.userId,
      actorUserId: actor.sessionUserId,
      actorEmail: actor.email,
      actorRole: actor.staffRoleType ?? actor.workspaceRole,
      paymentMethod: input.paymentMethod,
      deliveryAddress: {
        label: settings?.businessName ?? "Delivery address",
        line1: settings?.pickupAddress ?? "Configure delivery address in kitchen settings",
      },
      notes: input.notes ?? null,
    });

    revalidatePath("/dashboard/marketplace");
    revalidatePath("/dashboard/marketplace/orders");
    revalidatePath("/dashboard/marketplace/checkout");

    return {
      ok: true,
      orderIds: result.orderIds,
      requiresApproval: result.requiresApproval,
      clientSecret: result.paymentIntentClientSecret,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Checkout failed.",
    };
  }
}
