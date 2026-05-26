/**
 * Legacy dashboard / POS permission matrix (OWNER, ADMIN, KITCHEN_STAFF, …).
 *
 * @deprecated Import from `@/lib/permissions/legacy` explicitly.
 * Workspace-scoped RBAC: `@/lib/permissions/index` (different `hasPermission` signature).
 */
import type { OrganizationMemberRole, UserRole, WorkspaceMemberRole } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export const PERMISSION_KEYS = [
  "view_dashboard",
  "manage_orders",
  "manage_menus",
  "manage_products",
  "manage_integrations",
  "manage_billing",
  "manage_team",
  "view_analytics",
  "manage_production",
  "manage_packing",
  "manage_inventory",
  "manage_customers",
  "manage_reports",
  "manage_settings",
  "view_developer",
  "manage_partner_clients",
  "pos_access",
  "pos_comp",
] as const;

export type PermissionKey = (typeof PERMISSION_KEYS)[number];

export type AppRole =
  | "OWNER"
  | "ADMIN"
  | "MANAGER"
  | "KITCHEN_LEAD"
  | "KITCHEN_STAFF"
  | "PACKING_STAFF"
  | "DELIVERY_STAFF"
  | "ACCOUNTANT"
  | "VIEWER"
  | "PARTNER_CONSULTANT";

const all = [...PERMISSION_KEYS];

export const ROLE_PERMISSIONS: Record<AppRole, PermissionKey[]> = {
  OWNER: all,
  ADMIN: all.filter((p) => p !== "manage_billing" && p !== "view_developer"),
  MANAGER: [
    "view_dashboard",
    "manage_orders",
    "manage_menus",
    "manage_products",
    "view_analytics",
    "manage_production",
    "manage_packing",
    "manage_inventory",
    "manage_customers",
    "manage_reports",
    "pos_access",
    "pos_comp",
  ],
  KITCHEN_LEAD: [
    "view_dashboard",
    "manage_production",
    "manage_packing",
    "manage_inventory",
    "manage_orders",
    "pos_access",
  ],
  KITCHEN_STAFF: ["view_dashboard", "manage_production", "pos_access"],
  PACKING_STAFF: ["view_dashboard", "manage_packing"],
  DELIVERY_STAFF: ["view_dashboard", "manage_orders"],
  ACCOUNTANT: ["view_dashboard", "view_analytics", "manage_reports", "manage_billing"],
  VIEWER: ["view_dashboard"],
  PARTNER_CONSULTANT: ["view_dashboard", "manage_partner_clients", "manage_reports", "view_analytics"],
};

export function normalizeRole(
  role: UserRole | WorkspaceMemberRole | OrganizationMemberRole | AppRole | string | null | undefined,
): AppRole {
  if (!role) return "VIEWER";
  if (role === "STAFF") return "KITCHEN_STAFF";
  if (role === "PARTNER") return "PARTNER_CONSULTANT";
  if (role in ROLE_PERMISSIONS) return role as AppRole;
  return "VIEWER";
}

/** Legacy role-string permission check for POS and dashboard UI gates. */
export function hasLegacyPermission(role: string | null | undefined, permission: PermissionKey): boolean {
  return ROLE_PERMISSIONS[normalizeRole(role)].includes(permission);
}

/** @deprecated Use `hasLegacyPermission` — kept for gradual migration. */
export const hasPermission = hasLegacyPermission;

export async function getUserRole(userId: string): Promise<UserRole | null> {
  const profile = await prisma.userProfile.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  return profile?.role ?? null;
}

export async function isOwner(userId: string): Promise<boolean> {
  const role = await getUserRole(userId);
  return role === "OWNER";
}

export async function requireOwnerRole(userId: string): Promise<void> {
  if (!(await isOwner(userId))) {
    throw new Error("FORBIDDEN");
  }
}
