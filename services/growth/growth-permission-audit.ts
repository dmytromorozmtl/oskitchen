import { recordAuditLog } from "@/lib/audit-log";
import type { PermissionKey } from "@/lib/permissions/permissions";
import type { WorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import type { GrowthCapability } from "@/lib/growth/growth-types";

export async function logGrowthPermissionDenied(
  actor: WorkspacePermissionActor | undefined,
  input: {
    requiredPermission: PermissionKey;
    operation: string;
    growthCapability?: GrowthCapability;
    metadata?: Record<string, unknown>;
  },
): Promise<void> {
  await recordAuditLog({
    userId: actor?.userId ?? null,
    workspaceId: actor?.workspaceId ?? null,
    action: "growth.permission_denied",
    entityType: "Growth",
    metadata: {
      requiredPermission: input.requiredPermission,
      operation: input.operation,
      growthCapability: input.growthCapability ?? null,
      workspaceRole: actor?.workspaceRole ?? null,
      staffRoleType: actor?.staffRoleType ?? null,
      ...input.metadata,
    },
  });
}
