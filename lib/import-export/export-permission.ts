import type { ExportType } from "@/lib/import-export/export-types";
import type { PermissionKey } from "@/lib/permissions/permissions";

/** Workspace permission required to download a given export kind. */
export function workspacePermissionForExport(kind: ExportType): PermissionKey {
  switch (kind) {
    case "orders":
    case "customers":
    case "packing":
      return "orders.manage";
    case "products":
    case "production":
    case "inventory":
    case "menus":
    case "recipes":
    case "ingredient_demand":
    case "nutrition_labels":
      return "production.manage";
    case "integrations_metadata":
      return "integrations.manage";
    case "audit_logs":
      return "workspace.settings";
    default:
      return "workspace.settings";
  }
}
