"use server";

import { revalidatePath } from "next/cache";

import { hasPermission } from "@/lib/permissions/guards";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { saveMarketplaceAnalyticsSettings } from "@/services/marketplace/marketplace-analytics-service";

export async function updateMarketplaceBudgetAction(monthlyBudgetUsd: number | null) {
  const actor = await requireWorkspacePermissionActor();
  if (!actor.workspaceId) {
    return { ok: false as const, error: "Workspace required." };
  }
  if (!hasPermission(actor.granted, "marketplace:orders:create")) {
    return { ok: false as const, error: "You do not have permission to update procurement budget." };
  }

  if (monthlyBudgetUsd != null && (!Number.isFinite(monthlyBudgetUsd) || monthlyBudgetUsd < 0)) {
    return { ok: false as const, error: "Enter a valid budget amount." };
  }

  await saveMarketplaceAnalyticsSettings(actor.dataUserId, {
    monthlyBudgetUsd: monthlyBudgetUsd && monthlyBudgetUsd > 0 ? monthlyBudgetUsd : null,
  });

  revalidatePath("/dashboard/marketplace/analytics");
  return { ok: true as const };
}
