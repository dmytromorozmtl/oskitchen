/**
 * Era25 post-market-proof steady operational witness integrity.
 * Policy: era63-era25-post-market-proof-steady-operational-witness-integrity-v1
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import { evaluateContinuousImprovementLoopIntegrity } from "@/lib/commercial/continuous-improvement-loop-integrity-era34";
import {
  evaluateEra25P0MarketProofHonestClosureCapstoneIntegrity,
  type Era25P0MarketProofHonestClosureCapstoneIntegrityBaseline,
  type Era25P0MarketProofHonestClosureCapstoneIntegritySummary,
} from "@/lib/commercial/era25-p0-market-proof-honest-closure-capstone-integrity-era62";
import {
  detectEra25GovernanceReopenClaimedAfterWitness,
  detectEra25PostMarketProofSteadyOperationalWitnessStarted,
} from "@/lib/commercial/era25-post-market-proof-steady-operational-witness-phases-era63";
import { PILOT_GONOGO_SUMMARY_ARTIFACT_PATH } from "@/lib/commercial/market-leader-positioning-phases-era21";
import type { InvestorNarrativeOnepagerSummary } from "@/lib/commercial/investor-narrative-onepager-summary";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { PilotCaseStudyDraftSummary } from "@/lib/commercial/pilot-case-study-draft-summary";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { PilotMetricsBaselineSummary } from "@/lib/commercial/pilot-metrics-baseline-summary";
import type { PilotRollbackDrillSummary } from "@/lib/commercial/pilot-rollback-drill-summary";
import type { Tier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";

export const ERA25_POST_MARKET_PROOF_STEADY_OPERATIONAL_WITNESS_INTEGRITY_ERA63_POLICY_ID =
  "era63-era25-post-market-proof-steady-operational-witness-integrity-v1" as const;

export const ERA25_POST_MARKET_PROOF_STEADY_OPERATIONAL_WITNESS_INTEGRITY_BASELINE_ARTIFACT =
  "artifacts/era25-post-market-proof-steady-operational-witness-integrity-baseline.json" as const;

export type Era25PostMarketProofSteadyOperationalWitnessIntegrityViolationId =
  | "era25_p0_market_proof_honest_closure_capstone_integrity_fail"
  | "go_integrity_fail"
  | "witness_without_closure_capstone"
  | "witness_claims_governance_reopen"
  | "continuous_improvement_loop_integrity_fail"
  | "era25_frozen_env_mutation_after_witness"
  | "fake_witness_attestation"
  | "fake_witness_report_attestation"
  | "baseline_regression";

export type Era25PostMarketProofSteadyOperationalWitnessIntegrityViolation = {
  id: Era25PostMarketProofSteadyOperationalWitnessIntegrityViolationId;
  detail: string;
};

export type Era25PostMarketProofSteadyOperationalWitnessIntegrityBaseline = {
  era25PostMarketProofSteadyOperationalWitnessHonest: true;
  recordedAt: string;
  era25MarketProofGovernanceChainClosedAtWitness: true;
  p0ProofStatusAtWitness: "proof_passed";
  goDecision: "GO" | "NO-GO" | string;
  frozenEnvKeyCount: number;
  postMarketProofSteadyOpsWitnessActive: true;
};

export type Era25PostMarketProofSteadyOperationalWitnessIntegritySummary = {
  policyId: typeof ERA25_POST_MARKET_PROOF_STEADY_OPERATIONAL_WITNESS_INTEGRITY_ERA63_POLICY_ID;
  integrityPassed: boolean;
  era25PostMarketProofSteadyOperationalWitnessExecutionStarted: boolean;
  era25PostMarketProofSteadyOperationalWitnessComplete: boolean;
  era25P0MarketProofHonestClosureCapstoneComplete: boolean;
  era25P0MarketProofHonestClosureCapstoneIntegrityPassed: boolean;
  era25MarketProofGovernanceChainClosed: boolean;
  continuousImprovementLoopIntegrityPassed: boolean;
  governanceReopenClaimed: boolean;
  postMarketProofSteadyOpsWitnessActive: boolean;
  p0ProofStatus: string | null;
  p0ArtifactProofPassed: boolean;
  goDecision: string | null;
  goIntegrityPassed: boolean;
  frozenEnvMutationDetected: boolean;
  baselinePresent: boolean;
  regressionDetected: boolean;
  violations: readonly Era25PostMarketProofSteadyOperationalWitnessIntegrityViolation[];
  recommendedCommands: readonly string[];
};

const BLOCKING_VIOLATION_IDS: readonly Era25PostMarketProofSteadyOperationalWitnessIntegrityViolationId[] =
  [
    "era25_p0_market_proof_honest_closure_capstone_integrity_fail",
    "go_integrity_fail",
    "witness_without_closure_capstone",
    "witness_claims_governance_reopen",
    "continuous_improvement_loop_integrity_fail",
    "era25_frozen_env_mutation_after_witness",
    "fake_witness_attestation",
    "fake_witness_report_attestation",
    "baseline_regression",
  ];

function readWitnessIntegrityBaseline(
  root: string,
): Era25PostMarketProofSteadyOperationalWitnessIntegrityBaseline | null {
  try {
    const path = join(
      root,
      ERA25_POST_MARKET_PROOF_STEADY_OPERATIONAL_WITNESS_INTEGRITY_BASELINE_ARTIFACT,
    );
    if (!existsSync(path)) return null;
    return JSON.parse(
      readFileSync(path, "utf8"),
    ) as Era25PostMarketProofSteadyOperationalWitnessIntegrityBaseline;
  } catch {
    return null;
  }
}

function parseEnvBoolean(raw: string | undefined): boolean {
  if (raw === undefined) return false;
  const value = raw.trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes";
}

function pushUpstreamClosureViolations(
  violations: Era25PostMarketProofSteadyOperationalWitnessIntegrityViolation[],
  closureIntegrity: Era25P0MarketProofHonestClosureCapstoneIntegritySummary,
): void {
  if (!closureIntegrity.goIntegrityPassed) {
    violations.push({
      id: "go_integrity_fail",
      detail:
        "GO artifact fails pilot-gono-go integrity — fix before era25 post-market-proof steady operational witness attest.",
    });
  }
  if (!closureIntegrity.integrityPassed) {
    violations.push({
      id: "era25_p0_market_proof_honest_closure_capstone_integrity_fail",
      detail:
        "Era25 P0 market proof honest closure capstone integrity FAIL — complete Phase AL before steady operational witness.",
    });
  }
}

export function evaluateEra25PostMarketProofSteadyOperationalWitnessIntegrity(
  root: string = process.cwd(),
  options?: {
    env?: NodeJS.ProcessEnv;
    goNoGoOverride?: PilotGoNoGoSummary | null;
    p0StagingOverride?: P0StagingProofUnblockSummary | null;
    tier2SummaryOverride?: Tier2StagingGoldenPathSummary | null;
    metricsBaselineOverride?: PilotMetricsBaselineSummary | null;
    caseStudyDraftOverride?: PilotCaseStudyDraftSummary | null;
    investorOnepagerOverride?: InvestorNarrativeOnepagerSummary | null;
    rollbackDrillOverride?: PilotRollbackDrillSummary | null;
    competitorMatrixOverride?: CompetitorFeatureGapMatrixSummary | null;
    p0ProofStatusOverride?: string | null;
    tier2ProofStatusOverride?: string | null;
    closureCapstoneIntegrityBaselineOverride?: Era25P0MarketProofHonestClosureCapstoneIntegrityBaseline | null;
    closureCapstoneIntegrityOverride?: Era25P0MarketProofHonestClosureCapstoneIntegritySummary | null;
    baselineOverride?: Era25PostMarketProofSteadyOperationalWitnessIntegrityBaseline | null;
  },
): Era25PostMarketProofSteadyOperationalWitnessIntegritySummary {
  const env = options?.env ?? process.env;
  const baseline =
    options?.baselineOverride !== undefined
      ? options.baselineOverride
      : readWitnessIntegrityBaseline(root);

  const closureIntegrity =
    options?.closureCapstoneIntegrityOverride ??
    evaluateEra25P0MarketProofHonestClosureCapstoneIntegrity(root, {
      env,
      goNoGoOverride: options?.goNoGoOverride,
      p0StagingOverride: options?.p0StagingOverride,
      tier2SummaryOverride: options?.tier2SummaryOverride,
      metricsBaselineOverride: options?.metricsBaselineOverride,
      caseStudyDraftOverride: options?.caseStudyDraftOverride,
      investorOnepagerOverride: options?.investorOnepagerOverride,
      rollbackDrillOverride: options?.rollbackDrillOverride,
      competitorMatrixOverride: options?.competitorMatrixOverride,
      p0ProofStatusOverride: options?.p0ProofStatusOverride,
      tier2ProofStatusOverride: options?.tier2ProofStatusOverride,
      baselineOverride: options?.closureCapstoneIntegrityBaselineOverride,
    });

  const improvementLoopIntegrity = evaluateContinuousImprovementLoopIntegrity(root, { env });
  const governanceReopenClaimed = detectEra25GovernanceReopenClaimedAfterWitness(env);
  const goDecision = closureIntegrity.goDecision;

  const era25PostMarketProofSteadyOperationalWitnessExecutionStarted =
    detectEra25PostMarketProofSteadyOperationalWitnessStarted(env);
  const witnessAttested = parseEnvBoolean(
    env.ERA25_POST_MARKET_PROOF_STEADY_OPERATIONAL_WITNESS_ERA25_ATTESTED,
  );
  const reportReviewed = parseEnvBoolean(
    env.ERA25_POST_MARKET_PROOF_STEADY_OPERATIONAL_WITNESS_ERA25_REPORT_REVIEWED,
  );
  const era25MarketProofGovernanceChainClosed = closureIntegrity.era25MarketProofGovernanceChainClosed;
  const witnessPrerequisitesHonest =
    era25MarketProofGovernanceChainClosed &&
    closureIntegrity.integrityPassed &&
    closureIntegrity.p0ArtifactProofPassed &&
    improvementLoopIntegrity.integrityPassed &&
    !governanceReopenClaimed;
  const witnessPathActive =
    baseline?.era25PostMarketProofSteadyOperationalWitnessHonest === true ||
    era25PostMarketProofSteadyOperationalWitnessExecutionStarted;
  const witnessHonestForAttest = witnessPrerequisitesHonest;
  const postMarketProofSteadyOpsWitnessActive =
    baseline?.postMarketProofSteadyOpsWitnessActive === true ||
    (witnessHonestForAttest && witnessAttested);

  const violations: Era25PostMarketProofSteadyOperationalWitnessIntegrityViolation[] = [];

  if (era25PostMarketProofSteadyOperationalWitnessExecutionStarted) {
    pushUpstreamClosureViolations(violations, closureIntegrity);
  }

  if (
    era25PostMarketProofSteadyOperationalWitnessExecutionStarted &&
    !era25MarketProofGovernanceChainClosed
  ) {
    violations.push({
      id: "witness_without_closure_capstone",
      detail:
        "ERA25_POST_MARKET_PROOF_STEADY_OPERATIONAL_WITNESS_* env present but P0 closure capstone / governance chain is not closed — complete Phase AL first.",
    });
  }

  if (witnessPathActive && governanceReopenClaimed) {
    violations.push({
      id: "witness_claims_governance_reopen",
      detail:
        "Mutable era25 convergence governance env keys detected after market proof closure — clear frozen attest keys; era25 governance train must not reopen post-witness.",
    });
  }

  if (
    era25PostMarketProofSteadyOperationalWitnessExecutionStarted &&
    !improvementLoopIntegrity.integrityPassed
  ) {
    violations.push({
      id: "continuous_improvement_loop_integrity_fail",
      detail:
        "Continuous improvement loop integrity FAIL — sustain honest improvement loop rhythm before post-market-proof steady operational witness.",
    });
  }

  if (era25PostMarketProofSteadyOperationalWitnessExecutionStarted && goDecision !== "GO") {
    violations.push({
      id: "go_integrity_fail",
      detail: `Witness started but GO decision=${goDecision ?? "missing"} — ${PILOT_GONOGO_SUMMARY_ARTIFACT_PATH} must remain honest GO.`,
    });
  }

  if (
    witnessAttested &&
    era25PostMarketProofSteadyOperationalWitnessExecutionStarted &&
    !witnessHonestForAttest
  ) {
    violations.push({
      id: "fake_witness_attestation",
      detail:
        "ERA25_POST_MARKET_PROOF_STEADY_OPERATIONAL_WITNESS_ERA25_ATTESTED=1 before honest closure capstone + improvement loop + witness integrity PASS — never attest without ops:validate-era25-post-market-proof-steady-operational-witness-integrity PASS.",
    });
  }

  if (
    reportReviewed &&
    era25PostMarketProofSteadyOperationalWitnessExecutionStarted &&
    !witnessHonestForAttest
  ) {
    violations.push({
      id: "fake_witness_report_attestation",
      detail:
        "ERA25_POST_MARKET_PROOF_STEADY_OPERATIONAL_WITNESS_ERA25_REPORT_REVIEWED=1 before witness integrity PASS — never attest report without ops:validate-era25-post-market-proof-steady-operational-witness-integrity PASS.",
    });
  }

  if (
    baseline?.era25PostMarketProofSteadyOperationalWitnessHonest &&
    (!era25MarketProofGovernanceChainClosed ||
      !closureIntegrity.goIntegrityPassed ||
      !closureIntegrity.p0ArtifactProofPassed ||
      governanceReopenClaimed)
  ) {
    violations.push({
      id: "baseline_regression",
      detail: `Baseline recorded honest post-market-proof witness at ${baseline.recordedAt} but closure capstone / GO / P0 artifact is no longer honest.`,
    });
  }

  const integrityPassed = !violations.some((row) => BLOCKING_VIOLATION_IDS.includes(row.id));
  const regressionDetected = violations.some((row) => row.id === "baseline_regression");

  return {
    policyId: ERA25_POST_MARKET_PROOF_STEADY_OPERATIONAL_WITNESS_INTEGRITY_ERA63_POLICY_ID,
    integrityPassed,
    era25PostMarketProofSteadyOperationalWitnessExecutionStarted,
    era25PostMarketProofSteadyOperationalWitnessComplete:
      witnessHonestForAttest && closureIntegrity.integrityPassed,
    era25P0MarketProofHonestClosureCapstoneComplete:
      closureIntegrity.era25P0MarketProofHonestClosureCapstoneComplete,
    era25P0MarketProofHonestClosureCapstoneIntegrityPassed: closureIntegrity.integrityPassed,
    era25MarketProofGovernanceChainClosed,
    continuousImprovementLoopIntegrityPassed: improvementLoopIntegrity.integrityPassed,
    governanceReopenClaimed,
    postMarketProofSteadyOpsWitnessActive,
    p0ProofStatus: closureIntegrity.p0ProofStatus,
    p0ArtifactProofPassed: closureIntegrity.p0ArtifactProofPassed,
    goDecision,
    goIntegrityPassed: closureIntegrity.goIntegrityPassed,
    frozenEnvMutationDetected: governanceReopenClaimed,
    baselinePresent: baseline !== null,
    regressionDetected,
    violations,
    recommendedCommands: [
      "npm run ops:validate-era25-post-market-proof-steady-operational-witness-integrity -- --json",
      "npm run ops:validate-era25-p0-market-proof-honest-closure-capstone-integrity -- --json",
      "npm run ops:validate-continuous-improvement-loop-integrity -- --json",
      "npm run test:ci:governance-bundles",
      "npm run test:ci:commercial-pilot-runbook:cert",
    ],
  };
}
