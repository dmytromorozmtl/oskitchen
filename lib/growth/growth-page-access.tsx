import { createElement, type ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { requireUserProfile } from "@/lib/auth";
import { createGrowthActorScope } from "@/lib/growth/growth-actor-scope";
import { canAccessGrowthModule, canUseGrowth } from "@/lib/growth/growth-permissions";
import { workspacePermissionForGrowthCapability } from "@/lib/growth/growth-permission-keys";
import type { GrowthCapability } from "@/lib/growth/growth-types";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { logGrowthPermissionDenied } from "@/services/growth/growth-permission-audit";

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

export async function requireGrowthPageAccess(capability: GrowthCapability = "growth.view") {
  try {
    const actor = await requireWorkspacePermissionActor();
    const profile = await requireUserProfile();
    const scope = createGrowthActorScope(actor, profile.role ?? null);
    if (canUseGrowth(scope, capability)) {
      return { ok: true as const, actor, scope };
    }
    if (await canAccessGrowthModule(actor.sessionUserId, actor.email, profile.role)) {
      return { ok: true as const, actor, scope };
    }
    const required = workspacePermissionForGrowthCapability(capability);
    await logGrowthPermissionDenied(actor, {
      requiredPermission: required,
      operation: capability,
      growthCapability: capability,
    });
    return {
      ok: false as const,
      deny: deniedCard(
        "You do not have permission to access Growth. Workspace owners and platform GTM roles may be granted access.",
      ),
    };
  } catch {
    return {
      ok: false as const,
      deny: deniedCard("You do not have permission to access Growth in this workspace."),
    };
  }
}

export async function getGrowthPageAccess() {
  const actor = await requireWorkspacePermissionActor();
  const profile = await requireUserProfile();
  const scope = createGrowthActorScope(actor, profile.role ?? null);
  const legacy = await canAccessGrowthModule(actor.sessionUserId, actor.email, profile.role);

  return {
    actor,
    scope,
    canView: canUseGrowth(scope, "growth.view") || legacy,
    canManage: canUseGrowth(scope, "growth.manage") || legacy,
  };
}
