/**
 * Fine-grained POS capability keys (for `StaffRole.permissionsJson` and future RBAC).
 * Workspace `UserRole` gates coarse access today; these strings stay stable for migrations.
 */
export const POS_PERMISSION_KEYS = [
  "pos:access",
  "pos:sell",
  "pos:discount",
  "pos:comp",
  "pos:void",
  "pos:refund",
  "pos:open-shift",
  "pos:close-shift",
  "pos:view-reports",
  "pos:manage-registers",
  "pos:manage-settings",
] as const;

export type PosPermissionKey = (typeof POS_PERMISSION_KEYS)[number];
