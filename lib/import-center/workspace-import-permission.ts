import type { ImportType } from "@prisma/client";

import { hasPermission } from "@/lib/permissions/guards";
import type { PermissionKey } from "@/lib/permissions/permissions";

import type { ImportCapability } from "@/lib/import-center/import-types";

/** Any of these grants read access to Import Center hub surfaces. */
export const IMPORT_CENTER_HUB_VIEW_PERMISSIONS: readonly PermissionKey[] = [
  "products.edit",
  "production.manage",
  "customers.manage",
  "orders.manage",
  "staff.manage",
  "workspace.settings",
];

/** Permissions that allow uploading at least one import type. */
export const IMPORT_CENTER_UPLOAD_PERMISSIONS: readonly PermissionKey[] = [
  ...IMPORT_CENTER_HUB_VIEW_PERMISSIONS,
];

const PRODUCT_LIKE_IMPORT_TYPES: readonly ImportType[] = [
  "PRODUCTS",
  "INGREDIENTS",
  "RECIPES",
  "NUTRITION_ALLERGENS",
  "PRODUCT_MAPPINGS",
  "MENU_ASSIGNMENTS",
  "PURCHASE_ITEMS",
  "BRANDS",
];

export function workspacePermissionForImportType(type: ImportType): PermissionKey {
  switch (type) {
    case "CUSTOMERS":
      return "customers.manage";
    case "ORDERS":
      return "orders.manage";
    case "STAFF":
      return "staff.manage";
    case "LOCATIONS":
    case "SUPPLIERS":
      return "workspace.settings";
    default:
      return "products.edit";
  }
}

export function workspacePermissionForImportCapability(
  capability: ImportCapability,
): PermissionKey | null {
  switch (capability) {
    case "import.commit":
    case "import.rollback":
      return "workspace.settings";
    case "import.view":
    case "import.history":
    case "import.templates":
    case "import.upload":
      return null;
    default:
      return null;
  }
}

export function canViewImportCenterHub(granted: ReadonlySet<PermissionKey>): boolean {
  return IMPORT_CENTER_HUB_VIEW_PERMISSIONS.some((permission) => hasPermission(granted, permission));
}

export function canUploadAnyImportType(granted: ReadonlySet<PermissionKey>): boolean {
  return IMPORT_CENTER_UPLOAD_PERMISSIONS.some((permission) => hasPermission(granted, permission));
}

export function canUploadImportType(
  granted: ReadonlySet<PermissionKey>,
  type: ImportType,
): boolean {
  const required = workspacePermissionForImportType(type);
  if (hasPermission(granted, required)) return true;
  if (
    PRODUCT_LIKE_IMPORT_TYPES.includes(type) &&
    hasPermission(granted, "production.manage")
  ) {
    return true;
  }
  return false;
}

export function canUseImportCenterCapability(
  granted: ReadonlySet<PermissionKey>,
  capability: ImportCapability,
): boolean {
  const direct = workspacePermissionForImportCapability(capability);
  if (direct) return hasPermission(granted, direct);
  if (capability === "import.upload") return canUploadAnyImportType(granted);
  return canViewImportCenterHub(granted);
}

export function canManageImportCenterSettings(granted: ReadonlySet<PermissionKey>): boolean {
  return hasPermission(granted, "workspace.settings");
}
