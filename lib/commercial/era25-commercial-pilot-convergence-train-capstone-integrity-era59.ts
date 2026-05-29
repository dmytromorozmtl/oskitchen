/**
 * Era25 commercial pilot convergence train capstone integrity.
 * Policy: era59-era25-commercial-pilot-convergence-train-capstone-integrity-v1
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import {
  detectCapstoneGoReferenced,
  detectCapstoneP0ProofReferenced,
  detectEra25CommercialPilotConvergenceTrainCapstoneStarted,
  detectEra25FrozenEnvMutationAfterTrainCapstone,
} from "@/lib/commercial/era25-commercial-pilot-convergence-train-capstone-phases-era59";
import {
  evaluateEra25SteadyStateOperatorLoopLockIntegrity,
  type Era25SteadyStateOperatorLoopLockIntegrityBaseline,
} from "@/lib/commercial/era25-steady-state-operator-loop-lock-integrity-era58";
import { loadPilotGoNoGoSummaryArtifact } from "@/lib/commercial/load-paid-pilot-go-convergence-state-era25";
import { PILOT_GONOGO_SUMMARY_ARTIFACT_PATH } from "@/lib/commercial/market-leader-positioning-phases-era21";
import { loadP0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import { P0_STAGING_PROOF_UNBLOCK_ERA17_SUMMARY_ARTIFACT } from "@/lib/commercial/p0-staging-proof-unblock-era17-policy";
import type { InvestorNarrativeOnepagerSummary } from "@/lib/commercial/investor-narrative-onepager-summary";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { PilotCaseStudyDraftSummary } from "@/lib/commercial/pilot-case-study-draft-summary";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { PilotMetricsBaselineSummary } from "@/lib/commercial/pilot-metrics-baseline-summary";
import type { PilotRollbackDrillSummary } from "@/lib/commercial/pilot-rollback-drill-summary";
import type { Tier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";

export const ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_INTEGRITY_ERA59_POLICY_ID =
  "era59-era25-commercial-pilot-convergence-train-capstone-integrity-v1" as const;

export const ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_INTEGRITY_BASELINE_ARTIFACT =
  "artifacts/era25-commercial-pilot-convergence-train-capstone-integrity-baseline.json" as const;

export type Era25CommercialPilotConvergenceTrainCapstoneIntegrityViolationId =
  | "era25_steady_state_operator_loop_lock_integrity_fail"
  | "continuous_improvement_loop_integrity_fail"
  | "go_integrity_fail"
  | "capstone_without_steady_state_lock"
  | "capstone_claims_p0_pass_without_artifact"
  | "capstone_claims_go_without_gono_go_artifact"
  | "era25_frozen_env_mutation_after_train_capstone"
  | "fake_capstone_attestation"
  | "fake_capstone_report_attestation"
  | "baseline_regression";

export type Era25CommercialPilotConvergenceTrainCapstoneIntegrityViolation = {
  id: Era25CommercialPilotConvergenceTrainCapstoneIntegrityViolationId;
  detail: string;
};

export type Era25CommercialPilotConvergenceTrainCapstoneIntegrityBaseline = {
  era25CommercialPilotConvergenceTrainCapstoneHonest: true;
  recordedAt: string;
  steadyStateLockHonestAttested: true;
  p0ProofStatusAtCapstone: P0StagingProofUnblockSummary["p0ProofStatus"];
  goDecision: "GO" | "NO-GO" | string;
  frozenEnvKeyCount: number;
};

export type Era25CommercialPilotConvergenceTrainCapstoneIntegritySummary = {
  policyId: typeof ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_INTEGRITY_ERA59_POLICY_ID;
  integrityPassed: boolean;
  era25CommercialPilotConvergenceTrainCapstoneExecutionStarted: boolean;
  era25CommercialPilotConvergenceTrainCapstoneComplete: boolean;
  era25SteadyStateOperatorLoopLockComplete: boolean;
  era25SteadyStateOperatorLoopLockIntegrityPassed: boolean;
  p0ProofStatus: string | null;
  p0ArtifactPresent: boolean;
  p0ProofReferencedInCapstone: boolean;
  goDecision: string | null;
  goArtifactPresent: boolean;
  goReferencedInCapstone: boolean;
  goIntegrityPassed: boolean;
  frozenEnvMutationDetected: boolean;
  baselinePresent: boolean;
  regressionDetected: boolean;
  violations: readonly Era25CommercialPilotConvergenceTrainCapstoneIntegrityViolation[];
  recommendedCommands: readonly string[];
};

const BLOCKING_VIOLATION_IDS: readonly Era25CommercialPilotConvergenceTrainCapstoneIntegrityViolationId[] =
  [
    "era25_steady_state_operator_loop_lock_integrity_fail",
    "continuous_improvement_loop_integrity_fail",
    "go_integrity_fail",
    "capstone_without_steady_state_lock",
    "capstone_claims_p0_pass_without_artifact",
    "capstone_claims_go_without_gono_go_artifact",
    "era25_frozen_env_mutation_after_train_capstone",
    "fake_capstone_attestation",
    "fake_capstone_report_attestation",
    "baseline_regression",
  ];

function readTrainCapstoneIntegrityBaseline(
  root: string,
): Era25CommercialPilotConvergenceTrainCapstoneIntegrityBaseline | null {
  try {
    const path = join(root, ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_INTEGRITY_BASELINE_ARTIFACT);
    if (!existsSync(path)) return null;
    return JSON.parse(
      readFileSync(path, "utf8"),
    ) as Era25CommercialPilotConvergenceTrainCapstoneIntegrityBaseline;
  } catch {
    return null;
  }
}

function parseEnvBoolean(raw: string | undefined): boolean {
  if (raw === undefined) return false;
  const value = raw.trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes";
}

function resolveDiskP0ProofStatus(
  root: string,
  p0StagingOverride?: P0StagingProofUnblockSummary | null,
): P0StagingProofUnblockSummary | null {
  if (p0StagingOverride !== undefined) return p0StagingOverride;
  return loadP0StagingProofUnblockSummary(root, p0StagingOverride);
}

function pushUpstreamSteadyStateViolations(
  violations: Era25CommercialPilotConvergenceTrainCapstoneIntegrityViolation[],
  steadyStateIntegrity: ReturnType<typeof evaluateEra25SteadyStateOperatorLoopLockIntegrity>,
): void {
  if (!steadyStateIntegrity.goIntegrityPassed) {
    violations.push({
      id: "go_integrity_fail",
      detail:
        "GO artifact fails pilot-gono-go integrity — fix before era25 commercial pilot convergence train capstone attest.",
    });
  }
  if (!steadyStateIntegrity.integrityPassed) {
    violations.push({
      id: "era25_steady_state_operator_loop_lock_integrity_fail",
      detail:
        "Era25 steady-state operator loop lock integrity FAIL — complete Phase AH before train capstone.",
    });
  }
  if (!steadyStateIntegrity.improvementLoopIntegrityPassed) {
    violations.push({
      id: "continuous_improvement_loop_integrity_fail",
      detail:
        "Continuous improvement loop integrity FAIL — restore loop integrity before train capstone attest.",
    });
  }
}

export function evaluateEra25CommercialPilotConvergenceTrainCapstoneIntegrity(
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
    steadyStateLoopLockIntegrityBaselineOverride?: Era25SteadyStateOperatorLoopLockIntegrityBaseline | null;
    baselineOverride?: Era25CommercialPilotConvergenceTrainCapstoneIntegrityBaseline | null;
  },
): Era25CommercialPilotConvergenceTrainCapstoneIntegritySummary {
  const env = options?.env ?? process.env;
  const baseline =
    options?.baselineOverride !== undefined
      ? options.baselineOverride
      : readTrainCapstoneIntegrityBaseline(root);

  const steadyStateIntegrity = evaluateEra25SteadyStateOperatorLoopLockIntegrity(root, {
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
    baselineOverride: options?.steadyStateLoopLockIntegrityBaselineOverride,
  });

  const diskP0 = resolveDiskP0ProofStatus(root, options?.p0StagingOverride);
  const diskGo =
    options?.goNoGoOverride !== undefined
      ? options.goNoGoOverride
      : loadPilotGoNoGoSummaryArtifact(root);

  const effectiveP0Status =
    options?.p0ProofStatusOverride ??
    options?.p0StagingOverride?.p0ProofStatus ??
    diskP0?.p0ProofStatus ??
    null;
  const artifactP0Honest = diskP0?.p0ProofStatus === "proof_passed";
  const p0ProofReferenced = detectCapstoneP0ProofReferenced(env);
  const goReferenced = detectCapstoneGoReferenced(env);
  const goDecision = steadyStateIntegrity.goDecision;
  const goArtifactHonest = diskGo?.decision === "GO";

  const era25CommercialPilotConvergenceTrainCapstoneExecutionStarted =
    detectEra25CommercialPilotConvergenceTrainCapstoneStarted(env);
  const capstoneAttested = parseEnvBoolean(
    env.ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_ERA25_ATTESTED,
  );
  const reportReviewed = parseEnvBoolean(
    env.ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_ERA25_REPORT_REVIEWED,
  );
  const frozenEnvMutationDetected = detectEra25FrozenEnvMutationAfterTrainCapstone(env);
  const steadyStateLockComplete = steadyStateIntegrity.era25SteadyStateOperatorLoopLockComplete;
  const capstoneHonest =
    steadyStateLockComplete &&
    steadyStateIntegrity.integrityPassed &&
    !frozenEnvMutationDetected;
  const capstonePathActive =
    baseline?.era25CommercialPilotConvergenceTrainCapstoneHonest === true ||
    era25CommercialPilotConvergenceTrainCapstoneExecutionStarted;

  const claimsP0Pass =
    effectiveP0Status === "proof_passed" || p0ProofReferenced;
  const claimsGo = goReferenced || goDecision === "GO";

  const violations: Era25CommercialPilotConvergenceTrainCapstoneIntegrityViolation[] = [];

  if (era25CommercialPilotConvergenceTrainCapstoneExecutionStarted) {
    pushUpstreamSteadyStateViolations(violations, steadyStateIntegrity);
  }

  if (era25CommercialPilotConvergenceTrainCapstoneExecutionStarted && !steadyStateLockComplete) {
    violations.push({
      id: "capstone_without_steady_state_lock",
      detail:
        "ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_* env present but steady-state operator loop lock is not honest — complete Phase AH first.",
    });
  }

  if (capstonePathActive && frozenEnvMutationDetected) {
    violations.push({
      id: "era25_frozen_env_mutation_after_train_capstone",
      detail:
        "Mutable era25 convergence / steady-state env keys detected after train capstone path is active — clear frozen keys; sustain only improvement loop + Band A P0 execution.",
    });
  }

  if (
    capstonePathActive &&
    claimsP0Pass &&
    !artifactP0Honest
  ) {
    violations.push({
      id: "capstone_claims_p0_pass_without_artifact",
      detail: `Capstone references proof_passed but ${P0_STAGING_PROOF_UNBLOCK_ERA17_SUMMARY_ARTIFACT} is not honestly proof_passed (status=${diskP0?.p0ProofStatus ?? "missing"}) — run smoke:p0-staging-proof-unblock after ops vault; never fake P0 in capstone rollup.`,
    });
  }

  if (capstonePathActive && claimsGo && !goArtifactHonest) {
    violations.push({
      id: "capstone_claims_go_without_gono_go_artifact",
      detail: `Capstone references GO but ${PILOT_GONOGO_SUMMARY_ARTIFACT_PATH} is not honestly GO (decision=${diskGo?.decision ?? "missing"}) — keep governance GO separate from market proof until artifact is honest.`,
    });
  }

  if (era25CommercialPilotConvergenceTrainCapstoneExecutionStarted && goDecision !== "GO") {
    violations.push({
      id: "go_integrity_fail",
      detail: `Train capstone started but GO decision=${goDecision ?? "missing"} — ${PILOT_GONOGO_SUMMARY_ARTIFACT_PATH} must remain honest GO for era25 governance closure.`,
    });
  }

  if (
    capstoneAttested &&
    era25CommercialPilotConvergenceTrainCapstoneExecutionStarted &&
    !capstoneHonest
  ) {
    violations.push({
      id: "fake_capstone_attestation",
      detail:
        "ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_ERA25_ATTESTED=1 before honest steady-state lock + capstone integrity PASS — never attest without ops:validate-era25-commercial-pilot-convergence-train-capstone-integrity PASS.",
    });
  }

  if (
    reportReviewed &&
    era25CommercialPilotConvergenceTrainCapstoneExecutionStarted &&
    !capstoneHonest
  ) {
    violations.push({
      id: "fake_capstone_report_attestation",
      detail:
        "ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_ERA25_REPORT_REVIEWED=1 before train capstone integrity PASS — never attest report without ops:validate-era25-commercial-pilot-convergence-train-capstone-integrity PASS.",
    });
  }

  if (
    baseline?.era25CommercialPilotConvergenceTrainCapstoneHonest &&
    (!steadyStateLockComplete ||
      !steadyStateIntegrity.goIntegrityPassed ||
      frozenEnvMutationDetected)
  ) {
    violations.push({
      id: "baseline_regression",
      detail: `Baseline recorded honest train capstone at ${baseline.recordedAt} but steady-state lock / GO is no longer honest.`,
    });
  }

  const integrityPassed = !violations.some((row) => BLOCKING_VIOLATION_IDS.includes(row.id));
  const regressionDetected = violations.some((row) => row.id === "baseline_regression");

  return {
    policyId: ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_INTEGRITY_ERA59_POLICY_ID,
    integrityPassed,
    era25CommercialPilotConvergenceTrainCapstoneExecutionStarted,
    era25CommercialPilotConvergenceTrainCapstoneComplete:
      capstoneHonest && steadyStateIntegrity.integrityPassed,
    era25SteadyStateOperatorLoopLockComplete: steadyStateLockComplete,
    era25SteadyStateOperatorLoopLockIntegrityPassed: steadyStateIntegrity.integrityPassed,
    p0ProofStatus: effectiveP0Status,
    p0ArtifactPresent: diskP0 !== null,
    p0ProofReferencedInCapstone: p0ProofReferenced,
    goDecision,
    goArtifactPresent: diskGo !== null,
    goReferencedInCapstone: goReferenced,
    goIntegrityPassed: steadyStateIntegrity.goIntegrityPassed,
    frozenEnvMutationDetected,
    baselinePresent: baseline !== null,
    regressionDetected,
    violations,
    recommendedCommands: [
      "npm run ops:validate-era25-commercial-pilot-convergence-train-capstone-integrity -- --json",
      "npm run ops:validate-era25-steady-state-operator-loop-lock-integrity -- --json",
      "npm run ops:validate-p0-staging-proof-integrity -- --json",
      "npm run smoke:p0-staging-proof-unblock",
      "npm run test:ci:governance-bundles",
      "npm run test:ci:commercial-pilot-runbook:cert",
    ],
  };
}
