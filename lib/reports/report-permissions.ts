import { isSuperAdminEmail } from "@/lib/platform-owner";
import { hasPermission } from "@/lib/permissions/guards";
import type { PermissionKey } from "@/lib/permissions/permissions";

import type { ReportDefinition, ReportPermission } from "@/lib/reports/report-types";

export type ReportActorScope = {
  isOwner: boolean;
  role?: string | null;
  email?: string | null;
  /** When set, export gates use canonical workspace permissions first. */
  granted?: ReadonlySet<PermissionKey>;
};

export function isSuperAdminReports(scope: ReportActorScope): boolean {
  return isSuperAdminEmail(scope.email);
}

/**
 * Role-based gating. Permissions intentionally err on the side of
 * being readable for operational reports and restrictive for
 * financial / PII / audit reports.
 */
export function canDoReports(scope: ReportActorScope, permission: ReportPermission): boolean {
  if (isSuperAdminReports(scope)) return true;
  if (scope.isOwner) return true;
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
      if (scope.granted) {
        return hasPermission(scope.granted, "reports.export");
      }
      return ["manager", "admin", "accountant", "kitchen_lead", "purchasing", "sales"].includes(role);
    case "reports.saved.manage":
      return ["manager", "admin", "accountant"].includes(role);
    default:
      return false;
  }
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
