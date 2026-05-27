import { createElement, type ReactNode } from "react";

import { PosAccessCard } from "@/components/dashboard/pos-access-card";
import { hasPermission } from "@/lib/permissions/guards";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";

export function integrationsManageDeniedCard(): ReactNode {
  return createElement(PosAccessCard, {
    title: "Channel integrations",
    description:
      "You do not have permission to connect or manage sales channel integrations in this workspace.",
    primaryHref: "/dashboard/today",
    primaryLabel: "Back to Today",
  });
}

export async function requireIntegrationsManagePage():
  | { ok: true; actor: Awaited<ReturnType<typeof requireWorkspacePermissionActor>> }
  | { ok: false; deny: ReactNode } {
  const actor = await requireWorkspacePermissionActor();
  if (!hasPermission(actor.granted, "integrations.manage")) {
    return { ok: false, deny: integrationsManageDeniedCard() };
  }
  return { ok: true, actor };
}
