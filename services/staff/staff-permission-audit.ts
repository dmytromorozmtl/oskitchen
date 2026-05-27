import { recordAuditLog } from "@/lib/audit-log";
import type { PermissionKey } from "@/lib/permissions/permissions";
import type { WorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import type { StaffCapability } from "@/lib/staff/staff-permissions";

export async function logStaffPermissionDenied(
  actor: WorkspacePermissionActor | undefined,
  input: {
    requiredPermission: PermissionKey;
    operation: string;
    staffCapability?: StaffCapability;
    metadata?: Record<string, unknown>;
  },
): Promise<void> {
  await recordAuditLog({
    userId: actor?.userId ?? null,
    workspaceId: actor?.workspaceId ?? null,
    action: "staff.permission_denied",
    entityType: "Staff",
    metadata: {
      requiredPermission: input.requiredPermission,
      operation: input.operation,
      staffCapability: input.staffCapability ?? null,
      workspaceRole: actor?.workspaceRole ?? null,
      staffRoleType: actor?.staffRoleType ?? null,
      ...input.metadata,
    },
  });
}
