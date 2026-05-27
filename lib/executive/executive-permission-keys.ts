import type { PermissionKey } from "@/lib/permissions/permissions";
import type { ExecutivePermission } from "@/lib/executive/executive-permissions";

/** Map executive capabilities to canonical workspace permission keys. */
export function executivePermissionKey(permission: ExecutivePermission): PermissionKey | null {
  switch (permission) {
    case "executive.view":
    case "executive.read.operations":
    case "executive.read.brand_location":
      return "reports.read.operations";
    case "executive.read.financial":
      return "reports.read.financial";
    case "executive.read.customer_pii":
      return "reports.read.customer_pii";
    case "executive.export":
      return "reports.export";
    case "executive.insights.manage":
      return "executive.insights.manage";
    default:
      return null;
  }
}

/** Workspace permission required for server mutation gates. */
export function workspacePermissionForExecutiveCapability(
  capability: ExecutivePermission,
): PermissionKey {
  return executivePermissionKey(capability) ?? "reports.read.operations";
}
