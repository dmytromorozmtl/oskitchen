import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  DEV_BETA_GOVERNANCE_CAPSTONE_POLICY_ID,
  DEV_BETA_GOVERNANCE_CAPSTONE_SUB_POLICIES,
} from "@/lib/developer/dev-beta-governance-capstone-patterns";
import {
  LIVE_INTEGRATION_DOD_SMOKE_ERA17_DOC,
  LIVE_INTEGRATION_DOD_SMOKE_ERA17_NPM_SCRIPT,
  LIVE_INTEGRATION_DOD_SMOKE_ERA17_ORCHESTRATOR_SCRIPT,
  LIVE_INTEGRATION_DOD_SMOKE_ERA17_POLICY_ID,
  LIVE_INTEGRATION_DOD_SMOKE_ERA17_SUMMARY_ARTIFACT,
} from "@/lib/integrations/live-integration-dod-smoke-era17-policy";

/**
 * DEV-56 — capstone audit for DEV-49–DEV-55 BETA integration governance arc.
 */

export const DEV_BETA_GOVERNANCE_CAPSTONE_AUDIT_POLICY_ID = DEV_BETA_GOVERNANCE_CAPSTONE_POLICY_ID;

export type DevBetaGovernanceCapstoneSubAuditResult = {
  taskId: string;
  policyId: string;
  surface: string;
  passed: boolean;
};

export type DevBetaGovernanceCapstoneAuditReport = {
  policyId: typeof DEV_BETA_GOVERNANCE_CAPSTONE_AUDIT_POLICY_ID;
  subAudits: DevBetaGovernanceCapstoneSubAuditResult[];
  passed: boolean;
};

function readSurface(root: string, relPath: string): string {
  return readFileSync(join(root, relPath), "utf8");
}

function auditLiveDodSmokeDoc(root: string): boolean {
  const source = readSurface(root, LIVE_INTEGRATION_DOD_SMOKE_ERA17_DOC);
  return (
    source.includes(LIVE_INTEGRATION_DOD_SMOKE_ERA17_POLICY_ID) &&
    source.includes(LIVE_INTEGRATION_DOD_SMOKE_ERA17_NPM_SCRIPT) &&
    existsSync(join(root, LIVE_INTEGRATION_DOD_SMOKE_ERA17_ORCHESTRATOR_SCRIPT))
  );
}

function auditP0OrchestratorWiring(root: string): boolean {
  const workflow = readSurface(root, ".github/workflows/p0-orchestrator.yml");
  return workflow.includes(`npm run ${LIVE_INTEGRATION_DOD_SMOKE_ERA17_NPM_SCRIPT}`);
}

function auditLiveDodSmokeArtifact(root: string): boolean {
  const raw = readSurface(root, LIVE_INTEGRATION_DOD_SMOKE_ERA17_SUMMARY_ARTIFACT);
  const summary = JSON.parse(raw) as {
    overall: string;
    certPassed: boolean;
    dod: { total: number; liveCount: number; scaffoldReadyCount: number };
  };
  return (
    summary.overall === "PASSED" &&
    summary.certPassed === true &&
    summary.dod.total === 16 &&
    summary.dod.scaffoldReadyCount === 16 &&
    summary.dod.liveCount === 10
  );
}

const SUB_AUDIT_RUNNERS: Record<string, (root: string) => { policyId: string; passed: boolean }> =
  {
    "DEV-55a": (root) => ({
      policyId: LIVE_INTEGRATION_DOD_SMOKE_ERA17_POLICY_ID,
      passed: auditLiveDodSmokeDoc(root),
    }),
    "DEV-55b": (root) => ({
      policyId: "p0-orchestrator-live-dod-tier1-v1",
      passed: auditP0OrchestratorWiring(root),
    }),
    "DEV-55c": (root) => ({
      policyId: "smoke-live-integration-dod-summary-v1",
      passed: auditLiveDodSmokeArtifact(root),
    }),
  };

export function auditDevBetaGovernanceCapstone(
  root = process.cwd(),
): DevBetaGovernanceCapstoneAuditReport {
  const subAudits = DEV_BETA_GOVERNANCE_CAPSTONE_SUB_POLICIES.map((entry) => {
    const report = SUB_AUDIT_RUNNERS[entry.id]!(root);
    return {
      taskId: entry.id,
      policyId: report.policyId,
      surface: entry.surface,
      passed: report.passed,
    };
  });

  return {
    policyId: DEV_BETA_GOVERNANCE_CAPSTONE_AUDIT_POLICY_ID,
    subAudits,
    passed: subAudits.every((a) => a.passed),
  };
}
