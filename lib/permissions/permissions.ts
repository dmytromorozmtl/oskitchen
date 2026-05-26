import type { UserRole } from "@prisma/client";

export const PERMISSIONS = {
  "workspace.view": "View workspace",
  "workspace.settings": "Manage workspace settings",
  "orders.manage": "Create and update orders",
  "orders.void": "Void or cancel orders",
  "products.edit": "Create and edit products",
  "payroll.view": "View payroll exports",
  "customers.manage": "Manage CRM customers and segments",
  "production.manage": "Operate production boards",
  "packing.manage": "Operate packing",
  "routes.manage": "Plan and dispatch routes",
  "billing.manage": "Manage billing",
  "integrations.manage": "Connect sales channels",
  "staff.manage": "Invite and manage staff",
  "growth.view": "View growth / beta surfaces",
} as const;

export type PermissionKey = keyof typeof PERMISSIONS;

const OWNER_LIKE: readonly PermissionKey[] = [
  "workspace.view",
  "workspace.settings",
  "orders.manage",
  "orders.void",
  "products.edit",
  "payroll.view",
  "customers.manage",
  "production.manage",
  "packing.manage",
  "routes.manage",
  "billing.manage",
  "integrations.manage",
  "staff.manage",
  "growth.view",
];

const STAFF_OPS: readonly PermissionKey[] = [
  "workspace.view",
  "orders.manage",
  "production.manage",
  "packing.manage",
  "routes.manage",
];

export function defaultPermissionsForWorkspaceRole(role: UserRole): Set<PermissionKey> {
  if (role === "OWNER") return new Set(OWNER_LIKE);
  return new Set(STAFF_OPS);
}
