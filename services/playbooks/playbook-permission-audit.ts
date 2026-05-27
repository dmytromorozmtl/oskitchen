import { recordAuditLog } from "@/lib/audit-log";
import type { PermissionKey } from "@/lib/permissions/permissions";
import type { WorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import type { PlaybookCapability } from "@/lib/playbooks/playbook-types";

export async function logPlaybookPermissionDenied(
  actor: WorkspacePermissionActor | undefined,
  input: {
    requiredPermission: PermissionKey;
    operation: string;
    playbookCapability?: PlaybookCapability;
    metadata?: Record<string, unknown>;
  },
): Promise<void> {
  await recordAuditLog({
    userId: actor?.userId ?? null,
    workspaceId: actor?.workspaceId ?? null,
    action: "playbooks.permission_denied",
    entityType: "Playbook",
    metadata: {
      requiredPermission: input.requiredPermission,
      operation: input.operation,
      playbookCapability: input.playbookCapability ?? null,
      workspaceRole: actor?.workspaceRole ?? null,
      staffRoleType: actor?.staffRoleType ?? null,
      ...input.metadata,
    },
  });
}
