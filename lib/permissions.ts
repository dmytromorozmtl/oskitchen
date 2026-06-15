/**
 * @deprecated Import `@/lib/permissions/legacy` for POS/dashboard role matrix,
 * or `@/lib/permissions/index` for workspace permission sets.
 *
 * This shim preserves existing imports during RBAC migration.
 */
export {
  PERMISSION_KEYS,
  ROLE_PERMISSIONS,
  type PermissionKey,
  type AppRole,
  normalizeRole,
  hasLegacyPermission,
  hasPermission,
  getUserRole,
  isOwner,
  requireOwnerRole,
} from "@/lib/permissions/legacy";
