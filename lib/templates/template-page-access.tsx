import { createElement, type ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { requireUserProfile } from "@/lib/auth";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { createTemplateActorScope } from "@/lib/templates/template-actor-scope";
import { workspacePermissionForTemplateCapability } from "@/lib/templates/template-permission-keys";
import {
  canUseTemplates,
  type TemplateCapability,
} from "@/lib/templates/template-permissions";
import { logTemplatePermissionDenied } from "@/services/templates/template-permission-audit";

const DENIED_MESSAGES: Partial<Record<TemplateCapability, string>> = {
  "templates.view": "You do not have permission to view workspace templates.",
  "templates.preview": "You do not have permission to preview template changes.",
  "templates.apply": "Only authorised admins can apply workspace templates.",
  "templates.rollback": "Only authorised admins can roll back template applications.",
  "templates.history": "You do not have permission to view template application history.",
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

export async function requireTemplatesPageAccess(capability: TemplateCapability) {
  try {
    const actor = await requireWorkspacePermissionActor();
    const profile = await requireUserProfile();
    const scope = createTemplateActorScope(actor, profile.role ?? null);
    if (canUseTemplates(scope, capability)) {
      return {
        ok: true as const,
        actor,
        scope,
        tenantScope: { userId: scope.userId, email: scope.email },
      };
    }
    const required = workspacePermissionForTemplateCapability(capability);
    await logTemplatePermissionDenied(actor, {
      requiredPermission: required,
      operation: capability,
      templateCapability: capability,
    });
    return {
      ok: false as const,
      deny: deniedCard(
        DENIED_MESSAGES[capability] ??
          "You do not have permission to access workspace templates.",
      ),
    };
  } catch {
    return {
      ok: false as const,
      deny: deniedCard("You do not have permission to access workspace templates."),
    };
  }
}

export async function getTemplatesPageAccess() {
  const actor = await requireWorkspacePermissionActor();
  const profile = await requireUserProfile();
  const scope = createTemplateActorScope(actor, profile.role ?? null);

  function capability(cap: TemplateCapability): boolean {
    return canUseTemplates(scope, cap);
  }

  return {
    actor,
    scope,
    tenantScope: { userId: scope.userId, email: scope.email },
    canView: capability("templates.view"),
    canPreview: capability("templates.preview"),
    canApply: capability("templates.apply"),
    canRollback: capability("templates.rollback"),
    canViewHistory: capability("templates.history"),
  };
}
