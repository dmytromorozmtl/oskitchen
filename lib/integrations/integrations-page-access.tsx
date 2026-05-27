import { createElement, type ReactNode } from "react";

import { PosAccessCard } from "@/components/dashboard/pos-access-card";
import { hasPermission } from "@/lib/permissions/guards";
import type { PermissionKey } from "@/lib/permissions/permissions";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";

export function canReadIntegrations(granted: ReadonlySet<PermissionKey>): boolean {
  return (
    hasPermission(granted, "integrations.read") || hasPermission(granted, "integrations.manage")
  );
}

export function canManageIntegrations(granted: ReadonlySet<PermissionKey>): boolean {
  return hasPermission(granted, "integrations.manage");
}

export function integrationsReadDeniedCard(): ReactNode {
  return createElement(PosAccessCard, {
    title: "Channel integrations",
    description:
      "You do not have permission to view sales channel integrations in this workspace.",
    primaryHref: "/dashboard/today",
    primaryLabel: "Back to Today",
  });
}

export function integrationsManageDeniedCard(): ReactNode {
  return createElement(PosAccessCard, {
    title: "Channel integrations",
    description:
      "You do not have permission to connect or manage sales channel integrations in this workspace.",
    primaryHref: "/dashboard/today",
    primaryLabel: "Back to Today",
  });
}

export async function requireIntegrationsReadPage(): Promise<
  | { ok: true; actor: Awaited<ReturnType<typeof requireWorkspacePermissionActor>>; canManage: boolean }
  | { ok: false; deny: ReactNode }
> {
  const actor = await requireWorkspacePermissionActor();
  if (!canReadIntegrations(actor.granted)) {
    return { ok: false, deny: integrationsReadDeniedCard() };
  }
  return {
    ok: true,
    actor,
    canManage: canManageIntegrations(actor.granted),
  };
}

export async function requireIntegrationsManagePage(): Promise<
  | { ok: true; actor: Awaited<ReturnType<typeof requireWorkspacePermissionActor>> }
  | { ok: false; deny: ReactNode }
> {
  const actor = await requireWorkspacePermissionActor();
  if (!canManageIntegrations(actor.granted)) {
    return { ok: false, deny: integrationsManageDeniedCard() };
  }
  return { ok: true, actor };
}
