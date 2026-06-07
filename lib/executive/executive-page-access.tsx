import { createElement, type ReactNode } from "react";

import { PermissionDeniedCard } from "@/components/ui/permission-denied-card";
import {
  canViewExecutive,
  type ExecutiveActorScope,
  type ExecutivePermission,
} from "@/lib/executive/executive-permissions";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { createReportActorScope } from "@/lib/reports/report-actor-scope";

function executiveDeniedCard(title: string, description: string): ReactNode {
  return createElement(PermissionDeniedCard, {
    title,
    description,
    primaryHref: "/dashboard/today",
    primaryLabel: "Back to Today",
  });
}

function executivePermissionDeniedCard(permission: ExecutivePermission): ReactNode {
  switch (permission) {
    case "executive.read.financial":
      return executiveDeniedCard(
        "Executive financials",
        "You do not have permission to view financial executive dashboards in this workspace.",
      );
    case "executive.read.customer_pii":
      return executiveDeniedCard(
        "Executive customers",
        "You do not have permission to view customer PII in the executive dashboard.",
      );
    case "executive.read.operations":
      return executiveDeniedCard(
        "Executive operations",
        "You do not have permission to view operational executive dashboards in this workspace.",
      );
    case "executive.read.brand_location":
      return executiveDeniedCard(
        "Brands & locations",
        "You do not have permission to view brand and location executive reports in this workspace.",
      );
    case "executive.export":
      return executiveDeniedCard(
        "Executive report export",
        "You do not have permission to export executive reports in this workspace.",
      );
    case "executive.insights.manage":
      return executiveDeniedCard(
        "Executive insights",
        "You do not have permission to manage executive dashboard insights in this workspace.",
      );
    default:
      return executiveDeniedCard(
        "Executive Command Center",
        "You do not have permission to access the executive dashboard in this workspace.",
      );
  }
}

function executiveScopeFromActor(
  actor: Awaited<ReturnType<typeof requireWorkspacePermissionActor>>,
): ExecutiveActorScope {
  return createReportActorScope(actor);
}

export async function getExecutivePageAccess() {
  const actor = await requireWorkspacePermissionActor();
  const scope = executiveScopeFromActor(actor);

  return {
    actor,
    scope,
    canView: canViewExecutive(scope, "executive.view"),
    canReadFinancial: canViewExecutive(scope, "executive.read.financial"),
    canReadOperations: canViewExecutive(scope, "executive.read.operations"),
    canReadBrandLocation: canViewExecutive(scope, "executive.read.brand_location"),
    canExport: canViewExecutive(scope, "executive.export"),
  };
}

export async function requireExecutivePageAccess(permission: ExecutivePermission): Promise<
  | {
      ok: true;
      actor: Awaited<ReturnType<typeof requireWorkspacePermissionActor>>;
      scope: ExecutiveActorScope;
    }
  | { ok: false; deny: ReactNode }
> {
  const actor = await requireWorkspacePermissionActor();
  const scope = executiveScopeFromActor(actor);
  if (!canViewExecutive(scope, permission)) {
    return { ok: false, deny: executivePermissionDeniedCard(permission) };
  }
  return { ok: true, actor, scope };
}
