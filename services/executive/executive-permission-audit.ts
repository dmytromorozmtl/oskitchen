import { recordAuditLog } from "@/lib/audit-log";
import type { PermissionKey } from "@/lib/permissions/permissions";
import type { WorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import type { ExecutivePermission } from "@/lib/executive/executive-permissions";

export async function logExecutivePermissionDenied(
  actor: WorkspacePermissionActor | undefined,
  input: {
    requiredPermission: PermissionKey | ExecutivePermission;
    operation: string;
    executiveCapability?: ExecutivePermission;
    metadata?: Record<string, unknown>;
  },
): Promise<void> {
  await recordAuditLog({
    userId: actor?.userId ?? null,
    workspaceId: actor?.workspaceId ?? null,
    action: "executive.permission_denied",
    entityType: "Executive",
    metadata: {
      requiredPermission: input.requiredPermission,
      operation: input.operation,
      executiveCapability: input.executiveCapability ?? null,
      workspaceRole: actor?.workspaceRole ?? null,
      staffRoleType: actor?.staffRoleType ?? null,
      ...input.metadata,
    },
  });
}
