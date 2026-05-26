import { isSuperAdminEmail } from "@/lib/platform-owner";

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

export function auditViewerFromProfile(email: string | null | undefined, role: string | null | undefined): {
  role: AuditViewerRole;
  isSuper: boolean;
} {
  return {
    role: normalizeRole(role),
    isSuper: isSuperAdminEmail(email),
  };
}

export function canViewAuditLogs(email: string | null | undefined, role: string | null | undefined): boolean {
  if (isSuperAdminEmail(email)) return true;
  const r = normalizeRole(role);
  return r === "owner" || r === "admin" || r === "manager";
}

export function canViewSensitiveAuditDetail(
  email: string | null | undefined,
  role: string | null | undefined,
): boolean {
  if (isSuperAdminEmail(email)) return true;
  const r = normalizeRole(role);
  return r === "owner" || r === "admin";
}

export function canExportAuditLogs(email: string | null | undefined, role: string | null | undefined): boolean {
  if (isSuperAdminEmail(email)) return true;
  const r = normalizeRole(role);
  return r === "owner" || r === "admin";
}

export function canManageRetentionPolicy(
  email: string | null | undefined,
  role: string | null | undefined,
): boolean {
  if (isSuperAdminEmail(email)) return true;
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
