import type { StaffRoleType, UserRole } from "@prisma/client";

import { isSuperAdminEmail } from "@/lib/platform-owner";
import type { PermissionKey } from "@/lib/permissions/permissions";
import { defaultPermissionsForWorkspaceRole } from "@/lib/permissions/permissions";
import { workspacePermissionsFromStaffTemplate } from "@/lib/permissions/staff-template-workspace-permissions";

export type PermissionContext = {
  userId: string;
  email: string | null;
  workspaceRole: UserRole;
  platformBypass: boolean;
  /** RBAC Phase D — when session user is a linked StaffMember. */
  staffRoleType?: StaffRoleType | null;
};

export function resolveWorkspacePermissions(ctx: PermissionContext): Set<PermissionKey> {
  if (ctx.platformBypass || isSuperAdminEmail(ctx.email)) {
    return new Set(defaultPermissionsForWorkspaceRole("OWNER"));
  }
  if (ctx.workspaceRole === "OWNER") {
    return defaultPermissionsForWorkspaceRole("OWNER");
  }
  return workspacePermissionsFromStaffTemplate(ctx.staffRoleType, ctx.workspaceRole);
}
