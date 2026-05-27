import { recordAuditLog } from "@/lib/audit-log";
import type { PermissionKey } from "@/lib/permissions/permissions";
import type { WorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";

export async function logCrmPermissionDenied(
  actor: WorkspacePermissionActor | undefined,
  input: {
    requiredPermission: PermissionKey;
    operation: string;
    metadata?: Record<string, unknown>;
  },
): Promise<void> {
  await recordAuditLog({
    userId: actor?.sessionUserId ?? null,
    workspaceId: actor?.workspaceId ?? null,
    action: "crm.permission_denied",
    entityType: "CRM",
    metadata: {
      requiredPermission: input.requiredPermission,
      operation: input.operation,
      workspaceRole: actor?.workspaceRole ?? null,
      staffRoleType: actor?.staffRoleType ?? null,
      ...input.metadata,
    },
  });
}
