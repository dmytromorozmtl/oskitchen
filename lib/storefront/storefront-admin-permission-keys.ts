import type { PermissionKey } from "@/lib/permissions/permissions";
import type { StorefrontAdminPermission } from "@/lib/storefront/storefront-admin-access";

const READ_ADMIN_PERMISSIONS = new Set<StorefrontAdminPermission>(["storefront.orders"]);

/** Map storefront admin tab permissions to canonical workspace keys. */
export function workspacePermissionForStorefrontAdminPermission(
  permission: StorefrontAdminPermission,
): PermissionKey {
  if (READ_ADMIN_PERMISSIONS.has(permission)) {
    return "storefront.read";
  }
  return "storefront.manage";
}
