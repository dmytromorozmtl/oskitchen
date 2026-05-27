import { createElement, type ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { createExecutiveActorScope } from "@/lib/executive/executive-actor-scope";
import { executivePermissionKey } from "@/lib/executive/executive-permission-keys";
import {
  canViewExecutive,
  type ExecutivePermission,
} from "@/lib/executive/executive-permissions";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { logExecutivePermissionDenied } from "@/services/executive/executive-permission-audit";

const DENIED_MESSAGES: Partial<Record<ExecutivePermission, string>> = {
  "executive.view": "You do not have permission to view the executive dashboard.",
  "executive.read.operations": "You do not have permission to view operations metrics.",
  "executive.read.financial": "You do not have permission to view revenue or financial metrics.",
  "executive.read.customer_pii": "You do not have permission to view customer PII metrics.",
  "executive.read.brand_location": "You do not have permission to view brand and location metrics.",
  "executive.export": "Exporting executive reports is restricted to authorized finance and leadership roles.",
  "executive.insights.manage": "You do not have permission to manage executive insights.",
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

export async function requireExecutivePageAccess(permission: ExecutivePermission) {
  try {
    const actor = await requireWorkspacePermissionActor();
    const scope = createExecutiveActorScope(actor);
    if (canViewExecutive(scope, permission)) {
      return { ok: true as const, actor, scope };
    }
    const canonical = executivePermissionKey(permission);
    await logExecutivePermissionDenied(actor, {
      requiredPermission: canonical ?? permission,
      operation: permission,
      executiveCapability: permission,
    });
    return {
      ok: false as const,
      deny: deniedCard(
        DENIED_MESSAGES[permission] ??
          "You do not have permission to view this executive surface.",
      ),
    };
  } catch {
    return {
      ok: false as const,
      deny: deniedCard("You do not have permission to view this executive surface."),
    };
  }
}

export async function getExecutivePageAccess() {
  const actor = await requireWorkspacePermissionActor();
  const scope = createExecutiveActorScope(actor);

  return {
    actor,
    scope,
    userId: actor.userId,
    sessionUserId: actor.sessionUserId,
    canView: canViewExecutive(scope, "executive.view"),
    canReadOperations: canViewExecutive(scope, "executive.read.operations"),
    canReadFinancial: canViewExecutive(scope, "executive.read.financial"),
    canReadCustomerPii: canViewExecutive(scope, "executive.read.customer_pii"),
    canReadBrandLocation: canViewExecutive(scope, "executive.read.brand_location"),
    canExport: canViewExecutive(scope, "executive.export"),
    canManageInsights: canViewExecutive(scope, "executive.insights.manage"),
  };
}
