import { hasPermission } from "@/lib/permissions/guards";
import type { PermissionKey } from "@/lib/permissions/permissions";

export function canAccessStorefrontLoyaltyTab(
  granted: ReadonlySet<PermissionKey>,
  hubCanRead: boolean,
): boolean {
  return hubCanRead && hasPermission(granted, "loyalty.manage");
}
