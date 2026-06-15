/**
 * Era25 post-band-a-governance steady product mode witness integrity.
 * Policy: era67-era25-post-band-a-governance-steady-product-mode-witness-integrity-v1
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import { evaluateContinuousImprovementLoopIntegrity } from "@/lib/commercial/continuous-improvement-loop-integrity-era34";
import {
  evaluateEra25BandAGovernanceChainCapstoneWitnessIntegrity,
  type Era25BandAGovernanceChainCapstoneWitnessIntegrityBaseline,
  type Era25BandAGovernanceChainCapstoneWitnessIntegritySummary,
} from "@/lib/commercial/era25-band-a-governance-chain-capstone-witness-integrity-era66";
import {
  detectEra25GovernanceReopenClaimedAfterSteadyProductModeWitness,
  detectEra25PostBandAGovernanceSteadyProductModeWitnessStarted,
} from "@/lib/commercial/era25-post-band-a-governance-steady-product-mode-witness-phases-era67";
import { PILOT_GONOGO_SUMMARY_ARTIFACT_PATH } from "@/lib/commercial/market-leader-positioning-phases-era21";
import type { InvestorNarrativeOnepagerSummary } from "@/lib/commercial/investor-narrative-onepager-summary";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { PilotCaseStudyDraftSummary } from "@/lib/commercial/pilot-case-study-draft-summary";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { PilotMetricsBaselineSummary } from "@/lib/commercial/pilot-metrics-baseline-summary";
import type { PilotRollbackDrillSummary } from "@/lib/commercial/pilot-rollback-drill-summary";
import type { Tier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";
import type { Era25PostTerminalSealCommercialOpsPermanenceIntegrityBaseline } from "@/lib/commercial/era25-post-terminal-seal-commercial-ops-permanence-integrity-era65";

export const ERA25_POST_BAND_A_GOVERNANCE_STEADY_PRODUCT_MODE_WITNESS_INTEGRITY_ERA67_POLICY_ID =
  "era67-era25-post-band-a-governance-steady-product-mode-witness-integrity-v1" as const;

export const ERA25_POST_BAND_A_GOVERNANCE_STEADY_PRODUCT_MODE_WITNESS_INTEGRITY_BASELINE_ARTIFACT =
  "artifacts/era25-post-band-a-governance-steady-product-mode-witness-integrity-baseline.json" as const;

export type Era25PostBandAGovernanceSteadyProductModeWitnessIntegrityViolationId =
  | "era25_band_a_governance_chain_capstone_witness_integrity_fail"
  | "go_integrity_fail"
  | "steady_product_mode_witness_without_capstone"
  | "steady_product_mode_witness_claims_governance_reopen"
  | "continuous_improvement_loop_integrity_fail"
  | "fake_steady_product_mode_witness_attestation"
  | "fake_steady_product_mode_witness_report_attestation"
  | "baseline_regression";

export type Era25PostBandAGovernanceSteadyProductModeWitnessIntegrityViolation = {
  id: Era25PostBandAGovernanceSteadyProductModeWitnessIntegrityViolationId;
  detail: string;
};

export type Era25PostBandAGovernanceSteadyProductModeWitnessIntegrityBaseline = {
  era25PostBandAGovernanceSteadyProductModeWitnessHonest: true;
  recordedAt: string;
  era25MarketProofGovernanceChainClosedAtSteadyProductMode: true;
  era25GovernanceTrainSealedAtSteadyProductMode: true;
  bandAGovernanceChainCapstoneWitnessActiveAtSteadyProductMode: true;
  p0ProofStatusAtSteadyProductMode: "proof_passed";
  goDecision: "GO" | "NO-GO" | string;
  frozenEnvKeyCount: number;
  postBandAGovernanceSteadyProductModeWitnessActive: true;
};

export type Era25PostBandAGovernanceSteadyProductModeWitnessIntegritySummary = {
  policyId: typeof ERA25_POST_BAND_A_GOVERNANCE_STEADY_PRODUCT_MODE_WITNESS_INTEGRITY_ERA67_POLICY_ID;
  integrityPassed: boolean;
  era25PostBandAGovernanceSteadyProductModeWitnessExecutionStarted: boolean;
  era25PostBandAGovernanceSteadyProductModeWitnessComplete: boolean;
  era25BandAGovernanceChainCapstoneWitnessComplete: boolean;
  era25BandAGovernanceChainCapstoneWitnessIntegrityPassed: boolean;
  era25MarketProofGovernanceChainClosed: boolean;
  continuousImprovementLoopIntegrityPassed: boolean;
  governanceReopenClaimed: boolean;
  era25GovernanceTrainSealed: boolean;
  bandAGovernanceChainCapstoneWitnessActive: boolean;
  postBandAGovernanceSteadyProductModeWitnessActive: boolean;
  p0ProofStatus: string | null;
  p0ArtifactProofPassed: boolean;
  goDecision: string | null;
  goIntegrityPassed: boolean;
  frozenEnvMutationDetected: boolean;
  baselinePresent: boolean;
  regressionDetected: boolean;
  violations: readonly Era25PostBandAGovernanceSteadyProductModeWitnessIntegrityViolation[];
  recommendedCommands: readonly string[];
};

const BLOCKING_VIOLATION_IDS: readonly Era25PostBandAGovernanceSteadyProductModeWitnessIntegrityViolationId[] =
  [
    "era25_band_a_governance_chain_capstone_witness_integrity_fail",
    "go_integrity_fail",
    "steady_product_mode_witness_without_capstone",
    "steady_product_mode_witness_claims_governance_reopen",
    "continuous_improvement_loop_integrity_fail",
    "fake_steady_product_mode_witness_attestation",
    "fake_steady_product_mode_witness_report_attestation",
    "baseline_regression",
  ];

function readSteadyProductModeWitnessIntegrityBaseline(
  root: string,
): Era25PostBandAGovernanceSteadyProductModeWitnessIntegrityBaseline | null {
  try {
    const path = join(
      root,
      ERA25_POST_BAND_A_GOVERNANCE_STEADY_PRODUCT_MODE_WITNESS_INTEGRITY_BASELINE_ARTIFACT,
    );
    if (!existsSync(path)) return null;
    return JSON.parse(
      readFileSync(path, "utf8"),
    ) as Era25PostBandAGovernanceSteadyProductModeWitnessIntegrityBaseline;
  } catch {
    return null;
  }
}

function parseEnvBoolean(raw: string | undefined): boolean {
  if (raw === undefined) return false;
  const value = raw.trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes";
}

function pushUpstreamCapstoneViolations(
  violations: Era25PostBandAGovernanceSteadyProductModeWitnessIntegrityViolation[],
  capstoneIntegrity: Era25BandAGovernanceChainCapstoneWitnessIntegritySummary,
): void {
  if (!capstoneIntegrity.goIntegrityPassed) {
    violations.push({
      id: "go_integrity_fail",
      detail:
        "GO artifact fails pilot-gono-go integrity — fix before era25 post-governance steady product mode witness attest.",
    });
  }
  if (!capstoneIntegrity.integrityPassed) {
    violations.push({
      id: "era25_band_a_governance_chain_capstone_witness_integrity_fail",
      detail:
        "Era25 Band A governance chain capstone witness integrity FAIL — complete Phase AP before steady product mode witness.",
    });
  }
}

export function evaluateEra25PostBandAGovernanceSteadyProductModeWitnessIntegrity(
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
    permanenceIntegrityBaselineOverride?: Era25PostTerminalSealCommercialOpsPermanenceIntegrityBaseline | null;
    capstoneIntegrityBaselineOverride?: Era25BandAGovernanceChainCapstoneWitnessIntegrityBaseline | null;
    capstoneIntegrityOverride?: Era25BandAGovernanceChainCapstoneWitnessIntegritySummary | null;
    baselineOverride?: Era25PostBandAGovernanceSteadyProductModeWitnessIntegrityBaseline | null;
  },
): Era25PostBandAGovernanceSteadyProductModeWitnessIntegritySummary {
  const env = options?.env ?? process.env;
  const baseline =
    options?.baselineOverride !== undefined
      ? options.baselineOverride
      : readSteadyProductModeWitnessIntegrityBaseline(root);

  const capstoneIntegrity =
    options?.capstoneIntegrityOverride ??
    evaluateEra25BandAGovernanceChainCapstoneWitnessIntegrity(root, {
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
      permanenceIntegrityBaselineOverride: options?.permanenceIntegrityBaselineOverride,
      baselineOverride: options?.capstoneIntegrityBaselineOverride,
    });

  const improvementLoopIntegrity = evaluateContinuousImprovementLoopIntegrity(root, { env });
  const governanceReopenClaimed = detectEra25GovernanceReopenClaimedAfterSteadyProductModeWitness(env);
  const goDecision = capstoneIntegrity.goDecision;

  const era25PostBandAGovernanceSteadyProductModeWitnessExecutionStarted =
    detectEra25PostBandAGovernanceSteadyProductModeWitnessStarted(env);
  const witnessAttested = parseEnvBoolean(
    env.ERA25_POST_BAND_A_GOVERNANCE_STEADY_PRODUCT_MODE_WITNESS_ERA25_ATTESTED,
  );
  const reportReviewed = parseEnvBoolean(
    env.ERA25_POST_BAND_A_GOVERNANCE_STEADY_PRODUCT_MODE_WITNESS_ERA25_REPORT_REVIEWED,
  );
  const era25MarketProofGovernanceChainClosed = capstoneIntegrity.era25MarketProofGovernanceChainClosed;
  const era25GovernanceTrainSealed = capstoneIntegrity.era25GovernanceTrainSealed;
  const bandAGovernanceChainCapstoneWitnessActive =
    capstoneIntegrity.bandAGovernanceChainCapstoneWitnessActive;
  const witnessPrerequisitesHonest =
    era25MarketProofGovernanceChainClosed &&
    capstoneIntegrity.integrityPassed &&
    bandAGovernanceChainCapstoneWitnessActive &&
    era25GovernanceTrainSealed &&
    capstoneIntegrity.p0ArtifactProofPassed &&
    improvementLoopIntegrity.integrityPassed &&
    !governanceReopenClaimed;
  const witnessPathActive =
    baseline?.era25PostBandAGovernanceSteadyProductModeWitnessHonest === true ||
    era25PostBandAGovernanceSteadyProductModeWitnessExecutionStarted;
  const witnessHonestForAttest = witnessPrerequisitesHonest;
  const postBandAGovernanceSteadyProductModeWitnessActive =
    baseline?.postBandAGovernanceSteadyProductModeWitnessActive === true ||
    (witnessHonestForAttest && witnessAttested);

  const violations: Era25PostBandAGovernanceSteadyProductModeWitnessIntegrityViolation[] = [];

  if (era25PostBandAGovernanceSteadyProductModeWitnessExecutionStarted) {
    pushUpstreamCapstoneViolations(violations, capstoneIntegrity);
  }

  if (
    era25PostBandAGovernanceSteadyProductModeWitnessExecutionStarted &&
    !bandAGovernanceChainCapstoneWitnessActive
  ) {
    violations.push({
      id: "steady_product_mode_witness_without_capstone",
      detail:
        "ERA25_POST_BAND_A_GOVERNANCE_STEADY_PRODUCT_MODE_WITNESS_* env present but Band A capstone witness is not active — complete Phase AP first.",
    });
  }

  if (witnessPathActive && governanceReopenClaimed) {
    violations.push({
      id: "steady_product_mode_witness_claims_governance_reopen",
      detail:
        "Mutable era25 convergence governance env keys detected after steady product mode witness path — clear frozen attest keys; era61–AP governance chain must not reopen post-witness.",
    });
  }

  if (
    era25PostBandAGovernanceSteadyProductModeWitnessExecutionStarted &&
    !improvementLoopIntegrity.integrityPassed
  ) {
    violations.push({
      id: "continuous_improvement_loop_integrity_fail",
      detail:
        "Continuous improvement loop integrity FAIL — sustain honest improvement loop rhythm before post-governance steady product mode witness.",
    });
  }

  if (era25PostBandAGovernanceSteadyProductModeWitnessExecutionStarted && goDecision !== "GO") {
    violations.push({
      id: "go_integrity_fail",
      detail: `Steady product mode witness started but GO decision=${goDecision ?? "missing"} — ${PILOT_GONOGO_SUMMARY_ARTIFACT_PATH} must remain honest GO.`,
    });
  }

  if (
    witnessAttested &&
    era25PostBandAGovernanceSteadyProductModeWitnessExecutionStarted &&
    !witnessHonestForAttest
  ) {
    violations.push({
      id: "fake_steady_product_mode_witness_attestation",
      detail:
        "ERA25_POST_BAND_A_GOVERNANCE_STEADY_PRODUCT_MODE_WITNESS_ERA25_ATTESTED=1 before honest Band A capstone witness + improvement loop + steady product mode witness integrity PASS — never attest without ops:validate-era25-post-band-a-governance-steady-product-mode-witness-integrity PASS.",
    });
  }

  if (
    reportReviewed &&
    era25PostBandAGovernanceSteadyProductModeWitnessExecutionStarted &&
    !witnessHonestForAttest
  ) {
    violations.push({
      id: "fake_steady_product_mode_witness_report_attestation",
      detail:
        "ERA25_POST_BAND_A_GOVERNANCE_STEADY_PRODUCT_MODE_WITNESS_ERA25_REPORT_REVIEWED=1 before steady product mode witness integrity PASS — never attest report without ops:validate-era25-post-band-a-governance-steady-product-mode-witness-integrity PASS.",
    });
  }

  if (
    baseline?.era25PostBandAGovernanceSteadyProductModeWitnessHonest &&
    (!era25MarketProofGovernanceChainClosed ||
      !capstoneIntegrity.goIntegrityPassed ||
      !bandAGovernanceChainCapstoneWitnessActive ||
      !era25GovernanceTrainSealed ||
      governanceReopenClaimed)
  ) {
    violations.push({
      id: "baseline_regression",
      detail: `Baseline recorded honest steady product mode witness at ${baseline.recordedAt} but capstone witness / train seal / GO is no longer honest.`,
    });
  }

  const integrityPassed = !violations.some((row) => BLOCKING_VIOLATION_IDS.includes(row.id));
  const regressionDetected = violations.some((row) => row.id === "baseline_regression");

  return {
    policyId: ERA25_POST_BAND_A_GOVERNANCE_STEADY_PRODUCT_MODE_WITNESS_INTEGRITY_ERA67_POLICY_ID,
    integrityPassed,
    era25PostBandAGovernanceSteadyProductModeWitnessExecutionStarted,
    era25PostBandAGovernanceSteadyProductModeWitnessComplete:
      witnessHonestForAttest && capstoneIntegrity.integrityPassed,
    era25BandAGovernanceChainCapstoneWitnessComplete:
      capstoneIntegrity.era25BandAGovernanceChainCapstoneWitnessComplete,
    era25BandAGovernanceChainCapstoneWitnessIntegrityPassed: capstoneIntegrity.integrityPassed,
    era25MarketProofGovernanceChainClosed,
    continuousImprovementLoopIntegrityPassed: improvementLoopIntegrity.integrityPassed,
    governanceReopenClaimed,
    era25GovernanceTrainSealed,
    bandAGovernanceChainCapstoneWitnessActive,
    postBandAGovernanceSteadyProductModeWitnessActive,
    p0ProofStatus: capstoneIntegrity.p0ProofStatus,
    p0ArtifactProofPassed: capstoneIntegrity.p0ArtifactProofPassed,
    goDecision,
    goIntegrityPassed: capstoneIntegrity.goIntegrityPassed,
    frozenEnvMutationDetected: governanceReopenClaimed,
    baselinePresent: baseline !== null,
    regressionDetected,
    violations,
    recommendedCommands: [
      "npm run ops:validate-era25-post-band-a-governance-steady-product-mode-witness-integrity -- --json",
      "npm run ops:validate-era25-band-a-governance-chain-capstone-witness-integrity -- --json",
      "npm run ops:validate-continuous-improvement-loop-integrity -- --json",
      "npm run test:ci:governance-bundles",
      "npm run test:ci:commercial-pilot-runbook:cert",
    ],
  };
}
