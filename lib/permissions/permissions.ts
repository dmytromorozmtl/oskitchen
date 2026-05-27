import type { UserRole } from "@prisma/client";

export const PERMISSIONS = {
  "workspace.view": "View workspace",
  "workspace.settings": "Manage workspace settings",
  "orders.manage": "Create and update orders",
  "orders.void": "Void or cancel orders",
  "pos.access": "Access POS surfaces",
  "pos.checkout": "Complete POS checkout",
  "pos.discount.apply": "Apply POS discounts or comp sales",
  "pos.refund": "Refund POS transactions",
  "pos.void": "Void POS transactions",
  "pos.shift.open": "Open POS shifts",
  "pos.shift.close": "Close POS shifts",
  "pos.register.manage": "Manage POS registers",
  "pos.hardware.manage": "Manage POS hardware settings",
  "pos.manager.override": "Approve manager-only POS overrides",
  "products.edit": "Create and edit products",
  "payroll.view": "View payroll exports",
  "customers.manage": "Manage CRM customers and segments",
  "production.manage": "Operate production boards",
  "kitchen.view": "View kitchen display tickets",
  "kitchen.bump": "Bump kitchen display tickets",
  "packing.manage": "Operate packing",
  "routes.manage": "Plan and dispatch routes",
  "billing.view": "View billing and subscription status",
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
  "pos.access",
  "pos.checkout",
  "pos.discount.apply",
  "pos.refund",
  "pos.void",
  "pos.shift.open",
  "pos.shift.close",
  "pos.register.manage",
  "pos.hardware.manage",
  "pos.manager.override",
  "products.edit",
  "payroll.view",
  "customers.manage",
  "production.manage",
  "kitchen.view",
  "kitchen.bump",
  "packing.manage",
  "routes.manage",
  "billing.view",
  "billing.manage",
  "integrations.manage",
  "staff.manage",
  "growth.view",
];

const STAFF_OPS: readonly PermissionKey[] = [
  "workspace.view",
  "orders.manage",
  "pos.access",
  "pos.checkout",
  "production.manage",
  "kitchen.view",
  "kitchen.bump",
  "packing.manage",
  "routes.manage",
];

export function defaultPermissionsForWorkspaceRole(role: UserRole): Set<PermissionKey> {
  if (role === "OWNER") return new Set(OWNER_LIKE);
  return new Set(STAFF_OPS);
}
