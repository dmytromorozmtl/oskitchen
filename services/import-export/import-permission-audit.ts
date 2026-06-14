import type { PermissionKey } from "@/lib/permissions/permissions";
import type { WorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { AUDIT_ACTIONS } from "@/lib/audit/audit-actions";
import type { ImportCsvKind } from "@/lib/import-export/import-types";
import { auditLog } from "@/services/audit/audit-service";

type ImportAuditActor = WorkspacePermissionActor | null | undefined;

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

export async function logImportPermissionDenied(
  actor: ImportAuditActor,
  input: {
    requiredPermission: PermissionKey;
    importKind: ImportCsvKind;
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
      label: input.operation ?? `import:${input.importKind}`,
    },
    metadata: {
      requiredPermission: input.requiredPermission,
      importKind: input.importKind,
      operation: input.operation ?? `import:${input.importKind}`,
      workspaceRole: actor.workspaceRole,
      staffRoleType: actor.staffRoleType ?? null,
      ...input.metadata,
    },
  });
}
