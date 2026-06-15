import type { UserRole } from "@prisma/client";

import { hasPermission } from "@/lib/permissions/guards";
import type { PermissionKey } from "@/lib/permissions/permissions";

const MANAGER_ROLE_UI_PERMISSIONS: PermissionKey[] = [
  "orders.manage",
  "kitchen.view",
  "packing.manage",
  "production.manage",
  "pos.access",
  "workspace.view",
];

export function canAccessManagerRoleUi(input: {
  workspaceRole: UserRole;
  granted: ReadonlySet<PermissionKey>;
  platformBypass?: boolean;
}): boolean {
  if (input.platformBypass) return true;
  if (input.workspaceRole === "OWNER") return true;
  return MANAGER_ROLE_UI_PERMISSIONS.some((permission) =>
    hasPermission(input.granted, permission),
  );
}
