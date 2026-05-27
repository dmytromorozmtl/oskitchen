import { isSuperAdminEmail } from "@/lib/platform-owner";
import { hasPermission } from "@/lib/permissions/guards";
import type { PermissionKey } from "@/lib/permissions/permissions";
import { executivePermissionKey } from "@/lib/executive/executive-permission-keys";

export type ExecutivePermission =
  | "executive.view"
  | "executive.read.financial"
  | "executive.read.customer_pii"
  | "executive.read.operations"
  | "executive.read.brand_location"
  | "executive.export"
  | "executive.insights.manage";

export type ExecutiveActorScope = {
  isOwner: boolean;
  role?: string | null;
  email?: string | null;
  granted?: ReadonlySet<PermissionKey>;
};

export function isSuperAdminExecutive(scope: ExecutiveActorScope): boolean {
  return isSuperAdminEmail(scope.email);
}

/**
 * Role gating for the Executive Command Center. Owners and superadmin
 * always have full access; other roles get an operational subset and
 * are denied financial / PII surfaces unless they're explicitly an
 * accountant / manager / admin.
 */
export function canViewExecutive(
  scope: ExecutiveActorScope,
  permission: ExecutivePermission,
): boolean {
  if (isSuperAdminExecutive(scope)) return true;
  if (scope.isOwner) return true;

  const canonical = executivePermissionKey(permission);
  if (scope.granted && canonical && hasPermission(scope.granted, canonical)) {
    return true;
  }

  const role = (scope.role ?? "").toLowerCase();

  switch (permission) {
    case "executive.view":
    case "executive.read.operations":
      return [
        "manager",
        "admin",
        "accountant",
        "kitchen_lead",
        "kitchen",
        "production",
        "packer",
        "packing",
        "driver",
        "dispatcher",
        "sales",
        "viewer",
      ].includes(role);
    case "executive.read.financial":
      return ["manager", "admin", "accountant"].includes(role);
    case "executive.read.customer_pii":
      return ["manager", "admin"].includes(role);
    case "executive.read.brand_location":
      return ["manager", "admin", "accountant", "sales"].includes(role);
    case "executive.export":
      return ["manager", "admin", "accountant"].includes(role);
    case "executive.insights.manage":
      return ["manager", "admin"].includes(role);
    default:
      return false;
  }
}
