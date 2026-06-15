/**
 * Audit & Compliance smoke summary — wiring audit (Era 140).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  AUDIT_COMPLIANCE_ERA140_CAPABILITIES,
  AUDIT_COMPLIANCE_ERA140_POLICY_ID,
  AUDIT_COMPLIANCE_ERA140_ROUTE,
  AUDIT_COMPLIANCE_ERA140_SERVICE,
  AUDIT_COMPLIANCE_ERA140_WIRING_PATHS,
} from "@/lib/enterprise/audit-compliance-era140-policy";

export const AUDIT_COMPLIANCE_SMOKE_SUMMARY_VERSION = AUDIT_COMPLIANCE_ERA140_POLICY_ID;

export type AuditComplianceSmokeEra140Overall = "PASSED" | "FAILED" | "SKIPPED";

export type AuditComplianceSmokeEra140ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type AuditComplianceSmokeEra140Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type AuditComplianceSmokeEra140Summary = {
  version: typeof AUDIT_COMPLIANCE_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: AuditComplianceSmokeEra140Overall;
  proofStatus: AuditComplianceSmokeEra140ProofStatus;
  wiringCertPassed: boolean;
  route: string;
  capabilities: readonly string[];
  steps: AuditComplianceSmokeEra140Step[];
  honestyNote: string;
};

export function auditAuditComplianceSmokeWiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];

  for (const rel of AUDIT_COMPLIANCE_ERA140_WIRING_PATHS) {
    const path = join(root, rel);
    if (!existsSync(path)) {
      failures.push(`missing ${rel}`);
      continue;
    }
    const src = readFileSync(path, "utf8");

    if (rel === AUDIT_COMPLIANCE_ERA140_SERVICE) {
      if (!src.includes("loadEnterpriseAuditComplianceDashboard")) {
        failures.push("audit-service.ts missing loadEnterpriseAuditComplianceDashboard");
      }
      if (!src.includes("getAuditKpis")) {
        failures.push("audit-service.ts missing getAuditKpis");
      }
      if (!src.includes("buildAuditWhere")) {
        failures.push("audit-service.ts missing buildAuditWhere");
      }
      if (!src.includes("buildAuditComplianceDashboard")) {
        failures.push("audit-service.ts missing buildAuditComplianceDashboard");
      }
      if (!src.includes("loadAuditRetentionPolicy")) {
        failures.push("audit-service.ts missing loadAuditRetentionPolicy");
      }
    }

    if (rel === "lib/enterprise/audit-compliance-builders.ts") {
      if (!src.includes("buildAuditComplianceDashboard")) {
        failures.push("audit-compliance-builders.ts missing buildAuditComplianceDashboard");
      }
      if (!src.includes("buildSoc2ControlChecks")) {
        failures.push("audit-compliance-builders.ts missing buildSoc2ControlChecks");
      }
      if (!src.includes("buildCategoryBreakdown")) {
        failures.push("audit-compliance-builders.ts missing buildCategoryBreakdown");
      }
      if (!src.includes("AUDIT_COMPLIANCE_SOC2_CONTROLS")) {
        failures.push("audit-compliance-builders.ts missing SOC2 controls");
      }
    }

    if (rel === "lib/enterprise/audit-compliance-policy.ts") {
      if (!src.includes("AUDIT_COMPLIANCE_POLICY_ID")) {
        failures.push("audit-compliance-policy.ts missing policy id");
      }
      if (!src.includes("AUDIT_COMPLIANCE_PATH")) {
        failures.push("audit-compliance-policy.ts missing route path");
      }
      if (!src.includes("AUDIT_COMPLIANCE_SOC2_CONTROLS")) {
        failures.push("audit-compliance-policy.ts missing SOC2 controls");
      }
      if (!src.includes("AUDIT_COMPLIANCE_CATEGORY_BREAKDOWN")) {
        failures.push("audit-compliance-policy.ts missing category breakdown");
      }
      if (!src.includes("AUDIT_COMPLIANCE_SOC2_CERTIFICATION_STATUS")) {
        failures.push("audit-compliance-policy.ts missing certification status");
      }
    }

    if (rel === "app/dashboard/enterprise/audit/page.tsx") {
      if (!src.includes("loadEnterpriseAuditComplianceDashboard")) {
        failures.push("audit page missing loadEnterpriseAuditComplianceDashboard");
      }
      if (!src.includes("AuditCompliancePanel")) {
        failures.push("audit page missing AuditCompliancePanel");
      }
      if (
        !src.includes(
          "SOC2-ready audit trail with retention, redaction, export, and control readiness scorecard",
        )
      ) {
        failures.push("audit page missing SOC2-ready copy");
      }
    }

    if (rel === "components/enterprise/audit-compliance-panel.tsx") {
      if (!src.includes("audit-compliance-panel")) {
        failures.push("audit-compliance-panel.tsx missing root test id");
      }
      if (!src.includes("SOC2-ready audit trail")) {
        failures.push("audit-compliance-panel.tsx missing SOC2-ready copy");
      }
      if (!src.includes("SOC 2 control readiness")) {
        failures.push("audit-compliance-panel.tsx missing SOC2 control section");
      }
      if (!src.includes("soc2-controls-card")) {
        failures.push("audit-compliance-panel.tsx missing soc2-controls-card test id");
      }
      if (!src.includes("Category breakdown")) {
        failures.push("audit-compliance-panel.tsx missing category breakdown section");
      }
      if (!src.includes("Recent critical")) {
        failures.push("audit-compliance-panel.tsx missing recent critical section");
      }
    }
  }

  return { ok: failures.length === 0, failures };
}

export function resolveAuditComplianceSmokeEra140ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): AuditComplianceSmokeEra140ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildAuditComplianceSmokeEra140Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
}): AuditComplianceSmokeEra140Summary {
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const proofStatus = resolveAuditComplianceSmokeEra140ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: AuditComplianceSmokeEra140Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: AuditComplianceSmokeEra140Step[] = [
    {
      id: "wiring_audit",
      label: "SOC2-ready audit trail → controls → retention & export",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 140 Audit & Compliance cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
  ];

  return {
    version: AUDIT_COMPLIANCE_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    route: AUDIT_COMPLIANCE_ERA140_ROUTE,
    capabilities: AUDIT_COMPLIANCE_ERA140_CAPABILITIES,
    steps,
    honestyNote:
      "PASS certifies in-repo wiring — live proof requires production audit events and auditor export.",
  };
}

export function formatAuditComplianceSmokeEra140ReportLines(
  summary: AuditComplianceSmokeEra140Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Route: ${summary.route}`,
    `Capabilities: ${summary.capabilities.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
