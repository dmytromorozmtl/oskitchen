import { recordAuditLog } from "@/lib/audit-log";
import type { PermissionKey } from "@/lib/permissions/permissions";
import type { WorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import type { GoLiveCapability } from "@/lib/go-live/go-live-permissions";

export async function logGoLivePermissionDenied(
  actor: WorkspacePermissionActor | undefined,
  input: {
    requiredPermission: PermissionKey;
    operation: string;
    goLiveCapability?: GoLiveCapability;
    metadata?: Record<string, unknown>;
  },
): Promise<void> {
  await recordAuditLog({
    userId: actor?.userId ?? null,
    workspaceId: actor?.workspaceId ?? null,
    action: "go-live.permission_denied",
    entityType: "GoLive",
    metadata: {
      requiredPermission: input.requiredPermission,
      operation: input.operation,
      goLiveCapability: input.goLiveCapability ?? null,
      workspaceRole: actor?.workspaceRole ?? null,
      staffRoleType: actor?.staffRoleType ?? null,
      ...input.metadata,
    },
  });
}
