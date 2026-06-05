import type { UserRole } from "@prisma/client";

import { hasPermission } from "@/lib/permissions/guards";
import type { PermissionKey } from "@/lib/permissions/permissions";

const CHEF_ROLE_UI_PERMISSIONS: PermissionKey[] = [
  "kitchen.view",
  "kitchen.bump",
  "production.manage",
  "packing.manage",
  "workspace.view",
];

export function canAccessChefRoleUi(input: {
  workspaceRole: UserRole;
  granted: ReadonlySet<PermissionKey>;
  platformBypass?: boolean;
}): boolean {
  if (input.platformBypass) return true;
  if (input.workspaceRole === "OWNER") return true;
  return CHEF_ROLE_UI_PERMISSIONS.some((permission) =>
    hasPermission(input.granted, permission),
  );
}
