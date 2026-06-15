import { hasPermission } from "@/lib/permissions/guards";
import type { PermissionKey } from "@/lib/permissions/permissions";

export type AuditViewerRole = "owner" | "admin" | "manager" | "staff" | "other";

export type AuditViewCapability =
  | "view_audit_logs"
  | "view_sensitive_audit_detail"
  | "export_audit_logs"
  | "manage_retention_policy";

function normalizeRole(role: string | null | undefined): AuditViewerRole {
  const r = (role ?? "").toLowerCase();
  if (r === "owner") return "owner";
  if (r === "admin") return "admin";
  if (r === "manager" || r === "kitchen_lead" || r === "customer_service") return "manager";
  if (r === "staff") return "staff";
  return "other";
}

export function auditViewerFromProfile(
  email: string | null | undefined,
  role: string | null | undefined,
  platformBypass = false,
): {
  role: AuditViewerRole;
  isSuper: boolean;
} {
  return {
    role: normalizeRole(role),
    isSuper: platformBypass,
  };
}

export function canViewAuditLogs(
  email: string | null | undefined,
  role: string | null | undefined,
  platformBypass = false,
): boolean {
  if (platformBypass) return true;
  const r = normalizeRole(role);
  return r === "owner" || r === "admin" || r === "manager";
}

export function canViewSensitiveAuditDetail(
  email: string | null | undefined,
  role: string | null | undefined,
  platformBypass = false,
): boolean {
  if (platformBypass) return true;
  const r = normalizeRole(role);
  return r === "owner" || r === "admin";
}

/** Canonical gate: full before/after/diff JSON requires `audit.export` (or platform bypass). */
export function canViewSensitiveAuditDetailFromGrants(
  granted: ReadonlySet<PermissionKey>,
  platformBypass = false,
): boolean {
  if (platformBypass) return true;
  return hasPermission(granted, "audit.export");
}

export function canExportAuditLogs(
  email: string | null | undefined,
  role: string | null | undefined,
  platformBypass = false,
): boolean {
  if (platformBypass) return true;
  const r = normalizeRole(role);
  return r === "owner" || r === "admin";
}

export function canManageRetentionPolicy(
  email: string | null | undefined,
  role: string | null | undefined,
  platformBypass = false,
): boolean {
  if (platformBypass) return true;
  const r = normalizeRole(role);
  return r === "owner" || r === "admin";
}

/** Managers see operational categories; security/developer categories are restricted. */
export function managerAllowedCategory(category: string | null | undefined): boolean {
  if (!category) return true;
  const c = category.toUpperCase();
  const blocked = new Set(["SECURITY", "DEVELOPER", "PERMISSIONS", "AUTH"]);
  return !blocked.has(c);
}
