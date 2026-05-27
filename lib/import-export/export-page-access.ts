import { workspacePermissionForExport } from "@/lib/import-export/export-permission";
import { ALL_EXPORT_TYPES, type ExportType } from "@/lib/import-export/export-types";
import { hasPermission } from "@/lib/permissions/guards";
import type { PermissionKey } from "@/lib/permissions/permissions";

/** Export cards visible on `/dashboard/import-export/export` — mirrors `/api/export` gates. */
export function resolveVisibleExportTypes(input: {
  granted: ReadonlySet<PermissionKey>;
  isPlatformSuperAdmin: boolean;
}): ExportType[] {
  return ALL_EXPORT_TYPES.filter((type) => {
    const required = workspacePermissionForExport(type);
    if (type === "audit_logs") {
      return input.isPlatformSuperAdmin && hasPermission(input.granted, required);
    }
    return hasPermission(input.granted, required);
  });
}
