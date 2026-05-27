import type { PermissionKey } from "@/lib/permissions/permissions";
import type { ReportPermission } from "@/lib/reports/report-types";

/** Report permissions stored in the workspace permission registry. */
export const WORKSPACE_REPORT_PERMISSIONS = [
  "reports.read.operations",
  "reports.read.financial",
  "reports.read.customer_pii",
  "reports.read.audit",
  "reports.export",
  "reports.saved.manage",
] as const satisfies readonly ReportPermission[];

export type WorkspaceReportPermission = (typeof WORKSPACE_REPORT_PERMISSIONS)[number];

export function isWorkspaceReportPermission(
  permission: ReportPermission,
): permission is WorkspaceReportPermission {
  return (WORKSPACE_REPORT_PERMISSIONS as readonly string[]).includes(permission);
}

export function reportPermissionKey(permission: ReportPermission): PermissionKey | null {
  if (!isWorkspaceReportPermission(permission)) return null;
  return permission;
}
