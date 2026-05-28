import { recordAuditLog } from "@/lib/audit-log";
import type { WorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";

/**
 * Shared denial audit for domain mutation helpers backed by `requireMutationPermission`.
 * Keeps wave-4+ helpers consistent without duplicating recordAuditLog field wiring.
 */
export async function logDomainMutationDenied(input: {
  action: string;
  entityType: string;
  actor?: WorkspacePermissionActor | null;
  metadata: Record<string, unknown>;
}): Promise<void> {
  await recordAuditLog({
    userId: input.actor?.sessionUserId ?? null,
    workspaceId: input.actor?.workspaceId ?? null,
    action: input.action,
    entityType: input.entityType,
    metadata: input.metadata,
  });
}
