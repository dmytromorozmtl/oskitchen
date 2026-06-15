import type { ImportCsvKind } from "@/lib/import-export/import-types";
import type { PermissionKey } from "@/lib/permissions/permissions";

/** Workspace permission required to upload/preview a given import kind. */
export function workspacePermissionForImport(kind: ImportCsvKind): PermissionKey {
  switch (kind) {
    case "ingredients":
      return "products.edit";
    default:
      return "products.edit";
  }
}
