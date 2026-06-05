"use server";

import { revalidatePath } from "next/cache";

import { PRICE_INTELLIGENCE_PATH } from "@/lib/marketplace/price-intelligence-policy";
import { hasPermission } from "@/lib/permissions/guards";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { addToCart } from "@/services/marketplace/cart-service";
import {
  resolvePriceIntelligenceSwitchProduct,
  savePriceIntelligenceAutoSwitchPolicy,
} from "@/services/marketplace/price-intelligence";

function cartActor(actor: Awaited<ReturnType<typeof requireWorkspacePermissionActor>>) {
  return {
    userId: actor.sessionUserId,
    email: actor.email,
    role: actor.staffRoleType ?? actor.workspaceRole,
  };
}

export async function togglePriceIntelligenceAutoSwitchAction(
  enabled: boolean,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const actor = await requireWorkspacePermissionActor();
  if (!actor.workspaceId) {
    return { ok: false, error: "Workspace required." };
  }
  if (!hasPermission(actor.granted, "marketplace:orders:create")) {
    return { ok: false, error: "You do not have permission to update procurement policies." };
  }

  await savePriceIntelligenceAutoSwitchPolicy(actor.workspaceId, {
    enabled,
    minSavingsPercent: 5,
  });

  revalidatePath(PRICE_INTELLIGENCE_PATH);
  revalidatePath("/dashboard/marketplace");
  return { ok: true };
}

export async function applyPriceIntelligenceAutoSwitchAction(
  recommendationId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const actor = await requireWorkspacePermissionActor();
  if (!actor.workspaceId) {
    return { ok: false, error: "Workspace required." };
  }
  if (!hasPermission(actor.granted, "marketplace:cart:write")) {
    return { ok: false, error: "You do not have permission to update the marketplace cart." };
  }

  const line = await resolvePriceIntelligenceSwitchProduct({
    workspaceId: actor.workspaceId,
    recommendationId,
  });
  if (!line) {
    return { ok: false, error: "Switch recommendation not found or expired." };
  }

  await addToCart(actor.workspaceId, line, cartActor(actor));

  revalidatePath(PRICE_INTELLIGENCE_PATH);
  revalidatePath("/dashboard/marketplace/checkout");
  revalidatePath("/dashboard/marketplace/catalog");

  return { ok: true };
}
