/**
 * BETA governance smoke chain summary artifact — registry → integrity → LIVE DoD.
 */

import {
  betaGovernanceSmokeChainPassContract,
  betaGovernanceSmokeChainWithinPassContract,
  BETA_GOVERNANCE_SMOKE_CHAIN_INTEGRATION_POLICY_ID,
  type BetaGovernanceSmokeChainContract,
  buildBetaGovernanceSmokeChainSummaries,
} from "@/lib/integrations/beta-governance-smoke-chain-integration-policy";
import {
  BETA_GOVERNANCE_SMOKE_CHAIN_ERA17_POLICY_ID,
} from "@/lib/integrations/beta-governance-smoke-chain-era17-policy";

export const BETA_GOVERNANCE_SMOKE_CHAIN_SUMMARY_VERSION =
  BETA_GOVERNANCE_SMOKE_CHAIN_ERA17_POLICY_ID;

export type BetaGovernanceSmokeChainOverall = "PASSED" | "FAILED";

export type BetaGovernanceSmokeChainProofStatus =
  | "chain_audit_complete"
  | "proof_failed_cert"
  | "proof_failed_chain";

export type BetaGovernanceSmokeChainSummary = {
  version: typeof BETA_GOVERNANCE_SMOKE_CHAIN_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: BetaGovernanceSmokeChainOverall;
  proofStatus: BetaGovernanceSmokeChainProofStatus;
  certPassed: boolean;
  integrationPolicyId: typeof BETA_GOVERNANCE_SMOKE_CHAIN_INTEGRATION_POLICY_ID;
  chain: BetaGovernanceSmokeChainContract;
  registry: { overall: string; proofStatus: string };
  integrity: { overall: string; proofStatus: string };
  dod: { overall: string; livePromotionCount: number };
  livePromotionCount: number;
  placeholderCount: number;
  expectedBetaCount: number;
};

export function resolveBetaGovernanceSmokeChainProofStatus(input: {
  certPassed: boolean;
  chainWithinPass: boolean;
}): BetaGovernanceSmokeChainProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.chainWithinPass) return "proof_failed_chain";
  return "chain_audit_complete";
}

export function resolveBetaGovernanceSmokeChainOverall(
  proofStatus: BetaGovernanceSmokeChainProofStatus,
): BetaGovernanceSmokeChainOverall {
  return proofStatus === "chain_audit_complete" ? "PASSED" : "FAILED";
}

export function buildBetaGovernanceSmokeChainSummary(input: {
  certPassed: boolean;
  strictEnvMode?: boolean;
  commitSha?: string | null;
  runAt?: Date;
  env?: NodeJS.ProcessEnv;
  root?: string;
}): BetaGovernanceSmokeChainSummary {
  const summaries = buildBetaGovernanceSmokeChainSummaries(input);
  const chain = betaGovernanceSmokeChainPassContract(summaries);
  const chainWithinPass = betaGovernanceSmokeChainWithinPassContract(chain);
  const proofStatus = resolveBetaGovernanceSmokeChainProofStatus({
    certPassed: input.certPassed,
    chainWithinPass,
  });

  return {
    version: BETA_GOVERNANCE_SMOKE_CHAIN_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall: resolveBetaGovernanceSmokeChainOverall(proofStatus),
    proofStatus,
    certPassed: input.certPassed,
    integrationPolicyId: BETA_GOVERNANCE_SMOKE_CHAIN_INTEGRATION_POLICY_ID,
    chain,
    registry: {
      overall: summaries.registry.overall,
      proofStatus: summaries.registry.proofStatus,
    },
    integrity: {
      overall: summaries.integrity.overall,
      proofStatus: summaries.integrity.proofStatus,
    },
    dod: {
      overall: summaries.dod.overall,
      livePromotionCount: summaries.dod.livePromotionCount,
    },
    livePromotionCount: chain.livePromotionCount,
    placeholderCount: chain.placeholderCount,
    expectedBetaCount: chain.expectedBetaCount,
  };
}

export function formatBetaGovernanceSmokeChainReportLines(
  summary: BetaGovernanceSmokeChainSummary,
): string[] {
  return [
    `overall=${summary.overall} proofStatus=${summary.proofStatus}`,
    `registry=${summary.registry.overall} integrity=${summary.integrity.overall} dod=${summary.dod.overall}`,
    `expectedBeta=${summary.expectedBetaCount} livePromotions=${summary.livePromotionCount} placeholders=${summary.placeholderCount}`,
    `chainPassed=${summary.chain.chainPassed}`,
  ];
}
