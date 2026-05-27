import { hasPermission } from "@/lib/permissions/guards";
import type { PermissionKey } from "@/lib/permissions/permissions";

export function canViewCustomers(granted: ReadonlySet<PermissionKey>): boolean {
  return (
    hasPermission(granted, "customers.read") || hasPermission(granted, "customers.manage")
  );
}

export function canManageCustomers(granted: ReadonlySet<PermissionKey>): boolean {
  return hasPermission(granted, "customers.manage");
}
