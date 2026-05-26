/**
 * Canonical workspace RBAC import path.
 *
 * Dashboard / POS legacy keys: import from `@/lib/permissions` (root shim).
 * Workspace matrix: import from this module.
 */

export {
  PERMISSIONS,
  type PermissionKey as WorkspacePermissionKey,
  defaultPermissionsForWorkspaceRole,
} from "@/lib/permissions/permissions";

export { hasPermission } from "@/lib/permissions/guards";

export { WORKSPACE_PRISMA_ROLES, WORKSPACE_ROLE_CATALOG, type WorkspaceRoleCatalogId } from "@/lib/permissions/roles";

export {
  DEFAULT_APPROVAL_TTL_HOURS,
  approvalStatusForAction,
  type ApprovalStatus,
  type SensitiveAction,
} from "@/lib/permissions/approval-rules";
