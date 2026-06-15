import type { UserRole } from "@prisma/client";

/** Prisma workspace roles today — extended RBAC roles are mapped in `permissions.ts`. */
export const WORKSPACE_PRISMA_ROLES: readonly UserRole[] = ["OWNER", "STAFF"];

/** Product vocabulary for future staff roles (server enforcement lands in permission-service). */
export const WORKSPACE_ROLE_CATALOG = [
  "OWNER",
  "ADMIN",
  "MANAGER",
  "KITCHEN_LEAD",
  "PREP_COOK",
  "PACKER",
  "DRIVER",
  "CUSTOMER_SERVICE",
  "CATERING_COORDINATOR",
  "PURCHASING",
  "ACCOUNTANT",
  "VIEWER",
] as const;

export type WorkspaceRoleCatalogId = (typeof WORKSPACE_ROLE_CATALOG)[number];
