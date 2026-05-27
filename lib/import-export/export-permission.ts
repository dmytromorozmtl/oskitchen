import type { ExportType } from "@/lib/import-export/export-types";
import type { PermissionKey } from "@/lib/permissions/permissions";

/** Workspace permission required to download a given export kind. */
export function workspacePermissionForExport(kind: ExportType): PermissionKey {
  switch (kind) {
    case "orders":
    case "packing":
      return "orders.export";
    case "customers":
      return "customers.export";
    case "integrations_metadata":
      return "integrations.manage";
    case "audit_logs":
      return "audit.export";
    case "products":
    case "production":
    case "inventory":
    case "menus":
    case "brands":
    case "locations":
    case "recipes":
    case "suppliers":
    case "purchase_orders":
    case "costing_snapshots":
    case "ingredient_demand":
    case "nutrition_labels":
    case "reports":
      return "reports.export";
    default:
      return "reports.export";
  }
}
