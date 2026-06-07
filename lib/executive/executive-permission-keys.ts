import type { ExecutivePermission } from "@/lib/executive/executive-permissions";
import type { PermissionKey } from "@/lib/permissions/permissions";

/** Map executive capabilities to canonical workspace permission keys when registered. */
const EXECUTIVE_PERMISSION_MAP: Partial<Record<ExecutivePermission, PermissionKey>> = {
  "executive.insights.manage": "executive.insights.manage",
};

export function executivePermissionKey(permission: ExecutivePermission): PermissionKey | null {
  return EXECUTIVE_PERMISSION_MAP[permission] ?? null;
}

/** Map executive capabilities to workspace mutation permissions for server actions. */
export function workspacePermissionForExecutiveCapability(
  capability: ExecutivePermission,
): PermissionKey {
  switch (capability) {
    case "executive.read.financial":
      return "reports.read.financial";
    case "executive.read.customer_pii":
      return "reports.read.customer_pii";
    case "executive.export":
      return "reports.export";
    case "executive.insights.manage":
      return "executive.insights.manage";
    case "executive.read.brand_location":
    case "executive.read.operations":
    case "executive.view":
    default:
      return "reports.read.operations";
  }
}
