/**
 * Era25 post-rhythm-permanence Band A governance terminal closure witness integrity.
 * Policy: era69-era25-post-rhythm-permanence-band-a-governance-terminal-closure-witness-integrity-v1
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import { evaluateContinuousImprovementLoopIntegrity } from "@/lib/commercial/continuous-improvement-loop-integrity-era34";
import type { Era25BandAGovernanceChainCapstoneWitnessIntegrityBaseline } from "@/lib/commercial/era25-band-a-governance-chain-capstone-witness-integrity-era66";
import type { Era25PostBandAGovernanceSteadyProductModeWitnessIntegrityBaseline } from "@/lib/commercial/era25-post-band-a-governance-steady-product-mode-witness-integrity-era67";
import {
  evaluateEra25PostSteadyProductModeCommercialOpsRhythmPermanenceIntegrity,
  type Era25PostSteadyProductModeCommercialOpsRhythmPermanenceIntegrityBaseline,
  type Era25PostSteadyProductModeCommercialOpsRhythmPermanenceIntegritySummary,
} from "@/lib/commercial/era25-post-steady-product-mode-commercial-ops-rhythm-permanence-integrity-era68";
import {
  detectEra25GovernanceReopenClaimedAfterTerminalClosureWitness,
  detectEra25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessStarted,
} from "@/lib/commercial/era25-post-rhythm-permanence-band-a-governance-terminal-closure-witness-phases-era69";
import { PILOT_GONOGO_SUMMARY_ARTIFACT_PATH } from "@/lib/commercial/market-leader-positioning-phases-era21";
import type { InvestorNarrativeOnepagerSummary } from "@/lib/commercial/investor-narrative-onepager-summary";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { PilotCaseStudyDraftSummary } from "@/lib/commercial/pilot-case-study-draft-summary";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { PilotMetricsBaselineSummary } from "@/lib/commercial/pilot-metrics-baseline-summary";
import type { PilotRollbackDrillSummary } from "@/lib/commercial/pilot-rollback-drill-summary";
import type { Tier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";
import type { Era25PostTerminalSealCommercialOpsPermanenceIntegrityBaseline } from "@/lib/commercial/era25-post-terminal-seal-commercial-ops-permanence-integrity-era65";

export const ERA25_POST_RHYTHM_PERMANENCE_BAND_A_GOVERNANCE_TERMINAL_CLOSURE_WITNESS_INTEGRITY_ERA69_POLICY_ID =
  "era69-era25-post-rhythm-permanence-band-a-governance-terminal-closure-witness-integrity-v1" as const;

export const ERA25_POST_RHYTHM_PERMANENCE_BAND_A_GOVERNANCE_TERMINAL_CLOSURE_WITNESS_INTEGRITY_BASELINE_ARTIFACT =
  "artifacts/era25-post-rhythm-permanence-band-a-governance-terminal-closure-witness-integrity-baseline.json" as const;

export type Era25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessIntegrityViolationId =
  | "era25_post_steady_product_mode_commercial_ops_rhythm_permanence_integrity_fail"
  | "go_integrity_fail"
  | "terminal_closure_witness_without_rhythm_permanence"
  | "terminal_closure_witness_claims_governance_reopen"
  | "continuous_improvement_loop_integrity_fail"
  | "fake_terminal_closure_witness_attestation"
  | "fake_terminal_closure_witness_report_attestation"
  | "baseline_regression";

export type Era25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessIntegrityViolation = {
  id: Era25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessIntegrityViolationId;
  detail: string;
};

export type Era25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessIntegrityBaseline = {
  era25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessHonest: true;
  recordedAt: string;
  era25MarketProofGovernanceChainClosedAtTerminalClosure: true;
  era25GovernanceTrainSealedAtTerminalClosure: true;
  postSteadyProductModeCommercialOpsRhythmPermanenceActiveAtTerminalClosure: true;
  p0ProofStatusAtTerminalClosure: "proof_passed";
  goDecision: "GO" | "NO-GO" | string;
  frozenEnvKeyCount: number;
  postRhythmPermanenceBandAGovernanceTerminalClosureWitnessActive: true;
};

export type Era25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessIntegritySummary = {
  policyId: typeof ERA25_POST_RHYTHM_PERMANENCE_BAND_A_GOVERNANCE_TERMINAL_CLOSURE_WITNESS_INTEGRITY_ERA69_POLICY_ID;
  integrityPassed: boolean;
  era25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessExecutionStarted: boolean;
  era25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessComplete: boolean;
  era25PostSteadyProductModeCommercialOpsRhythmPermanenceComplete: boolean;
  era25PostSteadyProductModeCommercialOpsRhythmPermanenceIntegrityPassed: boolean;
  era25MarketProofGovernanceChainClosed: boolean;
  continuousImprovementLoopIntegrityPassed: boolean;
  governanceReopenClaimed: boolean;
  era25GovernanceTrainSealed: boolean;
  postSteadyProductModeCommercialOpsRhythmPermanenceActive: boolean;
  postRhythmPermanenceBandAGovernanceTerminalClosureWitnessActive: boolean;
  p0ProofStatus: string | null;
  p0ArtifactProofPassed: boolean;
  goDecision: string | null;
  goIntegrityPassed: boolean;
  frozenEnvMutationDetected: boolean;
  baselinePresent: boolean;
  regressionDetected: boolean;
  violations: readonly Era25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessIntegrityViolation[];
  recommendedCommands: readonly string[];
};

const BLOCKING_VIOLATION_IDS: readonly Era25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessIntegrityViolationId[] =
  [
    "era25_post_steady_product_mode_commercial_ops_rhythm_permanence_integrity_fail",
    "go_integrity_fail",
    "terminal_closure_witness_without_rhythm_permanence",
    "terminal_closure_witness_claims_governance_reopen",
    "continuous_improvement_loop_integrity_fail",
    "fake_terminal_closure_witness_attestation",
    "fake_terminal_closure_witness_report_attestation",
    "baseline_regression",
  ];

function readTerminalClosureWitnessIntegrityBaseline(
  root: string,
): Era25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessIntegrityBaseline | null {
  try {
    const path = join(
      root,
      ERA25_POST_RHYTHM_PERMANENCE_BAND_A_GOVERNANCE_TERMINAL_CLOSURE_WITNESS_INTEGRITY_BASELINE_ARTIFACT,
    );
    if (!existsSync(path)) return null;
    return JSON.parse(
      readFileSync(path, "utf8"),
    ) as Era25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessIntegrityBaseline;
  } catch {
    return null;
  }
}

function parseEnvBoolean(raw: string | undefined): boolean {
  if (raw === undefined) return false;
  const value = raw.trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes";
}

function pushUpstreamRhythmPermanenceViolations(
  violations: Era25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessIntegrityViolation[],
  rhythmPermanenceIntegrity: Era25PostSteadyProductModeCommercialOpsRhythmPermanenceIntegritySummary,
): void {
  if (!rhythmPermanenceIntegrity.goIntegrityPassed) {
    violations.push({
      id: "go_integrity_fail",
      detail:
        "GO artifact fails pilot-gono-go integrity — fix before era25 Band A governance terminal closure witness attest.",
    });
  }
  if (!rhythmPermanenceIntegrity.integrityPassed) {
    violations.push({
      id: "era25_post_steady_product_mode_commercial_ops_rhythm_permanence_integrity_fail",
      detail:
        "Era25 post-steady-product-mode commercial ops rhythm permanence integrity FAIL — complete Phase AR before terminal closure witness.",
    });
  }
}

export function evaluateEra25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessIntegrity(
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
    steadyProductModeIntegrityBaselineOverride?: Era25PostBandAGovernanceSteadyProductModeWitnessIntegrityBaseline | null;
    rhythmPermanenceIntegrityBaselineOverride?: Era25PostSteadyProductModeCommercialOpsRhythmPermanenceIntegrityBaseline | null;
    rhythmPermanenceIntegrityOverride?: Era25PostSteadyProductModeCommercialOpsRhythmPermanenceIntegritySummary | null;
    baselineOverride?: Era25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessIntegrityBaseline | null;
  },
): Era25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessIntegritySummary {
  const env = options?.env ?? process.env;
  const baseline =
    options?.baselineOverride !== undefined
      ? options.baselineOverride
      : readTerminalClosureWitnessIntegrityBaseline(root);

  const rhythmPermanenceIntegrity =
    options?.rhythmPermanenceIntegrityOverride ??
    evaluateEra25PostSteadyProductModeCommercialOpsRhythmPermanenceIntegrity(root, {
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
      capstoneIntegrityBaselineOverride: options?.capstoneIntegrityBaselineOverride,
      steadyProductModeIntegrityBaselineOverride: options?.steadyProductModeIntegrityBaselineOverride,
      baselineOverride: options?.rhythmPermanenceIntegrityBaselineOverride,
    });

  const improvementLoopIntegrity = evaluateContinuousImprovementLoopIntegrity(root, { env });
  const governanceReopenClaimed = detectEra25GovernanceReopenClaimedAfterTerminalClosureWitness(env);
  const goDecision = rhythmPermanenceIntegrity.goDecision;

  const era25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessExecutionStarted =
    detectEra25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessStarted(env);
  const witnessAttested = parseEnvBoolean(
    env.ERA25_POST_RHYTHM_PERMANENCE_BAND_A_GOVERNANCE_TERMINAL_CLOSURE_WITNESS_ERA25_ATTESTED,
  );
  const reportReviewed = parseEnvBoolean(
    env.ERA25_POST_RHYTHM_PERMANENCE_BAND_A_GOVERNANCE_TERMINAL_CLOSURE_WITNESS_ERA25_REPORT_REVIEWED,
  );
  const era25MarketProofGovernanceChainClosed =
    rhythmPermanenceIntegrity.era25MarketProofGovernanceChainClosed;
  const era25GovernanceTrainSealed = rhythmPermanenceIntegrity.era25GovernanceTrainSealed;
  const postSteadyProductModeCommercialOpsRhythmPermanenceActive =
    rhythmPermanenceIntegrity.postSteadyProductModeCommercialOpsRhythmPermanenceActive;
  const witnessPrerequisitesHonest =
    era25MarketProofGovernanceChainClosed &&
    rhythmPermanenceIntegrity.integrityPassed &&
    postSteadyProductModeCommercialOpsRhythmPermanenceActive &&
    era25GovernanceTrainSealed &&
    rhythmPermanenceIntegrity.p0ArtifactProofPassed &&
    improvementLoopIntegrity.integrityPassed &&
    !governanceReopenClaimed;
  const witnessPathActive =
    baseline?.era25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessHonest === true ||
    era25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessExecutionStarted;
  const witnessHonestForAttest = witnessPrerequisitesHonest;
  const postRhythmPermanenceBandAGovernanceTerminalClosureWitnessActive =
    baseline?.postRhythmPermanenceBandAGovernanceTerminalClosureWitnessActive === true ||
    (witnessHonestForAttest && witnessAttested);

  const violations: Era25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessIntegrityViolation[] =
    [];

  if (era25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessExecutionStarted) {
    pushUpstreamRhythmPermanenceViolations(violations, rhythmPermanenceIntegrity);
  }

  if (
    era25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessExecutionStarted &&
    !postSteadyProductModeCommercialOpsRhythmPermanenceActive
  ) {
    violations.push({
      id: "terminal_closure_witness_without_rhythm_permanence",
      detail:
        "ERA25_POST_RHYTHM_PERMANENCE_BAND_A_GOVERNANCE_TERMINAL_CLOSURE_WITNESS_* env present but commercial ops rhythm permanence is not active — complete Phase AR first.",
    });
  }

  if (witnessPathActive && governanceReopenClaimed) {
    violations.push({
      id: "terminal_closure_witness_claims_governance_reopen",
      detail:
        "Mutable era25 convergence governance env keys detected after terminal closure witness path — clear frozen attest keys; era61–AR governance chain must not reopen post-witness.",
    });
  }

  if (
    era25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessExecutionStarted &&
    !improvementLoopIntegrity.integrityPassed
  ) {
    violations.push({
      id: "continuous_improvement_loop_integrity_fail",
      detail:
        "Continuous improvement loop integrity FAIL — sustain honest improvement loop rhythm before Band A governance terminal closure witness.",
    });
  }

  if (
    era25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessExecutionStarted &&
    goDecision !== "GO"
  ) {
    violations.push({
      id: "go_integrity_fail",
      detail: `Terminal closure witness started but GO decision=${goDecision ?? "missing"} — ${PILOT_GONOGO_SUMMARY_ARTIFACT_PATH} must remain honest GO.`,
    });
  }

  if (
    witnessAttested &&
    era25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessExecutionStarted &&
    !witnessHonestForAttest
  ) {
    violations.push({
      id: "fake_terminal_closure_witness_attestation",
      detail:
        "ERA25_POST_RHYTHM_PERMANENCE_BAND_A_GOVERNANCE_TERMINAL_CLOSURE_WITNESS_ERA25_ATTESTED=1 before honest rhythm permanence + improvement loop + terminal closure witness integrity PASS — never attest without ops:validate-era25-post-rhythm-permanence-band-a-governance-terminal-closure-witness-integrity PASS.",
    });
  }

  if (
    reportReviewed &&
    era25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessExecutionStarted &&
    !witnessHonestForAttest
  ) {
    violations.push({
      id: "fake_terminal_closure_witness_report_attestation",
      detail:
        "ERA25_POST_RHYTHM_PERMANENCE_BAND_A_GOVERNANCE_TERMINAL_CLOSURE_WITNESS_ERA25_REPORT_REVIEWED=1 before terminal closure witness integrity PASS — never attest report without ops:validate-era25-post-rhythm-permanence-band-a-governance-terminal-closure-witness-integrity PASS.",
    });
  }

  if (
    baseline?.era25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessHonest &&
    (!era25MarketProofGovernanceChainClosed ||
      !rhythmPermanenceIntegrity.goIntegrityPassed ||
      !postSteadyProductModeCommercialOpsRhythmPermanenceActive ||
      !era25GovernanceTrainSealed ||
      governanceReopenClaimed)
  ) {
    violations.push({
      id: "baseline_regression",
      detail: `Baseline recorded honest Band A terminal closure witness at ${baseline.recordedAt} but rhythm permanence / train seal / GO is no longer honest.`,
    });
  }

  const integrityPassed = !violations.some((row) => BLOCKING_VIOLATION_IDS.includes(row.id));
  const regressionDetected = violations.some((row) => row.id === "baseline_regression");

  return {
    policyId:
      ERA25_POST_RHYTHM_PERMANENCE_BAND_A_GOVERNANCE_TERMINAL_CLOSURE_WITNESS_INTEGRITY_ERA69_POLICY_ID,
    integrityPassed,
    era25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessExecutionStarted,
    era25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessComplete:
      witnessHonestForAttest && rhythmPermanenceIntegrity.integrityPassed,
    era25PostSteadyProductModeCommercialOpsRhythmPermanenceComplete:
      rhythmPermanenceIntegrity.era25PostSteadyProductModeCommercialOpsRhythmPermanenceComplete,
    era25PostSteadyProductModeCommercialOpsRhythmPermanenceIntegrityPassed:
      rhythmPermanenceIntegrity.integrityPassed,
    era25MarketProofGovernanceChainClosed,
    continuousImprovementLoopIntegrityPassed: improvementLoopIntegrity.integrityPassed,
    governanceReopenClaimed,
    era25GovernanceTrainSealed,
    postSteadyProductModeCommercialOpsRhythmPermanenceActive,
    postRhythmPermanenceBandAGovernanceTerminalClosureWitnessActive,
    p0ProofStatus: rhythmPermanenceIntegrity.p0ProofStatus,
    p0ArtifactProofPassed: rhythmPermanenceIntegrity.p0ArtifactProofPassed,
    goDecision,
    goIntegrityPassed: rhythmPermanenceIntegrity.goIntegrityPassed,
    frozenEnvMutationDetected: governanceReopenClaimed,
    baselinePresent: baseline !== null,
    regressionDetected,
    violations,
    recommendedCommands: [
      "npm run ops:validate-era25-post-rhythm-permanence-band-a-governance-terminal-closure-witness-integrity -- --json",
      "npm run ops:validate-era25-post-steady-product-mode-commercial-ops-rhythm-permanence-integrity -- --json",
      "npm run ops:validate-continuous-improvement-loop-integrity -- --json",
      "npm run test:ci:governance-bundles",
      "npm run test:ci:commercial-pilot-runbook:cert",
    ],
  };
}
