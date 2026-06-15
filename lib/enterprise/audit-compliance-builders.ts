import {
  AUDIT_COMPLIANCE_CATEGORY_BREAKDOWN,
  AUDIT_COMPLIANCE_PATH,
  AUDIT_COMPLIANCE_POLICY_ID,
  AUDIT_COMPLIANCE_SOC2_CERTIFICATION_STATUS,
  AUDIT_COMPLIANCE_SOC2_CONTROLS,
} from "@/lib/enterprise/audit-compliance-policy";
import type {
  AuditCategoryBreakdown,
  AuditComplianceDashboard,
  AuditCriticalEvent,
  Soc2ControlCheck,
  Soc2ControlReadiness,
} from "@/lib/enterprise/audit-compliance-types";
import type { AuditKpis } from "@/services/audit/audit-query-service";

export type AuditComplianceBuildInput = {
  workspaceId: string;
  retentionDays: number;
  retentionConfigured: boolean;
  kpis: AuditKpis;
  eventsLast30Days: number;
  redactedEvents: number;
  exportsCompleted: number;
  categoryCounts: Record<string, number>;
  recentCritical: AuditCriticalEvent[];
  analyzedAt?: Date;
};

function readinessScore(level: Soc2ControlReadiness): number {
  if (level === "ready") return 100;
  if (level === "partial") return 60;
  return 20;
}

function resolveSoc2ControlReadiness(
  controlId: string,
  input: AuditComplianceBuildInput,
): { readiness: Soc2ControlReadiness; detail: string } {
  switch (controlId) {
    case "cc6_1":
      return input.eventsLast30Days > 0
        ? { readiness: "ready", detail: `${input.eventsLast30Days} scoped events in 30 days` }
        : { readiness: "partial", detail: "Audit trail wired — awaiting production events" };
    case "cc6_3":
      return input.kpis.permissionChanges > 0
        ? {
            readiness: "ready",
            detail: `${input.kpis.permissionChanges} permission/role events recorded`,
          }
        : { readiness: "partial", detail: "PERMISSIONS category active — no changes yet" };
    case "cc7_1":
      return input.kpis.warnings + input.kpis.critical + input.kpis.suspicious > 0
        ? {
            readiness: "ready",
            detail: `${input.kpis.warnings} warnings · ${input.kpis.critical} critical`,
          }
        : { readiness: "partial", detail: "Monitoring taxonomy ready — no alerts in window" };
    case "cc7_2":
      return input.redactedEvents > 0 || input.eventsLast30Days > 0
        ? {
            readiness: "ready",
            detail: `${input.redactedEvents} redacted rows · immutable append-only log`,
          }
        : { readiness: "partial", detail: "Redaction engine wired — awaiting events" };
    case "cc7_3":
      return input.retentionConfigured && input.exportsCompleted > 0
        ? {
            readiness: "ready",
            detail: `${input.retentionDays}d retention · ${input.exportsCompleted} export(s)`,
          }
        : input.retentionConfigured
          ? { readiness: "partial", detail: `${input.retentionDays}d retention — run first export` }
          : { readiness: "partial", detail: "Default 365d retention — configure policy row" };
    default:
      return { readiness: "gap", detail: "Control not mapped" };
  }
}

export function buildSoc2ControlChecks(input: AuditComplianceBuildInput): Soc2ControlCheck[] {
  return AUDIT_COMPLIANCE_SOC2_CONTROLS.map((control) => {
    const { readiness, detail } = resolveSoc2ControlReadiness(control.id, input);
    return {
      id: control.id,
      tsc: control.tsc,
      label: control.label,
      evidence: control.evidence,
      readiness,
      detail,
    };
  });
}

export function buildCategoryBreakdown(
  categoryCounts: Record<string, number>,
): AuditCategoryBreakdown[] {
  return AUDIT_COMPLIANCE_CATEGORY_BREAKDOWN.map((category) => ({
    category,
    count: categoryCounts[category] ?? 0,
  }));
}

export function buildAuditComplianceDashboard(
  input: AuditComplianceBuildInput,
): AuditComplianceDashboard {
  const soc2Controls = buildSoc2ControlChecks(input);
  const complianceScore = Math.round(
    soc2Controls.reduce((sum, row) => sum + readinessScore(row.readiness), 0) /
      Math.max(1, soc2Controls.length),
  );

  const warnings: string[] = [];
  warnings.push(
    "SOC 2 Type II is not certified — this dashboard is readiness evidence for auditors, not an attestation.",
  );
  if (input.kpis.critical > 0) {
    warnings.push(`${input.kpis.critical} CRITICAL audit event(s) require review.`);
  }
  if (!input.retentionConfigured) {
    warnings.push("No custom retention policy — using default 365-day retention.");
  }

  return {
    policyId: AUDIT_COMPLIANCE_POLICY_ID,
    workspaceId: input.workspaceId,
    generatedAtIso: (input.analyzedAt ?? new Date()).toISOString(),
    soc2CertificationStatus: AUDIT_COMPLIANCE_SOC2_CERTIFICATION_STATUS,
    retentionDays: input.retentionDays,
    retentionConfigured: input.retentionConfigured,
    kpis: {
      eventsToday: input.kpis.eventsToday,
      eventsLast30Days: input.eventsLast30Days,
      warnings: input.kpis.warnings,
      critical: input.kpis.critical,
      permissionChanges: input.kpis.permissionChanges,
      failedWebhooks: input.kpis.failedWebhooks,
      exportsCompleted: input.exportsCompleted,
      redactedEvents: input.redactedEvents,
    },
    categoryBreakdown: buildCategoryBreakdown(input.categoryCounts),
    soc2Controls,
    recentCritical: input.recentCritical,
    complianceScore,
    warnings,
    basePath: AUDIT_COMPLIANCE_PATH,
  };
}
