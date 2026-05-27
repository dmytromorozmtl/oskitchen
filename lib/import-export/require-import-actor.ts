import type { ImportCsvKind } from "@/lib/import-export/import-types";
import { workspacePermissionForImport } from "@/lib/import-export/import-permission";
import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import type { WorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { logImportPermissionDenied } from "@/services/import-export/import-permission-audit";

export async function requireImportActor(input: {
  importKind: ImportCsvKind;
  operation?: string;
  metadata?: Record<string, unknown>;
}):
  | { ok: true; actor: WorkspacePermissionActor }
  | { ok: false; error: string } {
  const requiredPermission = workspacePermissionForImport(input.importKind);
  const access = await requireMutationPermission(requiredPermission);
  if (!access.ok) {
    await logImportPermissionDenied(access.actor, {
      requiredPermission,
      importKind: input.importKind,
      operation: input.operation,
      metadata: input.metadata,
    });
    return { ok: false, error: access.error };
  }
  return { ok: true, actor: access.actor };
}
