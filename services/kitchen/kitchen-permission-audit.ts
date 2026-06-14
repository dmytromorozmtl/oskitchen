import type { PermissionKey } from "@/lib/permissions/permissions";
import type { WorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { AUDIT_ACTIONS } from "@/lib/audit/audit-actions";
import { auditLog } from "@/services/audit/audit-service";

type KitchenAuditActor = WorkspacePermissionActor | null | undefined;

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

export async function logKitchenPermissionDenied(
  actor: KitchenAuditActor,
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
    action: AUDIT_ACTIONS.KITCHEN_PERMISSION_DENIED,
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

export async function logKitchenOrderRecalled(
  actor: WorkspacePermissionActor,
  input: {
    orderId: string;
    metadata?: Record<string, unknown>;
  },
): Promise<void> {
  await auditLog({
    workspaceId: actor.workspaceId,
    actor: actorPayload(actor),
    action: AUDIT_ACTIONS.KITCHEN_ORDER_RECALLED,
    category: "ORDERS",
    source: "USER",
    severity: "INFO",
    entity: { type: "Order", id: input.orderId, label: "KDS recall to PREPARING" },
    metadata: {
      targetStatus: "PREPARING",
      ...input.metadata,
    },
    maskPiiInMetadata: true,
  });
}

export async function logKitchenOrderBumped(
  actor: WorkspacePermissionActor,
  input: {
    orderId: string;
    metadata?: Record<string, unknown>;
  },
): Promise<void> {
  await auditLog({
    workspaceId: actor.workspaceId,
    actor: actorPayload(actor),
    action: AUDIT_ACTIONS.KITCHEN_ORDER_BUMPED,
    category: "ORDERS",
    source: "USER",
    severity: "INFO",
    entity: { type: "Order", id: input.orderId, label: "KDS bump to READY" },
    metadata: {
      targetStatus: "READY",
      ...input.metadata,
    },
    maskPiiInMetadata: true,
  });
}
