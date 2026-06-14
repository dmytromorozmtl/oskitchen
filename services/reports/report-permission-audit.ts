import type { PermissionKey } from "@/lib/permissions/permissions";
import type { WorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import type { ReportPermission } from "@/lib/reports/report-types";
import { reportPermissionKey } from "@/lib/reports/report-permission-keys";
import { AUDIT_ACTIONS } from "@/lib/audit/audit-actions";
import { auditLog } from "@/services/audit/audit-service";

type ReportAuditActor = WorkspacePermissionActor | null | undefined;

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

export async function logReportPermissionDenied(
  actor: ReportAuditActor,
  input: {
    requiredPermission: ReportPermission;
    operation?: string;
    reportKey?: string;
    metadata?: Record<string, unknown>;
  },
): Promise<void> {
  if (!actor) return;

  const canonical = reportPermissionKey(input.requiredPermission);
  const permissionId: PermissionKey | ReportPermission =
    canonical ?? input.requiredPermission;

  await auditLog({
    workspaceId: actor.workspaceId,
    actor: actorPayload(actor),
    action: AUDIT_ACTIONS.REPORT_PERMISSION_DENIED,
    category: "PERMISSIONS",
    source: "USER",
    severity: "WARNING",
    entity: {
      type: "Permission",
      id: permissionId,
      label: input.operation ?? input.requiredPermission,
    },
    metadata: {
      requiredPermission: input.requiredPermission,
      operation: input.operation ?? input.requiredPermission,
      reportKey: input.reportKey ?? null,
      workspaceRole: actor.workspaceRole,
      staffRoleType: actor.staffRoleType ?? null,
      ...input.metadata,
    },
  });
}
