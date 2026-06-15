import type { StaffRoleType, UserRole } from "@prisma/client";

import { workspacePermissionsFromCapabilities } from "@/lib/permissions/capability-to-workspace";
import { STAFF_TEMPLATE_CAPABILITIES } from "@/lib/permissions/permission-matrix";
import {
  defaultPermissionsForWorkspaceRole,
  type PermissionKey,
} from "@/lib/permissions/permissions";

/**
 * RBAC Phase D — resolve workspace matrix from staff template (StaffMember.roleType).
 * Falls back to coarse OWNER/STAFF when template unknown.
 */
export function workspacePermissionsFromStaffTemplate(
  roleType: StaffRoleType | null | undefined,
  workspaceRole: UserRole,
): Set<PermissionKey> {
  if (workspaceRole === "OWNER") {
    return defaultPermissionsForWorkspaceRole("OWNER");
  }
  if (!roleType) {
    return defaultPermissionsForWorkspaceRole("STAFF");
  }
  const caps = STAFF_TEMPLATE_CAPABILITIES[roleType];
  if (!caps?.length) {
    return defaultPermissionsForWorkspaceRole("STAFF");
  }
  const fromTemplate = workspacePermissionsFromCapabilities(caps);
  if (fromTemplate.size === 0) {
    return defaultPermissionsForWorkspaceRole("STAFF");
  }
  return fromTemplate;
}
