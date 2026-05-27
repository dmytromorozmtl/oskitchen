import { createElement, type ReactNode } from "react";

import { PosAccessCard } from "@/components/dashboard/pos-access-card";
import { requireIntegrationsManagePage } from "@/lib/integrations/integrations-page-access";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";

export function salesChannelsManageDeniedCard(): ReactNode {
  return createElement(PosAccessCard, {
    title: "Channel operations",
    description:
      "You do not have permission to change import staging, simulator runs, rules, handoff settings, or other channel configuration in this workspace.",
    primaryHref: "/dashboard/sales-channels",
    primaryLabel: "Back to channel overview",
  });
}

export async function requireSalesChannelsManagePage():
  | { ok: true; actor: Awaited<ReturnType<typeof requireWorkspacePermissionActor>> }
  | { ok: false; deny: ReactNode } {
  const access = await requireIntegrationsManagePage();
  if (!access.ok) {
    return { ok: false, deny: salesChannelsManageDeniedCard() };
  }
  return { ok: true, actor: access.actor };
}
