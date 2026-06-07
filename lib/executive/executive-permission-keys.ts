import type { ExecutivePermission } from "@/lib/executive/executive-permissions";
import type { PermissionKey } from "@/lib/permissions/permissions";

/** Map executive capabilities to canonical workspace permission keys when registered. */
const EXECUTIVE_PERMISSION_MAP: Partial<Record<ExecutivePermission, PermissionKey>> = {
  "executive.insights.manage": "executive.insights.manage",
};

export function executivePermissionKey(permission: ExecutivePermission): PermissionKey | null {
  return EXECUTIVE_PERMISSION_MAP[permission] ?? null;
}
