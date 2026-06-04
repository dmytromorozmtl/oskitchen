import { readFileSync } from "node:fs";
import { join } from "node:path";

import { evaluateEra25ConvergenceGovernanceTerminusFreezeIntegrity } from "@/lib/commercial/era25-convergence-governance-terminus-freeze-integrity-era60";
import { ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_INTEGRITY_ERA60_POLICY_ID } from "@/lib/commercial/era25-convergence-governance-terminus-freeze-integrity-era60-policy";
import { auditPmPilotGonoGoCapstone } from "@/lib/pm/pm-pilot-gono-go-capstone-audit-policy";
import {
  PM_OPS_GOVERNANCE_CAPSTONE_POLICY_ID,
  PM_OPS_GOVERNANCE_CAPSTONE_SUB_POLICIES,
} from "@/lib/pm/pm-ops-governance-capstone-patterns";

/**
 * PM-03 — capstone audit for incident/escalation/triage ops governance + era freeze + PM-02.
 */

export const PM_OPS_GOVERNANCE_CAPSTONE_AUDIT_POLICY_ID = PM_OPS_GOVERNANCE_CAPSTONE_POLICY_ID;

export type PmOpsGovernanceCapstoneSubAuditResult = {
  taskId: string;
  policyId: string;
  surface: string;
  passed: boolean;
};

export type PmOpsGovernanceCapstoneAuditReport = {
  policyId: typeof PM_OPS_GOVERNANCE_CAPSTONE_AUDIT_POLICY_ID;
  subAudits: PmOpsGovernanceCapstoneSubAuditResult[];
  passed: boolean;
};

function readSurface(root: string, relPath: string): string {
  return readFileSync(join(root, relPath), "utf8");
}

function auditIncidentResponse(root: string): boolean {
  const source = readSurface(root, "docs/incident-response-process.md");
  return (
    source.includes("incident-response-process-v1") &&
    source.includes("SEV-1") &&
    source.includes("pilot-gono-go-summary.json")
  );
}

function auditIntegrationEscalation(root: string): boolean {
  const source = readSurface(root, "docs/integration-escalation-matrix.md");
  return (
    source.includes("integration-escalation-matrix-v1") &&
    source.includes("incident-response-process.md") &&
    source.includes("live-integration-definition-of-done.md")
  );
}

function auditBugTriage(root: string): boolean {
  const source = readSurface(root, "docs/bug-triage-process.md");
  return (
    source.includes("bug-triage-process-v1") &&
    source.includes("incident-response-process.md") &&
    source.includes("NO-GO")
  );
}

function auditEraFreezeGovernance(root: string): boolean {
  const source = readSurface(
    root,
    "docs/next-step-era25-convergence-governance-terminus-freeze-phase-aj-product-2026-05-28.md",
  );
  const integrity = evaluateEra25ConvergenceGovernanceTerminusFreezeIntegrity(root, {
    env: {},
  });
  return (
    source.includes("era60-era25-convergence-governance-terminus-freeze-integrity-v1") &&
    source.includes("P0 ops vault") &&
    integrity.policyId === ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_INTEGRITY_ERA60_POLICY_ID &&
    integrity.integrityPassed
  );
}

const SUB_AUDIT_RUNNERS: Record<string, (root: string) => { policyId: string; passed: boolean }> =
  {
    "incident-response": (root) => ({
      policyId: "incident-response-process-v1",
      passed: auditIncidentResponse(root),
    }),
    "integration-escalation": (root) => ({
      policyId: "integration-escalation-matrix-v1",
      passed: auditIntegrationEscalation(root),
    }),
    "bug-triage": (root) => ({
      policyId: "bug-triage-process-v1",
      passed: auditBugTriage(root),
    }),
    "era-freeze-governance": (root) => ({
      policyId: ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_INTEGRITY_ERA60_POLICY_ID,
      passed: auditEraFreezeGovernance(root),
    }),
    "PM-02": (root) => {
      const report = auditPmPilotGonoGoCapstone(root);
      return {
        policyId: report.policyId,
        passed: report.passed,
      };
    },
  };

export function auditPmOpsGovernanceCapstone(
  root = process.cwd(),
): PmOpsGovernanceCapstoneAuditReport {
  const subAudits = PM_OPS_GOVERNANCE_CAPSTONE_SUB_POLICIES.map((entry) => {
    const report = SUB_AUDIT_RUNNERS[entry.id]!(root);
    return {
      taskId: entry.id,
      policyId: report.policyId,
      surface: entry.surface,
      passed: report.passed,
    };
  });

  return {
    policyId: PM_OPS_GOVERNANCE_CAPSTONE_AUDIT_POLICY_ID,
    subAudits,
    passed: subAudits.every((a) => a.passed),
  };
}
