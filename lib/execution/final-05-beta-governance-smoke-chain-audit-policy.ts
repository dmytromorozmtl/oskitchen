import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { auditFinal04LiveIntegrationDod } from "@/lib/execution/final-04-live-integration-dod-audit-policy";
import { FINAL_ORCHESTRATOR_PHASES } from "@/lib/execution/final-orchestrator-phases";
import {
  BETA_GOVERNANCE_SMOKE_CHAIN_ERA17_DOC,
  BETA_GOVERNANCE_SMOKE_CHAIN_ERA17_NPM_SCRIPT,
  BETA_GOVERNANCE_SMOKE_CHAIN_ERA17_ORCHESTRATOR_SCRIPT,
  BETA_GOVERNANCE_SMOKE_CHAIN_ERA17_POLICY_ID,
  BETA_GOVERNANCE_SMOKE_CHAIN_ERA17_SUMMARY_ARTIFACT,
} from "@/lib/integrations/beta-governance-smoke-chain-era17-policy";
import {
  BETA_GOVERNANCE_SMOKE_CHAIN_EXPECTED_BETA_COUNT,
  BETA_GOVERNANCE_SMOKE_CHAIN_INTEGRATION_POLICY_ID,
} from "@/lib/integrations/beta-governance-smoke-chain-integration-policy";

/**
 * FINAL-05 — BETA governance smoke chain gate (registry → integrity → DoD).
 */

export const FINAL_05_BETA_GOVERNANCE_SMOKE_CHAIN_POLICY_ID =
  "final-05-beta-governance-chain-v1" as const;

export type Final05BetaGovernanceSmokeChainAuditReport = {
  policyId: typeof FINAL_05_BETA_GOVERNANCE_SMOKE_CHAIN_POLICY_ID;
  phaseId: "FINAL-05";
  taskSlot: number;
  artifactPresent: boolean;
  artifactHonestChainPass: boolean;
  docPresent: boolean;
  orchestratorWired: boolean;
  integrationPolicyPresent: boolean;
  final04Passed: boolean;
  passed: boolean;
};

function readSurface(root: string, relPath: string): string {
  return readFileSync(join(root, relPath), "utf8");
}

function auditChainSmokeArtifact(root: string): boolean {
  const raw = readSurface(root, BETA_GOVERNANCE_SMOKE_CHAIN_ERA17_SUMMARY_ARTIFACT);
  const summary = JSON.parse(raw) as {
    version?: string;
    overall?: string;
    proofStatus?: string;
    certPassed?: boolean;
    integrationPolicyId?: string;
    chain?: {
      chainPassed: boolean;
      livePromotionCount: number;
      placeholderCount: number;
      expectedBetaCount: number;
    };
    livePromotionCount?: number;
    placeholderCount?: number;
    expectedBetaCount?: number;
  };

  return (
    summary.version === BETA_GOVERNANCE_SMOKE_CHAIN_ERA17_POLICY_ID &&
    summary.overall === "PASSED" &&
    summary.proofStatus === "chain_audit_complete" &&
    summary.certPassed === true &&
    summary.integrationPolicyId === BETA_GOVERNANCE_SMOKE_CHAIN_INTEGRATION_POLICY_ID &&
    summary.chain?.chainPassed === true &&
    summary.chain?.livePromotionCount === 8 &&
    summary.chain?.placeholderCount === 0 &&
    summary.chain?.expectedBetaCount === BETA_GOVERNANCE_SMOKE_CHAIN_EXPECTED_BETA_COUNT &&
    summary.livePromotionCount === 8 &&
    summary.placeholderCount === 0 &&
    summary.expectedBetaCount === BETA_GOVERNANCE_SMOKE_CHAIN_EXPECTED_BETA_COUNT
  );
}

function auditChainSmokeDoc(root: string): boolean {
  const source = readSurface(root, BETA_GOVERNANCE_SMOKE_CHAIN_ERA17_DOC);
  return (
    source.includes(BETA_GOVERNANCE_SMOKE_CHAIN_ERA17_POLICY_ID) &&
    source.includes(BETA_GOVERNANCE_SMOKE_CHAIN_INTEGRATION_POLICY_ID) &&
    source.includes("registry → integrity") &&
    source.includes("not LIVE") &&
    source.includes(BETA_GOVERNANCE_SMOKE_CHAIN_ERA17_NPM_SCRIPT) &&
    existsSync(join(root, BETA_GOVERNANCE_SMOKE_CHAIN_ERA17_ORCHESTRATOR_SCRIPT)) &&
    existsSync(
      join(root, "tests/integration/beta-governance-smoke-chain.integration.test.ts"),
    )
  );
}

function auditP0OrchestratorTier1Wiring(root: string): boolean {
  const workflow = readSurface(root, ".github/workflows/p0-orchestrator.yml");
  return workflow.includes(`npm run ${BETA_GOVERNANCE_SMOKE_CHAIN_ERA17_NPM_SCRIPT}`);
}

export function auditFinal05BetaGovernanceSmokeChain(
  root = process.cwd(),
): Final05BetaGovernanceSmokeChainAuditReport {
  const phase = FINAL_ORCHESTRATOR_PHASES[4]!;
  const artifactPresent = existsSync(
    join(root, BETA_GOVERNANCE_SMOKE_CHAIN_ERA17_SUMMARY_ARTIFACT),
  );
  const artifactHonestChainPass = artifactPresent && auditChainSmokeArtifact(root);
  const docPresent = auditChainSmokeDoc(root);
  const orchestratorWired = auditP0OrchestratorTier1Wiring(root);
  const integrationPolicyPresent = existsSync(
    join(root, "lib/integrations/beta-governance-smoke-chain-integration-policy.ts"),
  );
  const final04Passed = auditFinal04LiveIntegrationDod(root).passed;

  const passed =
    artifactHonestChainPass &&
    docPresent &&
    orchestratorWired &&
    integrationPolicyPresent &&
    final04Passed;

  return {
    policyId: FINAL_05_BETA_GOVERNANCE_SMOKE_CHAIN_POLICY_ID,
    phaseId: "FINAL-05",
    taskSlot: phase.taskSlot,
    artifactPresent,
    artifactHonestChainPass,
    docPresent,
    orchestratorWired,
    integrationPolicyPresent,
    final04Passed,
    passed,
  };
}
