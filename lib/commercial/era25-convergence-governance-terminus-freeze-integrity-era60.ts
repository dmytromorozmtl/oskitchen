/**
 * Era25 convergence governance terminus freeze integrity.
 * Policy: era60-era25-convergence-governance-terminus-freeze-integrity-v1
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import {
  detectEra25ConvergenceGovernanceTerminusFreezeStarted,
  detectEra25FrozenEnvMutationAfterGovernanceTerminusFreeze,
  detectTerminusFreezeMarketProofReferenced,
} from "@/lib/commercial/era25-convergence-governance-terminus-freeze-phases-era60";
import {
  evaluateEra25CommercialPilotConvergenceTrainCapstoneIntegrity,
  type Era25CommercialPilotConvergenceTrainCapstoneIntegrityBaseline,
} from "@/lib/commercial/era25-commercial-pilot-convergence-train-capstone-integrity-era59";
import { loadP0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import { P0_STAGING_PROOF_UNBLOCK_ERA17_SUMMARY_ARTIFACT } from "@/lib/commercial/p0-staging-proof-unblock-era17-policy";
import { PILOT_GONOGO_SUMMARY_ARTIFACT_PATH } from "@/lib/commercial/market-leader-positioning-phases-era21";
import type { InvestorNarrativeOnepagerSummary } from "@/lib/commercial/investor-narrative-onepager-summary";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { PilotCaseStudyDraftSummary } from "@/lib/commercial/pilot-case-study-draft-summary";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { PilotMetricsBaselineSummary } from "@/lib/commercial/pilot-metrics-baseline-summary";
import type { PilotRollbackDrillSummary } from "@/lib/commercial/pilot-rollback-drill-summary";
import type { Tier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";

export const ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_INTEGRITY_ERA60_POLICY_ID =
  "era60-era25-convergence-governance-terminus-freeze-integrity-v1" as const;

export const ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_INTEGRITY_BASELINE_ARTIFACT =
  "artifacts/era25-convergence-governance-terminus-freeze-integrity-baseline.json" as const;

export type Era25ConvergenceGovernanceTerminusFreezeIntegrityViolationId =
  | "era25_commercial_pilot_convergence_train_capstone_integrity_fail"
  | "go_integrity_fail"
  | "terminus_freeze_without_capstone"
  | "terminus_claims_market_proof_without_p0_artifact"
  | "era25_frozen_env_mutation_after_terminus_freeze"
  | "fake_terminus_freeze_attestation"
  | "fake_terminus_freeze_report_attestation"
  | "baseline_regression";

export type Era25ConvergenceGovernanceTerminusFreezeIntegrityViolation = {
  id: Era25ConvergenceGovernanceTerminusFreezeIntegrityViolationId;
  detail: string;
};

export type Era25ConvergenceGovernanceTerminusFreezeIntegrityBaseline = {
  era25ConvergenceGovernanceTerminusFreezeHonest: true;
  recordedAt: string;
  trainCapstoneHonestAttested: true;
  p0ProofStatusAtFreeze: P0StagingProofUnblockSummary["p0ProofStatus"];
  goDecision: "GO" | "NO-GO" | string;
  frozenEnvKeyCount: number;
  era25ProductConvergenceSurfacesSuppressed: true;
};

export type Era25ConvergenceGovernanceTerminusFreezeIntegritySummary = {
  policyId: typeof ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_INTEGRITY_ERA60_POLICY_ID;
  integrityPassed: boolean;
  era25ConvergenceGovernanceTerminusFreezeExecutionStarted: boolean;
  era25ConvergenceGovernanceTerminusFreezeComplete: boolean;
  era25CommercialPilotConvergenceTrainCapstoneComplete: boolean;
  era25CommercialPilotConvergenceTrainCapstoneIntegrityPassed: boolean;
  era25ProductConvergenceSurfacesSuppressed: boolean;
  p0ProofStatus: string | null;
  p0ArtifactPresent: boolean;
  marketProofReferencedInTerminusFreeze: boolean;
  goDecision: string | null;
  goIntegrityPassed: boolean;
  frozenEnvMutationDetected: boolean;
  baselinePresent: boolean;
  regressionDetected: boolean;
  violations: readonly Era25ConvergenceGovernanceTerminusFreezeIntegrityViolation[];
  recommendedCommands: readonly string[];
};

const BLOCKING_VIOLATION_IDS: readonly Era25ConvergenceGovernanceTerminusFreezeIntegrityViolationId[] =
  [
    "era25_commercial_pilot_convergence_train_capstone_integrity_fail",
    "go_integrity_fail",
    "terminus_freeze_without_capstone",
    "terminus_claims_market_proof_without_p0_artifact",
    "era25_frozen_env_mutation_after_terminus_freeze",
    "fake_terminus_freeze_attestation",
    "fake_terminus_freeze_report_attestation",
    "baseline_regression",
  ];

function readTerminusFreezeIntegrityBaseline(
  root: string,
): Era25ConvergenceGovernanceTerminusFreezeIntegrityBaseline | null {
  try {
    const path = join(root, ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_INTEGRITY_BASELINE_ARTIFACT);
    if (!existsSync(path)) return null;
    return JSON.parse(
      readFileSync(path, "utf8"),
    ) as Era25ConvergenceGovernanceTerminusFreezeIntegrityBaseline;
  } catch {
    return null;
  }
}

function parseEnvBoolean(raw: string | undefined): boolean {
  if (raw === undefined) return false;
  const value = raw.trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes";
}

function resolveDiskP0(
  root: string,
  p0StagingOverride?: P0StagingProofUnblockSummary | null,
): P0StagingProofUnblockSummary | null {
  if (p0StagingOverride !== undefined) return p0StagingOverride;
  return loadP0StagingProofUnblockSummary(root, p0StagingOverride);
}

function pushUpstreamCapstoneViolations(
  violations: Era25ConvergenceGovernanceTerminusFreezeIntegrityViolation[],
  capstoneIntegrity: ReturnType<typeof evaluateEra25CommercialPilotConvergenceTrainCapstoneIntegrity>,
): void {
  if (!capstoneIntegrity.goIntegrityPassed) {
    violations.push({
      id: "go_integrity_fail",
      detail:
        "GO artifact fails pilot-gono-go integrity — fix before era25 convergence governance terminus freeze attest.",
    });
  }
  if (!capstoneIntegrity.integrityPassed) {
    violations.push({
      id: "era25_commercial_pilot_convergence_train_capstone_integrity_fail",
      detail:
        "Era25 commercial pilot convergence train capstone integrity FAIL — complete Phase AI before governance terminus freeze.",
    });
  }
}

export function evaluateEra25ConvergenceGovernanceTerminusFreezeIntegrity(
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
    trainCapstoneIntegrityBaselineOverride?: Era25CommercialPilotConvergenceTrainCapstoneIntegrityBaseline | null;
    baselineOverride?: Era25ConvergenceGovernanceTerminusFreezeIntegrityBaseline | null;
  },
): Era25ConvergenceGovernanceTerminusFreezeIntegritySummary {
  const env = options?.env ?? process.env;
  const baseline =
    options?.baselineOverride !== undefined
      ? options.baselineOverride
      : readTerminusFreezeIntegrityBaseline(root);

  const capstoneIntegrity = evaluateEra25CommercialPilotConvergenceTrainCapstoneIntegrity(root, {
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
    baselineOverride: options?.trainCapstoneIntegrityBaselineOverride,
  });

  const diskP0 = resolveDiskP0(root, options?.p0StagingOverride);
  const effectiveP0Status =
    options?.p0ProofStatusOverride ??
    options?.p0StagingOverride?.p0ProofStatus ??
    diskP0?.p0ProofStatus ??
    null;
  const artifactP0Honest = diskP0?.p0ProofStatus === "proof_passed";
  const marketProofReferenced = detectTerminusFreezeMarketProofReferenced(env);
  const goDecision = capstoneIntegrity.goDecision;

  const era25ConvergenceGovernanceTerminusFreezeExecutionStarted =
    detectEra25ConvergenceGovernanceTerminusFreezeStarted(env);
  const terminusFreezeAttested = parseEnvBoolean(
    env.ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_ERA25_ATTESTED,
  );
  const reportReviewed = parseEnvBoolean(
    env.ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_ERA25_REPORT_REVIEWED,
  );
  const frozenEnvMutationDetected = detectEra25FrozenEnvMutationAfterGovernanceTerminusFreeze(env);
  const trainCapstoneComplete =
    capstoneIntegrity.era25CommercialPilotConvergenceTrainCapstoneComplete;
  const terminusFreezeHonest =
    trainCapstoneComplete &&
    capstoneIntegrity.integrityPassed &&
    !frozenEnvMutationDetected;
  const terminusFreezePathActive =
    baseline?.era25ConvergenceGovernanceTerminusFreezeHonest === true ||
    era25ConvergenceGovernanceTerminusFreezeExecutionStarted;
  const era25ProductConvergenceSurfacesSuppressed =
    baseline?.era25ConvergenceGovernanceTerminusFreezeHonest === true ||
    (terminusFreezeHonest && terminusFreezeAttested);

  const claimsMarketProof =
    effectiveP0Status === "proof_passed" || marketProofReferenced;

  const violations: Era25ConvergenceGovernanceTerminusFreezeIntegrityViolation[] = [];

  if (era25ConvergenceGovernanceTerminusFreezeExecutionStarted) {
    pushUpstreamCapstoneViolations(violations, capstoneIntegrity);
  }

  if (era25ConvergenceGovernanceTerminusFreezeExecutionStarted && !trainCapstoneComplete) {
    violations.push({
      id: "terminus_freeze_without_capstone",
      detail:
        "ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_* env present but train capstone is not honest — complete Phase AI first.",
    });
  }

  if (terminusFreezePathActive && frozenEnvMutationDetected) {
    violations.push({
      id: "era25_frozen_env_mutation_after_terminus_freeze",
      detail:
        "Mutable era25 convergence governance env keys detected after terminus freeze path is active — clear frozen keys; sustain only improvement loop + Band A P0 execution.",
    });
  }

  if (terminusFreezePathActive && claimsMarketProof && !artifactP0Honest) {
    violations.push({
      id: "terminus_claims_market_proof_without_p0_artifact",
      detail: `Terminus freeze references market proof_passed but ${P0_STAGING_PROOF_UNBLOCK_ERA17_SUMMARY_ARTIFACT} is not honestly proof_passed (status=${diskP0?.p0ProofStatus ?? "missing"}) — execute ops vault + smoke:p0-staging-proof-unblock; governance freeze does not substitute for market proof.`,
    });
  }

  if (era25ConvergenceGovernanceTerminusFreezeExecutionStarted && goDecision !== "GO") {
    violations.push({
      id: "go_integrity_fail",
      detail: `Terminus freeze started but GO decision=${goDecision ?? "missing"} — ${PILOT_GONOGO_SUMMARY_ARTIFACT_PATH} must remain honest GO for era25 governance closure.`,
    });
  }

  if (
    terminusFreezeAttested &&
    era25ConvergenceGovernanceTerminusFreezeExecutionStarted &&
    !terminusFreezeHonest
  ) {
    violations.push({
      id: "fake_terminus_freeze_attestation",
      detail:
        "ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_ERA25_ATTESTED=1 before honest train capstone + terminus freeze integrity PASS — never attest without ops:validate-era25-convergence-governance-terminus-freeze-integrity PASS.",
    });
  }

  if (
    reportReviewed &&
    era25ConvergenceGovernanceTerminusFreezeExecutionStarted &&
    !terminusFreezeHonest
  ) {
    violations.push({
      id: "fake_terminus_freeze_report_attestation",
      detail:
        "ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_ERA25_REPORT_REVIEWED=1 before terminus freeze integrity PASS — never attest report without ops:validate-era25-convergence-governance-terminus-freeze-integrity PASS.",
    });
  }

  if (
    baseline?.era25ConvergenceGovernanceTerminusFreezeHonest &&
    (!trainCapstoneComplete ||
      !capstoneIntegrity.goIntegrityPassed ||
      frozenEnvMutationDetected)
  ) {
    violations.push({
      id: "baseline_regression",
      detail: `Baseline recorded honest governance terminus freeze at ${baseline.recordedAt} but train capstone / GO is no longer honest.`,
    });
  }

  const integrityPassed = !violations.some((row) => BLOCKING_VIOLATION_IDS.includes(row.id));
  const regressionDetected = violations.some((row) => row.id === "baseline_regression");

  return {
    policyId: ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_INTEGRITY_ERA60_POLICY_ID,
    integrityPassed,
    era25ConvergenceGovernanceTerminusFreezeExecutionStarted,
    era25ConvergenceGovernanceTerminusFreezeComplete:
      terminusFreezeHonest && capstoneIntegrity.integrityPassed,
    era25CommercialPilotConvergenceTrainCapstoneComplete: trainCapstoneComplete,
    era25CommercialPilotConvergenceTrainCapstoneIntegrityPassed: capstoneIntegrity.integrityPassed,
    era25ProductConvergenceSurfacesSuppressed,
    p0ProofStatus: effectiveP0Status,
    p0ArtifactPresent: diskP0 !== null,
    marketProofReferencedInTerminusFreeze: marketProofReferenced,
    goDecision,
    goIntegrityPassed: capstoneIntegrity.goIntegrityPassed,
    frozenEnvMutationDetected,
    baselinePresent: baseline !== null,
    regressionDetected,
    violations,
    recommendedCommands: [
      "npm run ops:validate-era25-convergence-governance-terminus-freeze-integrity -- --json",
      "npm run ops:validate-era25-commercial-pilot-convergence-train-capstone-integrity -- --json",
      "npm run ops:validate-p0-staging-proof-integrity -- --json",
      "npm run smoke:p0-staging-proof-unblock",
      "npm run test:ci:governance-bundles",
      "npm run test:ci:commercial-pilot-runbook:cert",
    ],
  };
}
