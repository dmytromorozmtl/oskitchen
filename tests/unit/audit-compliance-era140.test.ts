import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  AUDIT_COMPLIANCE_ERA140_CANONICAL_POLICY_ID,
  AUDIT_COMPLIANCE_ERA140_CAPABILITIES,
  AUDIT_COMPLIANCE_ERA140_CATEGORIES,
  AUDIT_COMPLIANCE_ERA140_POLICY_ID,
  AUDIT_COMPLIANCE_ERA140_ROUTE,
  AUDIT_COMPLIANCE_ERA140_SERVICE,
  AUDIT_COMPLIANCE_ERA140_SOC2_CONTROLS,
  AUDIT_COMPLIANCE_ERA140_SUMMARY_ARTIFACT,
  AUDIT_COMPLIANCE_ERA140_WIRING_PATHS,
} from "@/lib/enterprise/audit-compliance-era140-policy";
import {
  auditAuditComplianceSmokeWiring,
  buildAuditComplianceSmokeEra140Summary,
  resolveAuditComplianceSmokeEra140ProofStatus,
} from "@/lib/enterprise/audit-compliance-smoke-summary";
import {
  buildAuditComplianceDashboard,
  buildSoc2ControlChecks,
} from "@/lib/enterprise/audit-compliance-builders";
import { AUDIT_COMPLIANCE_POLICY_ID } from "@/lib/enterprise/audit-compliance-policy";

const ROOT = process.cwd();

function kpis() {
  return {
    eventsToday: 8,
    warnings: 1,
    critical: 0,
    failedWebhooks: 0,
    permissionChanges: 3,
    importsCommitted: 1,
    billingEvents: 0,
    suspicious: 0,
  };
}

describe("audit compliance era140", () => {
  it("locks era140 policy and artifact path", () => {
    expect(AUDIT_COMPLIANCE_ERA140_POLICY_ID).toBe("era140-audit-compliance-v1");
    expect(AUDIT_COMPLIANCE_ERA140_SUMMARY_ARTIFACT).toBe(
      "artifacts/audit-compliance-smoke-summary.json",
    );
    expect(AUDIT_COMPLIANCE_ERA140_ROUTE).toBe("/dashboard/enterprise/audit");
    expect(AUDIT_COMPLIANCE_ERA140_SOC2_CONTROLS).toHaveLength(5);
    expect(AUDIT_COMPLIANCE_ERA140_CATEGORIES).toHaveLength(7);
    expect(AUDIT_COMPLIANCE_ERA140_CAPABILITIES).toHaveLength(3);
  });

  it("aligns era140 with canonical audit compliance policy", () => {
    expect(AUDIT_COMPLIANCE_ERA140_CANONICAL_POLICY_ID).toBe(AUDIT_COMPLIANCE_POLICY_ID);
  });

  it("audits in-repo Audit & Compliance wiring", () => {
    const audit = auditAuditComplianceSmokeWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of AUDIT_COMPLIANCE_ERA140_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes SOC2 audit trail retention export wiring", () => {
    const service = readFileSync(join(ROOT, AUDIT_COMPLIANCE_ERA140_SERVICE), "utf8");
    expect(service).toContain("loadEnterpriseAuditComplianceDashboard");
    expect(service).toContain("loadAuditRetentionPolicy");

    const panel = readFileSync(
      join(ROOT, "components/enterprise/audit-compliance-panel.tsx"),
      "utf8",
    );
    expect(panel).toContain("audit-compliance-panel");
    expect(panel).toContain("soc2-control-");

    const checks = buildSoc2ControlChecks({
      workspaceId: "ws-era140",
      retentionDays: 365,
      retentionConfigured: true,
      kpis: kpis(),
      eventsLast30Days: 200,
      redactedEvents: 5,
      exportsCompleted: 1,
      categoryCounts: { SECURITY: 10 },
      recentCritical: [],
    });
    expect(checks).toHaveLength(5);
    expect(checks.find((c) => c.id === "cc7_3")?.readiness).toBe("ready");

    const dashboard = buildAuditComplianceDashboard({
      workspaceId: "ws-era140",
      retentionDays: 365,
      retentionConfigured: true,
      kpis: kpis(),
      eventsLast30Days: 200,
      redactedEvents: 5,
      exportsCompleted: 1,
      categoryCounts: { SECURITY: 10 },
      recentCritical: [],
    });
    expect(dashboard.complianceScore).toBeGreaterThan(0);
    expect(dashboard.soc2CertificationStatus).toBe("not_certified");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveAuditComplianceSmokeEra140ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveAuditComplianceSmokeEra140ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildAuditComplianceSmokeEra140Summary({
      certPassed: true,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.capabilities).toContain("soc2_controls");
  });
});
