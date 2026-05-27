import type { PermissionKey } from "@/lib/permissions/permissions";
import type { WorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { AUDIT_ACTIONS } from "@/lib/audit/audit-actions";
import { auditLog } from "@/services/audit/audit-service";

type PosAuditActor = WorkspacePermissionActor | null | undefined;

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

export async function logPosPermissionDenied(
  actor: PosAuditActor,
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
    action: AUDIT_ACTIONS.POS_PERMISSION_DENIED,
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

export async function logPosRegisterCreated(
  actor: WorkspacePermissionActor,
  input: {
    registerId: string;
    registerName: string;
    locationId?: string | null;
  },
): Promise<void> {
  await auditLog({
    workspaceId: actor.workspaceId,
    actor: actorPayload(actor),
    action: AUDIT_ACTIONS.POS_REGISTER_CREATED,
    category: "SETTINGS",
    source: "USER",
    severity: "INFO",
    entity: { type: "POSRegister", id: input.registerId, label: input.registerName },
    metadata: { locationId: input.locationId ?? null },
  });
}

export async function logPosTabEvent(
  actor: WorkspacePermissionActor,
  input: {
    action:
      | typeof AUDIT_ACTIONS.POS_TAB_OPENED
      | typeof AUDIT_ACTIONS.POS_TAB_ITEM_ADDED
      | typeof AUDIT_ACTIONS.POS_TAB_CLOSED;
    entityId?: string | null;
    label?: string | null;
    metadata?: Record<string, unknown>;
  },
): Promise<void> {
  await auditLog({
    workspaceId: actor.workspaceId,
    actor: actorPayload(actor),
    action: input.action,
    category: "ORDERS",
    source: "USER",
    severity: "INFO",
    entity: { type: "POSTab", id: input.entityId ?? null, label: input.label ?? null },
    metadata: input.metadata,
    maskPiiInMetadata: true,
  });
}

export async function logPosTerminalControlEvent(
  actor: WorkspacePermissionActor,
  input: {
    action:
      | typeof AUDIT_ACTIONS.POS_TERMINAL_TOKEN_ISSUED
      | typeof AUDIT_ACTIONS.POS_TERMINAL_PAYMENT_INTENT_CREATED
      | typeof AUDIT_ACTIONS.POS_TERMINAL_PAYMENT_CAPTURED
      | typeof AUDIT_ACTIONS.POS_TERMINAL_PAYMENT_CANCELLED;
    entityId?: string | null;
    label?: string | null;
    metadata?: Record<string, unknown>;
  },
): Promise<void> {
  await auditLog({
    workspaceId: actor.workspaceId,
    actor: actorPayload(actor),
    action: input.action,
    category: "ORDERS",
    source: "USER",
    severity: "INFO",
    entity: { type: "POSTerminal", id: input.entityId ?? null, label: input.label ?? null },
    metadata: input.metadata,
    maskPiiInMetadata: true,
  });
}
