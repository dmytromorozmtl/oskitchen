import type { ExportType } from "@/lib/import-export/export-types";
import { workspacePermissionForExport } from "@/lib/import-export/export-permission";
import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import type { WorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { logExportPermissionDenied } from "@/services/export/export-permission-audit";

export async function requireExportActor(input: {
  exportType: ExportType;
  operation?: string;
  metadata?: Record<string, unknown>;
}):
  | { ok: true; actor: WorkspacePermissionActor }
  | { ok: false; error: string } {
  const requiredPermission = workspacePermissionForExport(input.exportType);
  const access = await requireMutationPermission(requiredPermission);
  if (!access.ok) {
    await logExportPermissionDenied(access.actor, {
      requiredPermission,
      exportType: input.exportType,
      operation: input.operation,
      metadata: input.metadata,
    });
    return { ok: false, error: access.error };
  }
  return { ok: true, actor: access.actor };
}
