/**
 * Era25 post-steady-product-mode commercial ops rhythm permanence integrity.
 * Policy: era68-era25-post-steady-product-mode-commercial-ops-rhythm-permanence-integrity-v1
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import { evaluateContinuousImprovementLoopIntegrity } from "@/lib/commercial/continuous-improvement-loop-integrity-era34";
import type { Era25BandAGovernanceChainCapstoneWitnessIntegrityBaseline } from "@/lib/commercial/era25-band-a-governance-chain-capstone-witness-integrity-era66";
import {
  evaluateEra25PostBandAGovernanceSteadyProductModeWitnessIntegrity,
  type Era25PostBandAGovernanceSteadyProductModeWitnessIntegrityBaseline,
  type Era25PostBandAGovernanceSteadyProductModeWitnessIntegritySummary,
} from "@/lib/commercial/era25-post-band-a-governance-steady-product-mode-witness-integrity-era67";
import {
  detectEra25GovernanceReopenClaimedAfterCommercialOpsRhythmPermanence,
  detectEra25PostSteadyProductModeCommercialOpsRhythmPermanenceStarted,
} from "@/lib/commercial/era25-post-steady-product-mode-commercial-ops-rhythm-permanence-phases-era68";
import { PILOT_GONOGO_SUMMARY_ARTIFACT_PATH } from "@/lib/commercial/market-leader-positioning-phases-era21";
import type { InvestorNarrativeOnepagerSummary } from "@/lib/commercial/investor-narrative-onepager-summary";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { PilotCaseStudyDraftSummary } from "@/lib/commercial/pilot-case-study-draft-summary";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { PilotMetricsBaselineSummary } from "@/lib/commercial/pilot-metrics-baseline-summary";
import type { PilotRollbackDrillSummary } from "@/lib/commercial/pilot-rollback-drill-summary";
import type { Tier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";
import type { Era25PostTerminalSealCommercialOpsPermanenceIntegrityBaseline } from "@/lib/commercial/era25-post-terminal-seal-commercial-ops-permanence-integrity-era65";

export const ERA25_POST_STEADY_PRODUCT_MODE_COMMERCIAL_OPS_RHYTHM_PERMANENCE_INTEGRITY_ERA68_POLICY_ID =
  "era68-era25-post-steady-product-mode-commercial-ops-rhythm-permanence-integrity-v1" as const;

export const ERA25_POST_STEADY_PRODUCT_MODE_COMMERCIAL_OPS_RHYTHM_PERMANENCE_INTEGRITY_BASELINE_ARTIFACT =
  "artifacts/era25-post-steady-product-mode-commercial-ops-rhythm-permanence-integrity-baseline.json" as const;

export type Era25PostSteadyProductModeCommercialOpsRhythmPermanenceIntegrityViolationId =
  | "era25_post_band_a_governance_steady_product_mode_witness_integrity_fail"
  | "go_integrity_fail"
  | "commercial_ops_rhythm_permanence_without_steady_product_mode"
  | "commercial_ops_rhythm_permanence_claims_governance_reopen"
  | "continuous_improvement_loop_integrity_fail"
  | "fake_commercial_ops_rhythm_permanence_attestation"
  | "fake_commercial_ops_rhythm_permanence_report_attestation"
  | "baseline_regression";

export type Era25PostSteadyProductModeCommercialOpsRhythmPermanenceIntegrityViolation = {
  id: Era25PostSteadyProductModeCommercialOpsRhythmPermanenceIntegrityViolationId;
  detail: string;
};

export type Era25PostSteadyProductModeCommercialOpsRhythmPermanenceIntegrityBaseline = {
  era25PostSteadyProductModeCommercialOpsRhythmPermanenceHonest: true;
  recordedAt: string;
  era25MarketProofGovernanceChainClosedAtRhythmPermanence: true;
  era25GovernanceTrainSealedAtRhythmPermanence: true;
  postBandAGovernanceSteadyProductModeWitnessActiveAtRhythmPermanence: true;
  p0ProofStatusAtRhythmPermanence: "proof_passed";
  goDecision: "GO" | "NO-GO" | string;
  frozenEnvKeyCount: number;
  postSteadyProductModeCommercialOpsRhythmPermanenceActive: true;
};

export type Era25PostSteadyProductModeCommercialOpsRhythmPermanenceIntegritySummary = {
  policyId: typeof ERA25_POST_STEADY_PRODUCT_MODE_COMMERCIAL_OPS_RHYTHM_PERMANENCE_INTEGRITY_ERA68_POLICY_ID;
  integrityPassed: boolean;
  era25PostSteadyProductModeCommercialOpsRhythmPermanenceExecutionStarted: boolean;
  era25PostSteadyProductModeCommercialOpsRhythmPermanenceComplete: boolean;
  era25PostBandAGovernanceSteadyProductModeWitnessComplete: boolean;
  era25PostBandAGovernanceSteadyProductModeWitnessIntegrityPassed: boolean;
  era25MarketProofGovernanceChainClosed: boolean;
  continuousImprovementLoopIntegrityPassed: boolean;
  governanceReopenClaimed: boolean;
  era25GovernanceTrainSealed: boolean;
  postBandAGovernanceSteadyProductModeWitnessActive: boolean;
  postSteadyProductModeCommercialOpsRhythmPermanenceActive: boolean;
  p0ProofStatus: string | null;
  p0ArtifactProofPassed: boolean;
  goDecision: string | null;
  goIntegrityPassed: boolean;
  frozenEnvMutationDetected: boolean;
  baselinePresent: boolean;
  regressionDetected: boolean;
  violations: readonly Era25PostSteadyProductModeCommercialOpsRhythmPermanenceIntegrityViolation[];
  recommendedCommands: readonly string[];
};

const BLOCKING_VIOLATION_IDS: readonly Era25PostSteadyProductModeCommercialOpsRhythmPermanenceIntegrityViolationId[] =
  [
    "era25_post_band_a_governance_steady_product_mode_witness_integrity_fail",
    "go_integrity_fail",
    "commercial_ops_rhythm_permanence_without_steady_product_mode",
    "commercial_ops_rhythm_permanence_claims_governance_reopen",
    "continuous_improvement_loop_integrity_fail",
    "fake_commercial_ops_rhythm_permanence_attestation",
    "fake_commercial_ops_rhythm_permanence_report_attestation",
    "baseline_regression",
  ];

function readRhythmPermanenceIntegrityBaseline(
  root: string,
): Era25PostSteadyProductModeCommercialOpsRhythmPermanenceIntegrityBaseline | null {
  try {
    const path = join(
      root,
      ERA25_POST_STEADY_PRODUCT_MODE_COMMERCIAL_OPS_RHYTHM_PERMANENCE_INTEGRITY_BASELINE_ARTIFACT,
    );
    if (!existsSync(path)) return null;
    return JSON.parse(
      readFileSync(path, "utf8"),
    ) as Era25PostSteadyProductModeCommercialOpsRhythmPermanenceIntegrityBaseline;
  } catch {
    return null;
  }
}

function parseEnvBoolean(raw: string | undefined): boolean {
  if (raw === undefined) return false;
  const value = raw.trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes";
}

function pushUpstreamSteadyProductModeViolations(
  violations: Era25PostSteadyProductModeCommercialOpsRhythmPermanenceIntegrityViolation[],
  steadyProductModeIntegrity: Era25PostBandAGovernanceSteadyProductModeWitnessIntegritySummary,
): void {
  if (!steadyProductModeIntegrity.goIntegrityPassed) {
    violations.push({
      id: "go_integrity_fail",
      detail:
        "GO artifact fails pilot-gono-go integrity — fix before era25 commercial ops rhythm permanence attest.",
    });
  }
  if (!steadyProductModeIntegrity.integrityPassed) {
    violations.push({
      id: "era25_post_band_a_governance_steady_product_mode_witness_integrity_fail",
      detail:
        "Era25 post-band-a-governance steady product mode witness integrity FAIL — complete Phase AQ before commercial ops rhythm permanence.",
    });
  }
}

export function evaluateEra25PostSteadyProductModeCommercialOpsRhythmPermanenceIntegrity(
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
    steadyProductModeIntegrityOverride?: Era25PostBandAGovernanceSteadyProductModeWitnessIntegritySummary | null;
    baselineOverride?: Era25PostSteadyProductModeCommercialOpsRhythmPermanenceIntegrityBaseline | null;
  },
): Era25PostSteadyProductModeCommercialOpsRhythmPermanenceIntegritySummary {
  const env = options?.env ?? process.env;
  const baseline =
    options?.baselineOverride !== undefined
      ? options.baselineOverride
      : readRhythmPermanenceIntegrityBaseline(root);

  const steadyProductModeIntegrity =
    options?.steadyProductModeIntegrityOverride ??
    evaluateEra25PostBandAGovernanceSteadyProductModeWitnessIntegrity(root, {
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
      baselineOverride: options?.steadyProductModeIntegrityBaselineOverride,
    });

  const improvementLoopIntegrity = evaluateContinuousImprovementLoopIntegrity(root, { env });
  const governanceReopenClaimed =
    detectEra25GovernanceReopenClaimedAfterCommercialOpsRhythmPermanence(env);
  const goDecision = steadyProductModeIntegrity.goDecision;

  const era25PostSteadyProductModeCommercialOpsRhythmPermanenceExecutionStarted =
    detectEra25PostSteadyProductModeCommercialOpsRhythmPermanenceStarted(env);
  const permanenceAttested = parseEnvBoolean(
    env.ERA25_POST_STEADY_PRODUCT_MODE_COMMERCIAL_OPS_RHYTHM_PERMANENCE_ERA25_ATTESTED,
  );
  const reportReviewed = parseEnvBoolean(
    env.ERA25_POST_STEADY_PRODUCT_MODE_COMMERCIAL_OPS_RHYTHM_PERMANENCE_ERA25_REPORT_REVIEWED,
  );
  const era25MarketProofGovernanceChainClosed =
    steadyProductModeIntegrity.era25MarketProofGovernanceChainClosed;
  const era25GovernanceTrainSealed = steadyProductModeIntegrity.era25GovernanceTrainSealed;
  const postBandAGovernanceSteadyProductModeWitnessActive =
    steadyProductModeIntegrity.postBandAGovernanceSteadyProductModeWitnessActive;
  const permanencePrerequisitesHonest =
    era25MarketProofGovernanceChainClosed &&
    steadyProductModeIntegrity.integrityPassed &&
    postBandAGovernanceSteadyProductModeWitnessActive &&
    era25GovernanceTrainSealed &&
    steadyProductModeIntegrity.p0ArtifactProofPassed &&
    improvementLoopIntegrity.integrityPassed &&
    !governanceReopenClaimed;
  const permanencePathActive =
    baseline?.era25PostSteadyProductModeCommercialOpsRhythmPermanenceHonest === true ||
    era25PostSteadyProductModeCommercialOpsRhythmPermanenceExecutionStarted;
  const permanenceHonestForAttest = permanencePrerequisitesHonest;
  const postSteadyProductModeCommercialOpsRhythmPermanenceActive =
    baseline?.postSteadyProductModeCommercialOpsRhythmPermanenceActive === true ||
    (permanenceHonestForAttest && permanenceAttested);

  const violations: Era25PostSteadyProductModeCommercialOpsRhythmPermanenceIntegrityViolation[] =
    [];

  if (era25PostSteadyProductModeCommercialOpsRhythmPermanenceExecutionStarted) {
    pushUpstreamSteadyProductModeViolations(violations, steadyProductModeIntegrity);
  }

  if (
    era25PostSteadyProductModeCommercialOpsRhythmPermanenceExecutionStarted &&
    !postBandAGovernanceSteadyProductModeWitnessActive
  ) {
    violations.push({
      id: "commercial_ops_rhythm_permanence_without_steady_product_mode",
      detail:
        "ERA25_POST_STEADY_PRODUCT_MODE_COMMERCIAL_OPS_RHYTHM_PERMANENCE_* env present but steady product mode witness is not active — complete Phase AQ first.",
    });
  }

  if (permanencePathActive && governanceReopenClaimed) {
    violations.push({
      id: "commercial_ops_rhythm_permanence_claims_governance_reopen",
      detail:
        "Mutable era25 convergence governance env keys detected after commercial ops rhythm permanence path — clear frozen attest keys; era61–AQ governance chain must not reopen post-permanence.",
    });
  }

  if (
    era25PostSteadyProductModeCommercialOpsRhythmPermanenceExecutionStarted &&
    !improvementLoopIntegrity.integrityPassed
  ) {
    violations.push({
      id: "continuous_improvement_loop_integrity_fail",
      detail:
        "Continuous improvement loop integrity FAIL — sustain honest improvement loop rhythm before commercial ops rhythm permanence.",
    });
  }

  if (
    era25PostSteadyProductModeCommercialOpsRhythmPermanenceExecutionStarted &&
    goDecision !== "GO"
  ) {
    violations.push({
      id: "go_integrity_fail",
      detail: `Commercial ops rhythm permanence started but GO decision=${goDecision ?? "missing"} — ${PILOT_GONOGO_SUMMARY_ARTIFACT_PATH} must remain honest GO.`,
    });
  }

  if (
    permanenceAttested &&
    era25PostSteadyProductModeCommercialOpsRhythmPermanenceExecutionStarted &&
    !permanenceHonestForAttest
  ) {
    violations.push({
      id: "fake_commercial_ops_rhythm_permanence_attestation",
      detail:
        "ERA25_POST_STEADY_PRODUCT_MODE_COMMERCIAL_OPS_RHYTHM_PERMANENCE_ERA25_ATTESTED=1 before honest steady product mode witness + improvement loop + rhythm permanence integrity PASS — never attest without ops:validate-era25-post-steady-product-mode-commercial-ops-rhythm-permanence-integrity PASS.",
    });
  }

  if (
    reportReviewed &&
    era25PostSteadyProductModeCommercialOpsRhythmPermanenceExecutionStarted &&
    !permanenceHonestForAttest
  ) {
    violations.push({
      id: "fake_commercial_ops_rhythm_permanence_report_attestation",
      detail:
        "ERA25_POST_STEADY_PRODUCT_MODE_COMMERCIAL_OPS_RHYTHM_PERMANENCE_ERA25_REPORT_REVIEWED=1 before rhythm permanence integrity PASS — never attest report without ops:validate-era25-post-steady-product-mode-commercial-ops-rhythm-permanence-integrity PASS.",
    });
  }

  if (
    baseline?.era25PostSteadyProductModeCommercialOpsRhythmPermanenceHonest &&
    (!era25MarketProofGovernanceChainClosed ||
      !steadyProductModeIntegrity.goIntegrityPassed ||
      !postBandAGovernanceSteadyProductModeWitnessActive ||
      !era25GovernanceTrainSealed ||
      governanceReopenClaimed)
  ) {
    violations.push({
      id: "baseline_regression",
      detail: `Baseline recorded honest commercial ops rhythm permanence at ${baseline.recordedAt} but steady product mode witness / train seal / GO is no longer honest.`,
    });
  }

  const integrityPassed = !violations.some((row) => BLOCKING_VIOLATION_IDS.includes(row.id));
  const regressionDetected = violations.some((row) => row.id === "baseline_regression");

  return {
    policyId: ERA25_POST_STEADY_PRODUCT_MODE_COMMERCIAL_OPS_RHYTHM_PERMANENCE_INTEGRITY_ERA68_POLICY_ID,
    integrityPassed,
    era25PostSteadyProductModeCommercialOpsRhythmPermanenceExecutionStarted,
    era25PostSteadyProductModeCommercialOpsRhythmPermanenceComplete:
      permanenceHonestForAttest && steadyProductModeIntegrity.integrityPassed,
    era25PostBandAGovernanceSteadyProductModeWitnessComplete:
      steadyProductModeIntegrity.era25PostBandAGovernanceSteadyProductModeWitnessComplete,
    era25PostBandAGovernanceSteadyProductModeWitnessIntegrityPassed:
      steadyProductModeIntegrity.integrityPassed,
    era25MarketProofGovernanceChainClosed,
    continuousImprovementLoopIntegrityPassed: improvementLoopIntegrity.integrityPassed,
    governanceReopenClaimed,
    era25GovernanceTrainSealed,
    postBandAGovernanceSteadyProductModeWitnessActive,
    postSteadyProductModeCommercialOpsRhythmPermanenceActive,
    p0ProofStatus: steadyProductModeIntegrity.p0ProofStatus,
    p0ArtifactProofPassed: steadyProductModeIntegrity.p0ArtifactProofPassed,
    goDecision,
    goIntegrityPassed: steadyProductModeIntegrity.goIntegrityPassed,
    frozenEnvMutationDetected: governanceReopenClaimed,
    baselinePresent: baseline !== null,
    regressionDetected,
    violations,
    recommendedCommands: [
      "npm run ops:validate-era25-post-steady-product-mode-commercial-ops-rhythm-permanence-integrity -- --json",
      "npm run ops:validate-era25-post-band-a-governance-steady-product-mode-witness-integrity -- --json",
      "npm run ops:validate-continuous-improvement-loop-integrity -- --json",
      "npm run test:ci:governance-bundles",
      "npm run test:ci:commercial-pilot-runbook:cert",
    ],
  };
}
