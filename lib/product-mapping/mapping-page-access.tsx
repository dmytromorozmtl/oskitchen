import { createElement, type ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { requireUserProfile } from "@/lib/auth";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { createProductMappingActorScope } from "@/lib/product-mapping/mapping-actor-scope";
import { workspacePermissionForMappingCapability } from "@/lib/product-mapping/mapping-permission-keys";
import {
  canUseProductMapping,
  type ProductMappingCapability,
} from "@/lib/product-mapping/mapping-permissions";
import { logProductMappingPermissionDenied } from "@/services/product-mapping/product-mapping-permission-audit";

const DENIED_MESSAGES: Partial<Record<ProductMappingCapability, string>> = {
  "mapping.view": "You do not have permission to view the product mapping workbench.",
  "mapping.audit": "You do not have permission to view product mapping activity.",
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

export async function requireProductMappingPageAccess(capability: ProductMappingCapability) {
  try {
    const actor = await requireWorkspacePermissionActor();
    const profile = await requireUserProfile();
    const scope = createProductMappingActorScope(actor, profile.role ?? null);
    if (canUseProductMapping(scope, capability)) {
      return {
        ok: true as const,
        actor,
        scope,
        userId: actor.userId,
      };
    }
    const required = workspacePermissionForMappingCapability(capability);
    await logProductMappingPermissionDenied(actor, {
      requiredPermission: required,
      operation: capability,
      mappingCapability: capability,
    });
    return {
      ok: false as const,
      deny: deniedCard(
        DENIED_MESSAGES[capability] ??
          "You do not have permission to access product mapping in this workspace.",
      ),
    };
  } catch {
    return {
      ok: false as const,
      deny: deniedCard("You do not have permission to access product mapping in this workspace."),
    };
  }
}

export async function getProductMappingPageAccess() {
  const actor = await requireWorkspacePermissionActor();
  const profile = await requireUserProfile();
  const scope = createProductMappingActorScope(actor, profile.role ?? null);

  function capability(cap: ProductMappingCapability): boolean {
    return canUseProductMapping(scope, cap);
  }

  return {
    actor,
    scope,
    userId: actor.userId,
    canView: capability("mapping.view"),
    canCreate: capability("mapping.create"),
    canApprove: capability("mapping.approve"),
    canReject: capability("mapping.reject"),
    canBulk: capability("mapping.bulk"),
    canEdit: capability("mapping.edit"),
    canArchive: capability("mapping.archive"),
    canAlias: capability("mapping.alias"),
    canModifier: capability("mapping.modifier"),
    canAudit: capability("mapping.audit"),
  };
}
