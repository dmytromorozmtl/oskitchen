"use server";

import { revalidatePath } from "next/cache";

import { MARKETPLACE_FINANCING_PATH } from "@/lib/marketplace/financing-policy";
import type { MarketplaceNetTermsDays } from "@/lib/marketplace/financing-policy";
import { hasPermission } from "@/lib/permissions/guards";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { setMarketplaceNetTermsDays } from "@/services/marketplace/financing";

export async function selectMarketplaceNetTermsAction(
  days: MarketplaceNetTermsDays,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const actor = await requireWorkspacePermissionActor();
  if (!actor.workspaceId) {
    return { ok: false, error: "Workspace required." };
  }
  if (!hasPermission(actor.granted, "marketplace:orders:create")) {
    return { ok: false, error: "You do not have permission to update financing terms." };
  }

  try {
    await setMarketplaceNetTermsDays(actor.workspaceId, days);
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unable to update net terms.",
    };
  }

  revalidatePath(MARKETPLACE_FINANCING_PATH);
  revalidatePath("/dashboard/marketplace/checkout");
  revalidatePath("/dashboard/marketplace");

  return { ok: true };
}
