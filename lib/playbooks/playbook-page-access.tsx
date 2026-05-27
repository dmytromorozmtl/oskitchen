import { createElement, type ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { requireUserProfile } from "@/lib/auth";
import { createPlaybookActorScope } from "@/lib/playbooks/playbook-actor-scope";
import { workspacePermissionForPlaybookCapability } from "@/lib/playbooks/playbook-permission-keys";
import {
  canUsePlaybooks,
  type PlaybookCapability,
} from "@/lib/playbooks/playbook-permissions";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { logPlaybookPermissionDenied } from "@/services/playbooks/playbook-permission-audit";

const DENIED_MESSAGES: Partial<Record<PlaybookCapability, string>> = {
  "playbooks.view": "You do not have permission to view playbooks.",
  "playbooks.read.reports": "You do not have permission to view playbook reports.",
  "playbooks.create_custom": "You do not have permission to create custom playbooks.",
  "playbooks.edit": "You do not have permission to change playbook settings.",
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

export async function requirePlaybooksPageAccess(capability: PlaybookCapability) {
  try {
    const actor = await requireWorkspacePermissionActor();
    const profile = await requireUserProfile();
    const scope = createPlaybookActorScope(actor, profile.role ?? null);
    if (canUsePlaybooks(scope, capability)) {
      return {
        ok: true as const,
        actor,
        scope,
        tenantScope: { userId: scope.userId, email: scope.email },
      };
    }
    const required = workspacePermissionForPlaybookCapability(capability);
    await logPlaybookPermissionDenied(actor, {
      requiredPermission: required,
      operation: capability,
      playbookCapability: capability,
    });
    return {
      ok: false as const,
      deny: deniedCard(
        DENIED_MESSAGES[capability] ??
          "You do not have permission to access playbooks in this workspace.",
      ),
    };
  } catch {
    return {
      ok: false as const,
      deny: deniedCard("You do not have permission to access playbooks in this workspace."),
    };
  }
}

export async function getPlaybooksPageAccess() {
  const actor = await requireWorkspacePermissionActor();
  const profile = await requireUserProfile();
  const scope = createPlaybookActorScope(actor, profile.role ?? null);

  function capability(cap: PlaybookCapability): boolean {
    return canUsePlaybooks(scope, cap);
  }

  return {
    actor,
    scope,
    tenantScope: { userId: scope.userId, email: scope.email },
    canView: capability("playbooks.view"),
    canRun: capability("playbooks.run"),
    canCompleteStep: capability("playbooks.complete_step"),
    canGenerateTasks: capability("playbooks.generate_tasks"),
    canCreateCustom: capability("playbooks.create_custom"),
    canEdit: capability("playbooks.edit"),
    canArchive: capability("playbooks.archive"),
    canReadReports: capability("playbooks.read.reports"),
  };
}
