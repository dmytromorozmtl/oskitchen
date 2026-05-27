import { recordAuditLog } from "@/lib/audit-log";
import type { PermissionKey } from "@/lib/permissions/permissions";
import type { WorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";

export async function logRewardsPermissionDenied(
  actor: WorkspacePermissionActor | undefined,
  input: {
    requiredPermission: PermissionKey;
    operation: string;
    module: "gift_cards" | "loyalty";
    metadata?: Record<string, unknown>;
  },
): Promise<void> {
  await recordAuditLog({
    userId: actor?.sessionUserId ?? null,
    workspaceId: actor?.workspaceId ?? null,
    action: "crm.rewards.permission_denied",
    entityType: "Rewards",
    metadata: {
      requiredPermission: input.requiredPermission,
      operation: input.operation,
      module: input.module,
      workspaceRole: actor?.workspaceRole ?? null,
      staffRoleType: actor?.staffRoleType ?? null,
      ...input.metadata,
    },
  });
}
