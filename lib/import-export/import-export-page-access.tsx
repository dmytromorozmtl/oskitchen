import { createElement, type ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";
import type { PermissionKey } from "@/lib/permissions/permissions";
import { hasPermission } from "@/lib/permissions/guards";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";

const HUB_VIEW_PERMISSIONS: PermissionKey[] = [
  "products.edit",
  "reports.export",
  "orders.export",
  "customers.export",
  "audit.export",
  "integrations.manage",
];

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

export async function getImportExportPageAccess() {
  const actor = await requireWorkspacePermissionActor();
  const can = (permission: PermissionKey) => hasPermission(actor.granted, permission);

  return {
    actor,
    canViewHub: HUB_VIEW_PERMISSIONS.some((permission) => can(permission)),
    canImportIngredients: can("products.edit"),
    canExportReports: can("reports.export"),
    canExportOrders: can("orders.export"),
    canExportCustomers: can("customers.export"),
    canExportAudit: can("audit.export"),
    canManageIntegrationsExport: can("integrations.manage"),
  };
}

export async function requireImportExportPageAccess(
  input: {
    needImportIngredients?: boolean;
    needHubView?: boolean;
  } = {},
) {
  const access = await getImportExportPageAccess();
  if (input.needImportIngredients && !access.canImportIngredients) {
    return {
      ok: false as const,
      deny: deniedCard("You do not have permission to import ingredient data."),
    };
  }
  if (input.needHubView !== false && !access.canViewHub) {
    return {
      ok: false as const,
      deny: deniedCard("You do not have permission to access Import / Export Center."),
    };
  }
  return { ok: true as const, ...access };
}
