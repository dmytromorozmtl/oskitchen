import { isSuperAdminEmail } from "@/lib/platform-owner";
import { hasPermission } from "@/lib/permissions/guards";
import type { PermissionKey } from "@/lib/permissions/permissions";
import { reportPermissionKey } from "@/lib/reports/report-permission-keys";

import type { ReportDefinition, ReportPermission } from "@/lib/reports/report-types";

export type ReportActorScope = {
  isOwner: boolean;
  role?: string | null;
  email?: string | null;
  /** When set, report gates prefer canonical workspace permissions, then legacy role strings. */
  granted?: ReadonlySet<PermissionKey>;
};

export function isSuperAdminReports(scope: ReportActorScope): boolean {
  return isSuperAdminEmail(scope.email);
}

function legacyRoleAllows(scope: ReportActorScope, permission: ReportPermission): boolean {
  const role = (scope.role ?? "").toLowerCase();

  switch (permission) {
    case "reports.read.operations":
      return [
        "manager",
        "admin",
        "kitchen_lead",
        "kitchen",
        "production",
        "packer",
        "packing",
        "driver",
        "dispatcher",
        "sales",
        "accountant",
        "viewer",
      ].includes(role);
    case "reports.read.financial":
      return ["manager", "admin", "accountant"].includes(role);
    case "reports.read.customer_pii":
      return ["manager", "admin"].includes(role);
    case "reports.read.audit":
      return ["admin"].includes(role);
    case "reports.export":
      return ["manager", "admin", "accountant", "kitchen_lead", "purchasing", "sales"].includes(role);
    case "reports.saved.manage":
      return ["manager", "admin", "accountant"].includes(role);
    default:
      return false;
  }
}

/**
 * Role-based gating. Permissions intentionally err on the side of
 * being readable for operational reports and restrictive for
 * financial / PII / audit reports.
 */
export function canDoReports(scope: ReportActorScope, permission: ReportPermission): boolean {
  if (isSuperAdminReports(scope)) return true;
  if (scope.isOwner) return true;

  const canonical = reportPermissionKey(permission);
  if (scope.granted && canonical && hasPermission(scope.granted, canonical)) {
    return true;
  }

  return legacyRoleAllows(scope, permission);
}

export function canViewReport(scope: ReportActorScope, def: ReportDefinition): boolean {
  return canDoReports(scope, def.requiredPermission);
}

export function visibleReports<T extends ReportDefinition>(
  scope: ReportActorScope,
  definitions: T[],
): T[] {
  return definitions.filter((d) => canViewReport(scope, d));
}
