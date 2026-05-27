import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import type { WorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { logIntegrationPermissionDenied } from "@/services/integrations/integration-permission-audit";

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
