import type { UserRole } from "@prisma/client";

import { hasPermission } from "@/lib/permissions/guards";
import type { PermissionKey } from "@/lib/permissions/permissions";

const DRIVER_ROLE_UI_PERMISSIONS: PermissionKey[] = [
  "routes.manage",
  "packing.manage",
  "orders.manage",
  "workspace.view",
];

export function canAccessDriverRoleUi(input: {
  workspaceRole: UserRole;
  granted: ReadonlySet<PermissionKey>;
  platformBypass?: boolean;
}): boolean {
  if (input.platformBypass) return true;
  if (input.workspaceRole === "OWNER") return true;
  return DRIVER_ROLE_UI_PERMISSIONS.some((permission) =>
    hasPermission(input.granted, permission),
  );
}
