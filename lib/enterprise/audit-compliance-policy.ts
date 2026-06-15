/**
 * ENT-67 — Audit & Compliance (SOC2-ready audit trail).
 *
 * @see services/enterprise/audit-service.ts
 * @see lib/enterprise/audit-compliance-builders.ts
 */

export const AUDIT_COMPLIANCE_POLICY_ID = "audit-compliance-ent67-v1" as const;

export const AUDIT_COMPLIANCE_PATH = "/dashboard/enterprise/audit" as const;

/** SOC 2 Type II is not certified — controls are readiness evidence only. */
export const AUDIT_COMPLIANCE_SOC2_CERTIFICATION_STATUS = "not_certified" as const;

export const AUDIT_COMPLIANCE_RECENT_CRITICAL_TAKE = 8 as const;

export const AUDIT_COMPLIANCE_CATEGORY_BREAKDOWN = [
  "SECURITY",
  "PERMISSIONS",
  "AUTH",
  "SALES_CHANNELS",
  "WEBHOOKS",
  "IMPORT_EXPORT",
  "BILLING",
] as const;

export const AUDIT_COMPLIANCE_SOC2_CONTROLS = [
  {
    id: "cc6_1",
    tsc: "CC6.1",
    label: "Logical access controls",
    evidence: "RBAC + workspace-scoped audit queries",
  },
  {
    id: "cc6_3",
    tsc: "CC6.3",
    label: "Role & permission changes logged",
    evidence: "PERMISSIONS category + ROLE_* actions",
  },
  {
    id: "cc7_1",
    tsc: "CC7.1",
    label: "Security event monitoring",
    evidence: "Severity WARNING/CRITICAL + security tab",
  },
  {
    id: "cc7_2",
    tsc: "CC7.2",
    label: "Immutable audit trail with PII redaction",
    evidence: "Central auditLog writer + redactionApplied flag",
  },
  {
    id: "cc7_3",
    tsc: "CC7.3",
    label: "Retention & export for auditors",
    evidence: "Retention policy + CSV/JSON export jobs",
  },
] as const;
