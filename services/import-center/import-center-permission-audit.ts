import type { PermissionKey } from "@/lib/permissions/permissions";
import type { WorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { AUDIT_ACTIONS } from "@/lib/audit/audit-actions";
import type { ImportCapability } from "@/lib/import-center/import-types";
import type { ImportType } from "@prisma/client";
import { auditLog } from "@/services/audit/audit-service";

type ImportCenterAuditActor = WorkspacePermissionActor | null | undefined;

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

export async function logImportCenterPermissionDenied(
  actor: ImportCenterAuditActor,
  input: {
    requiredPermission: PermissionKey;
    capability?: ImportCapability;
    importType?: ImportType;
    operation?: string;
    metadata?: Record<string, unknown>;
  },
): Promise<void> {
  if (!actor) return;

  await auditLog({
    workspaceId: actor.workspaceId,
    actor: actorPayload(actor),
    action: AUDIT_ACTIONS.IMPORT_PERMISSION_DENIED,
    category: "PERMISSIONS",
    source: "USER",
    severity: "WARNING",
    entity: {
      type: "Permission",
      id: input.requiredPermission,
      label: input.operation ?? input.capability ?? "import_center",
    },
    metadata: {
      domain: "import_center",
      requiredPermission: input.requiredPermission,
      capability: input.capability ?? null,
      importType: input.importType ?? null,
      operation: input.operation ?? input.capability ?? "import_center",
      workspaceRole: actor.workspaceRole,
      staffRoleType: actor.staffRoleType ?? null,
      ...input.metadata,
    },
  });
}
