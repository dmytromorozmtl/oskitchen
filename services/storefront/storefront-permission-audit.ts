import type { PermissionKey } from "@/lib/permissions/permissions";
import type { WorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { AUDIT_ACTIONS } from "@/lib/audit/audit-actions";
import { auditLog } from "@/services/audit/audit-service";

type StorefrontAuditActor = WorkspacePermissionActor | null | undefined;

function roleLabel(actor: WorkspacePermissionActor): string {
  return actor.staffRoleType ?? actor.workspaceRole;
}

function actorPayload(actor: WorkspacePermissionActor) {
  return {
    userId: actor.sessionUserId,
    email: actor.email,
    role: roleLabel(actor),
  };
}

export async function logStorefrontPermissionDenied(
  actor: StorefrontAuditActor,
  input: {
    requiredPermission: PermissionKey;
    operation: string;
    metadata?: Record<string, unknown>;
  },
): Promise<void> {
  if (!actor) return;

  await auditLog({
    workspaceId: actor.workspaceId,
    actor: actorPayload(actor),
    action: AUDIT_ACTIONS.STOREFRONT_PERMISSION_DENIED,
    category: "PERMISSIONS",
    source: "USER",
    severity: "WARNING",
    entity: { type: "Permission", id: input.requiredPermission, label: input.operation },
    metadata: {
      requiredPermission: input.requiredPermission,
      operation: input.operation,
      workspaceRole: actor.workspaceRole,
      staffRoleType: actor.staffRoleType ?? null,
      ...input.metadata,
    },
  });
}
