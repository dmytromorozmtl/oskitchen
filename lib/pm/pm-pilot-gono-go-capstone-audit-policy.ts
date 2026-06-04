import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  COMMERCIAL_PILOT_RUNBOOK_POLICY_ID,
  COMMERCIAL_PILOT_RUNBOOK_REQUIRED_SECTIONS,
} from "@/lib/commercial/commercial-pilot-runbook-policy";
import { evaluatePilotGoNoGoIntegrity } from "@/lib/commercial/pilot-gono-go-integrity-era28";
import { PILOT_GONOGO_ERA17_SUMMARY_ARTIFACT } from "@/lib/commercial/pilot-gono-go-era17-policy";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import { auditPmP0Foundation } from "@/lib/pm/pm-p0-foundation-audit-policy";
import {
  PM_PILOT_GONO_GO_CAPSTONE_POLICY_ID,
  PM_PILOT_GONO_GO_CAPSTONE_SUB_POLICIES,
} from "@/lib/pm/pm-pilot-gono-go-capstone-patterns";

/**
 * PM-02 — capstone audit for commercial pilot runbook + honest GO/NO-GO artifact + integrity + PM-01.
 */

export const PM_PILOT_GONO_GO_CAPSTONE_AUDIT_POLICY_ID = PM_PILOT_GONO_GO_CAPSTONE_POLICY_ID;

export type PmPilotGonoGoCapstoneSubAuditResult = {
  taskId: string;
  policyId: string;
  surface: string;
  passed: boolean;
};

export type PmPilotGonoGoCapstoneAuditReport = {
  policyId: typeof PM_PILOT_GONO_GO_CAPSTONE_AUDIT_POLICY_ID;
  subAudits: PmPilotGonoGoCapstoneSubAuditResult[];
  passed: boolean;
};

function readSurface(root: string, relPath: string): string {
  return readFileSync(join(root, relPath), "utf8");
}

function auditCommercialRunbook(root: string): boolean {
  const source = readSurface(root, "docs/commercial-pilot-runbook.md");
  if (!source.includes(COMMERCIAL_PILOT_RUNBOOK_POLICY_ID)) return false;
  return COMMERCIAL_PILOT_RUNBOOK_REQUIRED_SECTIONS.every((section) =>
    source.includes(`## ${section}`),
  );
}

function auditGonoGoArtifact(root: string): boolean {
  const raw = readSurface(root, PILOT_GONOGO_ERA17_SUMMARY_ARTIFACT);
  const summary = JSON.parse(raw) as PilotGoNoGoSummary;
  return (
    summary.version === "era17-pilot-gono-go-v1" &&
    summary.decision === "NO-GO" &&
    Array.isArray(summary.blockers) &&
    summary.blockers.length >= 3 &&
    summary.customerName === null
  );
}

function auditGonoGoIntegrity(root: string): boolean {
  const result = evaluatePilotGoNoGoIntegrity(root);
  return result.integrityPassed && result.decision === "NO-GO";
}

const SUB_AUDIT_RUNNERS: Record<string, (root: string) => { policyId: string; passed: boolean }> =
  {
    "commercial-runbook": (root) => ({
      policyId: COMMERCIAL_PILOT_RUNBOOK_POLICY_ID,
      passed: auditCommercialRunbook(root),
    }),
    "gono-go-artifact": (root) => ({
      policyId: "era17-pilot-gono-go-v1",
      passed: auditGonoGoArtifact(root),
    }),
    "gono-go-integrity": (root) => ({
      policyId: "era28-pilot-gono-go-integrity-v1",
      passed: auditGonoGoIntegrity(root),
    }),
    "PM-01": (root) => {
      const report = auditPmP0Foundation(root);
      return {
        policyId: report.policyId,
        passed: report.passed,
      };
    },
  };

export function auditPmPilotGonoGoCapstone(
  root = process.cwd(),
): PmPilotGonoGoCapstoneAuditReport {
  const subAudits = PM_PILOT_GONO_GO_CAPSTONE_SUB_POLICIES.map((entry) => {
    const report = SUB_AUDIT_RUNNERS[entry.id]!(root);
    return {
      taskId: entry.id,
      policyId: report.policyId,
      surface: entry.surface,
      passed: report.passed,
    };
  });

  return {
    policyId: PM_PILOT_GONO_GO_CAPSTONE_AUDIT_POLICY_ID,
    subAudits,
    passed: subAudits.every((a) => a.passed),
  };
}
