import { hasPermission } from "@/lib/permissions/guards";
import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import type { PermissionKey } from "@/lib/permissions/permissions";
import {
  requireWorkspacePermissionActor,
  type WorkspacePermissionActor,
} from "@/lib/permissions/require-workspace-permission";
import { logIntegrationPermissionDenied } from "@/services/integrations/integration-permission-audit";

export async function requireIntegrationsReadActor(input?: {
  operation?: string;
  metadata?: Record<string, unknown>;
}):
  | { ok: true; actor: WorkspacePermissionActor; workspaceId: string | null; canManage: boolean }
  | { ok: false; error: string } {
  try {
    const actor = await requireWorkspacePermissionActor();
    const canRead =
      hasPermission(actor.granted, "integrations.read") ||
      hasPermission(actor.granted, "integrations.manage");
    if (!canRead) {
      await logIntegrationPermissionDenied(actor, {
        requiredPermission: "integrations.read",
        operation: input?.operation ?? "integrations.read",
        metadata: input?.metadata,
      });
      return { ok: false, error: "You do not have permission to view integrations." };
    }
    return {
      ok: true,
      actor,
      workspaceId: actor.workspaceId,
      canManage: hasPermission(actor.granted, "integrations.manage"),
    };
  } catch {
    return { ok: false, error: "You do not have permission to view integrations." };
  }
}

export async function requireIntegrationsActor(input?: {
  operation?: string;
  metadata?: Record<string, unknown>;
}):
  | { ok: true; actor: WorkspacePermissionActor; workspaceId: string | null }
  | { ok: false; error: string } {
  const operation = input?.operation ?? "integrations.manage";
  const access = await requireMutationPermission("integrations.manage");
  if (!access.ok) {
    await logIntegrationPermissionDenied(access.actor, {
      requiredPermission: "integrations.manage",
      operation,
      metadata: input?.metadata,
    });
    return { ok: false, error: access.error };
  }
  return {
    ok: true,
    actor: access.actor,
    workspaceId: access.actor.workspaceId,
  };
}

export async function requireIntegrationsPermissionActor(
  required: PermissionKey,
  input?: {
    operation?: string;
    metadata?: Record<string, unknown>;
  },
):
  | { ok: true; actor: WorkspacePermissionActor; workspaceId: string | null }
  | { ok: false; error: string } {
  if (required === "integrations.manage") {
    return requireIntegrationsActor(input);
  }
  if (required === "integrations.read") {
    const access = await requireIntegrationsReadActor(input);
    if (!access.ok) return access;
    return { ok: true, actor: access.actor, workspaceId: access.workspaceId };
  }
  return requireIntegrationsActor(input);
}
