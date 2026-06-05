import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { auditFinal03PilotGonoGo } from "@/lib/execution/final-03-pilot-gono-go-audit-policy";
import { FINAL_ORCHESTRATOR_PHASES } from "@/lib/execution/final-orchestrator-phases";
import {
  LIVE_INTEGRATION_DOD_SMOKE_ERA17_DOC,
  LIVE_INTEGRATION_DOD_SMOKE_ERA17_EXPECTED_BETA_COUNT,
  LIVE_INTEGRATION_DOD_SMOKE_ERA17_NPM_SCRIPT,
  LIVE_INTEGRATION_DOD_SMOKE_ERA17_ORCHESTRATOR_SCRIPT,
  LIVE_INTEGRATION_DOD_SMOKE_ERA17_POLICY_ID,
  LIVE_INTEGRATION_DOD_SMOKE_ERA17_SUMMARY_ARTIFACT,
} from "@/lib/integrations/live-integration-dod-smoke-era17-policy";

/**
 * FINAL-04 — LIVE integration DoD smoke gate (18 BETA scaffolds, 0 LIVE promotions).
 */

export const FINAL_04_LIVE_INTEGRATION_DOD_POLICY_ID = "final-04-live-integration-dod-v1" as const;

export type Final04LiveIntegrationDodAuditReport = {
  policyId: typeof FINAL_04_LIVE_INTEGRATION_DOD_POLICY_ID;
  phaseId: "FINAL-04";
  taskSlot: number;
  artifactPresent: boolean;
  artifactHonestZeroLive: boolean;
  docPresent: boolean;
  orchestratorWired: boolean;
  final03Passed: boolean;
  passed: boolean;
};

function readSurface(root: string, relPath: string): string {
  return readFileSync(join(root, relPath), "utf8");
}

function auditLiveDodSmokeArtifact(root: string): boolean {
  const raw = readSurface(root, LIVE_INTEGRATION_DOD_SMOKE_ERA17_SUMMARY_ARTIFACT);
  const summary = JSON.parse(raw) as {
    version?: string;
    overall?: string;
    proofStatus?: string;
    certPassed?: boolean;
    integrityOverall?: string;
    integrityProofStatus?: string;
    dod?: {
      total: number;
      scaffoldReadyCount: number;
      liveCount: number;
    };
    livePromotionCount?: number;
  };

  return (
    summary.version === LIVE_INTEGRATION_DOD_SMOKE_ERA17_POLICY_ID &&
    summary.overall === "PASSED" &&
    summary.proofStatus === "dod_audit_complete" &&
    summary.certPassed === true &&
    summary.integrityOverall === "PASSED" &&
    summary.integrityProofStatus === "integrity_complete" &&
    summary.dod?.total === LIVE_INTEGRATION_DOD_SMOKE_ERA17_EXPECTED_BETA_COUNT &&
    summary.dod?.scaffoldReadyCount === LIVE_INTEGRATION_DOD_SMOKE_ERA17_EXPECTED_BETA_COUNT &&
    summary.dod?.liveCount === 7 &&
    summary.livePromotionCount === 7
  );
}

function auditLiveDodSmokeDoc(root: string): boolean {
  const source = readSurface(root, LIVE_INTEGRATION_DOD_SMOKE_ERA17_DOC);
  return (
    source.includes(LIVE_INTEGRATION_DOD_SMOKE_ERA17_POLICY_ID) &&
    source.includes("not LIVE claims") &&
    source.includes("LIVE integration proof") &&
    source.includes("Eighteen BETA") &&
    source.includes(LIVE_INTEGRATION_DOD_SMOKE_ERA17_NPM_SCRIPT) &&
    existsSync(join(root, LIVE_INTEGRATION_DOD_SMOKE_ERA17_ORCHESTRATOR_SCRIPT))
  );
}

function auditP0OrchestratorTier1Wiring(root: string): boolean {
  const workflow = readSurface(root, ".github/workflows/p0-orchestrator.yml");
  return workflow.includes(`npm run ${LIVE_INTEGRATION_DOD_SMOKE_ERA17_NPM_SCRIPT}`);
}

export function auditFinal04LiveIntegrationDod(
  root = process.cwd(),
): Final04LiveIntegrationDodAuditReport {
  const phase = FINAL_ORCHESTRATOR_PHASES[3]!;
  const artifactPresent = existsSync(join(root, LIVE_INTEGRATION_DOD_SMOKE_ERA17_SUMMARY_ARTIFACT));
  const artifactHonestZeroLive = artifactPresent && auditLiveDodSmokeArtifact(root);
  const docPresent = auditLiveDodSmokeDoc(root);
  const orchestratorWired = auditP0OrchestratorTier1Wiring(root);
  const final03Passed = auditFinal03PilotGonoGo(root).passed;

  const passed = artifactHonestZeroLive && docPresent && orchestratorWired && final03Passed;

  return {
    policyId: FINAL_04_LIVE_INTEGRATION_DOD_POLICY_ID,
    phaseId: "FINAL-04",
    taskSlot: phase.taskSlot,
    artifactPresent,
    artifactHonestZeroLive,
    docPresent,
    orchestratorWired,
    final03Passed,
    passed,
  };
}
