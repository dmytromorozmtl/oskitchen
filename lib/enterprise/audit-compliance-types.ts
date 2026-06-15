import type { AUDIT_COMPLIANCE_POLICY_ID } from "@/lib/enterprise/audit-compliance-policy";

export type Soc2ControlReadiness = "ready" | "partial" | "gap";

export type Soc2ControlCheck = {
  id: string;
  tsc: string;
  label: string;
  evidence: string;
  readiness: Soc2ControlReadiness;
  detail: string;
};

export type AuditCategoryBreakdown = {
  category: string;
  count: number;
};

export type AuditCriticalEvent = {
  id: string;
  createdAtIso: string;
  action: string;
  severity: string;
  category: string | null;
  actorEmail: string | null;
};

export type AuditComplianceDashboard = {
  policyId: typeof AUDIT_COMPLIANCE_POLICY_ID;
  workspaceId: string;
  generatedAtIso: string;
  soc2CertificationStatus: "not_certified";
  retentionDays: number;
  retentionConfigured: boolean;
  kpis: {
    eventsToday: number;
    eventsLast30Days: number;
    warnings: number;
    critical: number;
    permissionChanges: number;
    failedWebhooks: number;
    exportsCompleted: number;
    redactedEvents: number;
  };
  categoryBreakdown: AuditCategoryBreakdown[];
  soc2Controls: Soc2ControlCheck[];
  recentCritical: AuditCriticalEvent[];
  complianceScore: number;
  warnings: string[];
  basePath: string;
};
