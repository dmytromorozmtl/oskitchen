import type { UserRole } from "@prisma/client";

import { hasPermission } from "@/lib/permissions/guards";
import type { PermissionKey } from "@/lib/permissions/permissions";

const CASHIER_ROLE_UI_PERMISSIONS: PermissionKey[] = [
  "pos.access",
  "orders.manage",
  "workspace.view",
];

export function canAccessCashierRoleUi(input: {
  workspaceRole: UserRole;
  granted: ReadonlySet<PermissionKey>;
  platformBypass?: boolean;
}): boolean {
  if (input.platformBypass) return true;
  if (input.workspaceRole === "OWNER") return true;
  return CASHIER_ROLE_UI_PERMISSIONS.some((permission) =>
    hasPermission(input.granted, permission),
  );
}
