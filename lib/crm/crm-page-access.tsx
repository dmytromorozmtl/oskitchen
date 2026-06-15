import { createElement, type ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { canManageCustomers, canViewCustomers } from "@/lib/crm/customers-permission";
import { buildCustomersSubnavLinks } from "@/lib/crm/customers-subnav-links";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { logCrmPermissionDenied } from "@/services/crm/crm-permission-audit";

export type { CustomersSubnavLink } from "@/lib/crm/customers-subnav-links";
export { CUSTOMERS_SUBNAV_LINKS, buildCustomersSubnavLinks } from "@/lib/crm/customers-subnav-links";
export { canManageCustomers, canViewCustomers } from "@/lib/crm/customers-permission";

export type CustomersHubAccess = {
  actor: Awaited<ReturnType<typeof requireWorkspacePermissionActor>>;
  canView: boolean;
  canManage: boolean;
};

function deniedCard(message: string): ReactNode {
  return createElement(
    Card,
    { className: "border-border/80 shadow-sm" },
    createElement(
      CardContent,
      { className: "py-8 text-center text-sm text-muted-foreground" },
      message,
    ),
  );
}

export async function getCustomersHubAccess(): Promise<CustomersHubAccess> {
  const actor = await requireWorkspacePermissionActor();
  return {
    actor,
    canView: canViewCustomers(actor.granted),
    canManage: canManageCustomers(actor.granted),
  };
}

export async function requireCustomersHubPageAccess() {
  const access = await getCustomersHubAccess();
  if (!access.canView) {
    await logCrmPermissionDenied(access.actor, {
      requiredPermission: "customers.read",
      operation: "customers.hub.view",
    });
    return {
      ok: false as const,
      deny: deniedCard("You do not have permission to view customers in this workspace."),
    };
  }
  return { ok: true as const, ...access };
}

export async function requireCustomersManagePageAccess() {
  const access = await getCustomersHubAccess();
  if (!access.canManage) {
    await logCrmPermissionDenied(access.actor, {
      requiredPermission: "customers.manage",
      operation: "customers.manage.page",
    });
    return {
      ok: false as const,
      deny: deniedCard("You do not have permission to change customer records."),
    };
  }
  return { ok: true as const, ...access };
}
