import { describe, expect, it } from "vitest";

import {
  buildAuditComplianceDashboard,
  buildCategoryBreakdown,
  buildSoc2ControlChecks,
} from "@/lib/enterprise/audit-compliance-builders";
import {
  AUDIT_COMPLIANCE_POLICY_ID,
  AUDIT_COMPLIANCE_SOC2_CONTROLS,
} from "@/lib/enterprise/audit-compliance-policy";
import type { AuditKpis } from "@/services/audit/audit-query-service";

function kpis(partial: Partial<AuditKpis> = {}): AuditKpis {
  return {
    eventsToday: 12,
    warnings: 2,
    critical: 1,
    failedWebhooks: 0,
    permissionChanges: 4,
    importsCommitted: 3,
    billingEvents: 1,
    suspicious: 0,
    ...partial,
  };
}

describe("audit & compliance (ENT-67)", () => {
  it("locks ENT-67 policy id and five SOC2 controls", () => {
    expect(AUDIT_COMPLIANCE_POLICY_ID).toBe("audit-compliance-ent67-v1");
    expect(AUDIT_COMPLIANCE_SOC2_CONTROLS).toHaveLength(5);
  });

  it("builds category breakdown for all monitored categories", () => {
    const rows = buildCategoryBreakdown({
      SECURITY: 10,
      PERMISSIONS: 4,
      BILLING: 2,
    });
    expect(rows).toHaveLength(7);
    expect(rows.find((r) => r.category === "SECURITY")?.count).toBe(10);
    expect(rows.find((r) => r.category === "WEBHOOKS")?.count).toBe(0);
  });

  it("marks CC7.3 ready when retention and exports exist", () => {
    const checks = buildSoc2ControlChecks({
      workspaceId: "ws-1",
      retentionDays: 365,
      retentionConfigured: true,
      kpis: kpis(),
      eventsLast30Days: 500,
      redactedEvents: 12,
      exportsCompleted: 2,
      categoryCounts: { SECURITY: 10 },
      recentCritical: [],
    });
    const retention = checks.find((c) => c.id === "cc7_3");
    expect(retention?.readiness).toBe("ready");
  });

  it("assembles full audit compliance dashboard", () => {
    const dashboard = buildAuditComplianceDashboard({
      workspaceId: "ws-1",
      retentionDays: 730,
      retentionConfigured: true,
      kpis: kpis({ critical: 0 }),
      eventsLast30Days: 1200,
      redactedEvents: 45,
      exportsCompleted: 3,
      categoryCounts: { SECURITY: 80, PERMISSIONS: 12 },
      recentCritical: [
        {
          id: "e1",
          createdAtIso: "2026-06-05T12:00:00.000Z",
          action: "SECURITY_SUSPICIOUS_ACTIVITY",
          severity: "WARNING",
          category: "SECURITY",
          actorEmail: "ops@acme.com",
        },
      ],
    });
    expect(dashboard.policyId).toBe(AUDIT_COMPLIANCE_POLICY_ID);
    expect(dashboard.soc2CertificationStatus).toBe("not_certified");
    expect(dashboard.complianceScore).toBeGreaterThan(50);
    expect(dashboard.soc2Controls).toHaveLength(5);
    expect(dashboard.recentCritical).toHaveLength(1);
    expect(dashboard.warnings.some((w) => w.includes("not certified"))).toBe(true);
    expect(dashboard.basePath).toBe("/dashboard/enterprise/audit");
  });

  it("warns on critical events", () => {
    const dashboard = buildAuditComplianceDashboard({
      workspaceId: "ws-1",
      retentionDays: 365,
      retentionConfigured: false,
      kpis: kpis({ critical: 3 }),
      eventsLast30Days: 100,
      redactedEvents: 0,
      exportsCompleted: 0,
      categoryCounts: {},
      recentCritical: [],
    });
    expect(dashboard.warnings.some((w) => w.includes("CRITICAL"))).toBe(true);
    expect(dashboard.warnings.some((w) => w.includes("retention"))).toBe(true);
  });
});
