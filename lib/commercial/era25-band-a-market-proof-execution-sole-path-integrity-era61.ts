/**
 * Era25 Band A market proof execution sole-path integrity.
 * Policy: era61-era25-band-a-market-proof-execution-sole-path-integrity-v1
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import {
  detectEra25BandAMarketProofExecutionSolePathStarted,
  detectEra25FrozenEnvMutationAfterSolePath,
  detectSolePathP0ProofReferenced,
} from "@/lib/commercial/era25-band-a-market-proof-execution-sole-path-phases-era61";
import {
  evaluateEra25ConvergenceGovernanceTerminusFreezeIntegrity,
  type Era25ConvergenceGovernanceTerminusFreezeIntegrityBaseline,
  type Era25ConvergenceGovernanceTerminusFreezeIntegritySummary,
} from "@/lib/commercial/era25-convergence-governance-terminus-freeze-integrity-era60";
import { loadP0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import { P0_STAGING_PROOF_UNBLOCK_ERA17_SUMMARY_ARTIFACT } from "@/lib/commercial/p0-staging-proof-unblock-era17-policy";
import { PILOT_GONOGO_SUMMARY_ARTIFACT_PATH } from "@/lib/commercial/market-leader-positioning-phases-era21";
import type { InvestorNarrativeOnepagerSummary } from "@/lib/commercial/investor-narrative-onepager-summary";
import type { PilotCaseStudyDraftSummary } from "@/lib/commercial/pilot-case-study-draft-summary";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { PilotMetricsBaselineSummary } from "@/lib/commercial/pilot-metrics-baseline-summary";
import type { PilotRollbackDrillSummary } from "@/lib/commercial/pilot-rollback-drill-summary";
import type { Tier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";

export const ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_INTEGRITY_ERA61_POLICY_ID =
  "era61-era25-band-a-market-proof-execution-sole-path-integrity-v1" as const;

export const ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_INTEGRITY_BASELINE_ARTIFACT =
  "artifacts/era25-band-a-market-proof-execution-sole-path-integrity-baseline.json" as const;

export type Era25BandAMarketProofExecutionSolePathIntegrityViolationId =
  | "era25_convergence_governance_terminus_freeze_integrity_fail"
  | "go_integrity_fail"
  | "sole_path_without_terminus_freeze"
  | "sole_path_claims_p0_complete_without_artifact"
  | "era25_frozen_env_mutation_after_sole_path"
  | "fake_sole_path_attestation"
  | "fake_sole_path_report_attestation"
  | "baseline_regression";

export type Era25BandAMarketProofExecutionSolePathIntegrityViolation = {
  id: Era25BandAMarketProofExecutionSolePathIntegrityViolationId;
  detail: string;
};

export type Era25BandAMarketProofExecutionSolePathIntegrityBaseline = {
  era25BandAMarketProofExecutionSolePathHonest: true;
  recordedAt: string;
  governanceTerminusFreezeHonestAttested: true;
  p0ProofStatusAtSolePath: P0StagingProofUnblockSummary["p0ProofStatus"];
  goDecision: "GO" | "NO-GO" | string;
  frozenEnvKeyCount: number;
  bandAExecutionSolePathLocked: true;
};

export type Era25BandAMarketProofExecutionSolePathIntegritySummary = {
  policyId: typeof ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_INTEGRITY_ERA61_POLICY_ID;
  integrityPassed: boolean;
  era25BandAMarketProofExecutionSolePathExecutionStarted: boolean;
  era25BandAMarketProofExecutionSolePathComplete: boolean;
  era25ConvergenceGovernanceTerminusFreezeComplete: boolean;
  era25ConvergenceGovernanceTerminusFreezeIntegrityPassed: boolean;
  bandAExecutionSolePathLocked: boolean;
  p0ProofStatus: string | null;
  p0ArtifactPresent: boolean;
  p0ProofReferencedInSolePath: boolean;
  goDecision: string | null;
  goIntegrityPassed: boolean;
  frozenEnvMutationDetected: boolean;
  baselinePresent: boolean;
  regressionDetected: boolean;
  violations: readonly Era25BandAMarketProofExecutionSolePathIntegrityViolation[];
  recommendedCommands: readonly string[];
};

const BLOCKING_VIOLATION_IDS: readonly Era25BandAMarketProofExecutionSolePathIntegrityViolationId[] =
  [
    "era25_convergence_governance_terminus_freeze_integrity_fail",
    "go_integrity_fail",
    "sole_path_without_terminus_freeze",
    "sole_path_claims_p0_complete_without_artifact",
    "era25_frozen_env_mutation_after_sole_path",
    "fake_sole_path_attestation",
    "fake_sole_path_report_attestation",
    "baseline_regression",
  ];

function readSolePathIntegrityBaseline(
  root: string,
): Era25BandAMarketProofExecutionSolePathIntegrityBaseline | null {
  try {
    const path = join(root, ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_INTEGRITY_BASELINE_ARTIFACT);
    if (!existsSync(path)) return null;
    return JSON.parse(
      readFileSync(path, "utf8"),
    ) as Era25BandAMarketProofExecutionSolePathIntegrityBaseline;
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

function pushUpstreamTerminusViolations(
  violations: Era25BandAMarketProofExecutionSolePathIntegrityViolation[],
  terminusIntegrity: ReturnType<typeof evaluateEra25ConvergenceGovernanceTerminusFreezeIntegrity>,
): void {
  if (!terminusIntegrity.goIntegrityPassed) {
    violations.push({
      id: "go_integrity_fail",
      detail:
        "GO artifact fails pilot-gono-go integrity — fix before era25 Band A market proof sole-path attest.",
    });
  }
  if (!terminusIntegrity.integrityPassed) {
    violations.push({
      id: "era25_convergence_governance_terminus_freeze_integrity_fail",
      detail:
        "Era25 convergence governance terminus freeze integrity FAIL — complete Phase AJ before Band A sole-path.",
    });
  }
}

export function evaluateEra25BandAMarketProofExecutionSolePathIntegrity(
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
    terminusFreezeIntegrityBaselineOverride?: Era25ConvergenceGovernanceTerminusFreezeIntegrityBaseline | null;
    terminusIntegrityOverride?: Era25ConvergenceGovernanceTerminusFreezeIntegritySummary | null;
    baselineOverride?: Era25BandAMarketProofExecutionSolePathIntegrityBaseline | null;
  },
): Era25BandAMarketProofExecutionSolePathIntegritySummary {
  const env = options?.env ?? process.env;
  const baseline =
    options?.baselineOverride !== undefined
      ? options.baselineOverride
      : readSolePathIntegrityBaseline(root);

  const terminusIntegrity =
    options?.terminusIntegrityOverride ??
    evaluateEra25ConvergenceGovernanceTerminusFreezeIntegrity(root, {
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
      baselineOverride: options?.terminusFreezeIntegrityBaselineOverride,
    });

  const diskP0 = resolveDiskP0(root, options?.p0StagingOverride);
  const effectiveP0Status =
    options?.p0ProofStatusOverride ??
    options?.p0StagingOverride?.p0ProofStatus ??
    diskP0?.p0ProofStatus ??
    null;
  const artifactP0Honest = diskP0?.p0ProofStatus === "proof_passed";
  const p0ProofReferenced = detectSolePathP0ProofReferenced(env);
  const goDecision = terminusIntegrity.goDecision;

  const era25BandAMarketProofExecutionSolePathExecutionStarted =
    detectEra25BandAMarketProofExecutionSolePathStarted(env);
  const solePathAttested = parseEnvBoolean(
    env.ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_ERA25_ATTESTED,
  );
  const reportReviewed = parseEnvBoolean(
    env.ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_ERA25_REPORT_REVIEWED,
  );
  const frozenEnvMutationDetected = detectEra25FrozenEnvMutationAfterSolePath(env);
  const terminusFreezeComplete = terminusIntegrity.era25ConvergenceGovernanceTerminusFreezeComplete;
  const solePathHonest =
    terminusFreezeComplete &&
    terminusIntegrity.integrityPassed &&
    !frozenEnvMutationDetected;
  const solePathPathActive =
    baseline?.era25BandAMarketProofExecutionSolePathHonest === true ||
    era25BandAMarketProofExecutionSolePathExecutionStarted;
  const bandAExecutionSolePathLocked =
    baseline?.bandAExecutionSolePathLocked === true ||
    (solePathHonest && solePathAttested);

  const claimsP0Complete = effectiveP0Status === "proof_passed" || p0ProofReferenced;

  const violations: Era25BandAMarketProofExecutionSolePathIntegrityViolation[] = [];

  if (era25BandAMarketProofExecutionSolePathExecutionStarted) {
    pushUpstreamTerminusViolations(violations, terminusIntegrity);
  }

  if (era25BandAMarketProofExecutionSolePathExecutionStarted && !terminusFreezeComplete) {
    violations.push({
      id: "sole_path_without_terminus_freeze",
      detail:
        "ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_* env present but governance terminus freeze is not honest — complete Phase AJ first.",
    });
  }

  if (solePathPathActive && frozenEnvMutationDetected) {
    violations.push({
      id: "era25_frozen_env_mutation_after_sole_path",
      detail:
        "Mutable era25 convergence governance env keys detected after sole-path is active — clear frozen keys; sustain only improvement loop + P0 ops vault execution.",
    });
  }

  if (solePathPathActive && claimsP0Complete && !artifactP0Honest) {
    violations.push({
      id: "sole_path_claims_p0_complete_without_artifact",
      detail: `Sole-path claims proof_passed but ${P0_STAGING_PROOF_UNBLOCK_ERA17_SUMMARY_ARTIFACT} is not honestly proof_passed (status=${diskP0?.p0ProofStatus ?? "missing"}) — execute ops vault + smoke:p0-staging-proof-unblock; sole-path attestation does not substitute for market proof.`,
    });
  }

  if (era25BandAMarketProofExecutionSolePathExecutionStarted && goDecision !== "GO") {
    violations.push({
      id: "go_integrity_fail",
      detail: `Sole-path started but GO decision=${goDecision ?? "missing"} — ${PILOT_GONOGO_SUMMARY_ARTIFACT_PATH} must remain honest GO.`,
    });
  }

  if (
    solePathAttested &&
    era25BandAMarketProofExecutionSolePathExecutionStarted &&
    !solePathHonest
  ) {
    violations.push({
      id: "fake_sole_path_attestation",
      detail:
        "ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_ERA25_ATTESTED=1 before honest terminus freeze + sole-path integrity PASS — never attest without ops:validate-era25-band-a-market-proof-execution-sole-path-integrity PASS.",
    });
  }

  if (
    reportReviewed &&
    era25BandAMarketProofExecutionSolePathExecutionStarted &&
    !solePathHonest
  ) {
    violations.push({
      id: "fake_sole_path_report_attestation",
      detail:
        "ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_ERA25_REPORT_REVIEWED=1 before sole-path integrity PASS — never attest report without ops:validate-era25-band-a-market-proof-execution-sole-path-integrity PASS.",
    });
  }

  if (
    baseline?.era25BandAMarketProofExecutionSolePathHonest &&
    (!terminusFreezeComplete ||
      !terminusIntegrity.goIntegrityPassed ||
      frozenEnvMutationDetected)
  ) {
    violations.push({
      id: "baseline_regression",
      detail: `Baseline recorded honest Band A sole-path at ${baseline.recordedAt} but terminus freeze / GO is no longer honest.`,
    });
  }

  const integrityPassed = !violations.some((row) => BLOCKING_VIOLATION_IDS.includes(row.id));
  const regressionDetected = violations.some((row) => row.id === "baseline_regression");

  return {
    policyId: ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_INTEGRITY_ERA61_POLICY_ID,
    integrityPassed,
    era25BandAMarketProofExecutionSolePathExecutionStarted,
    era25BandAMarketProofExecutionSolePathComplete:
      solePathHonest && terminusIntegrity.integrityPassed,
    era25ConvergenceGovernanceTerminusFreezeComplete: terminusFreezeComplete,
    era25ConvergenceGovernanceTerminusFreezeIntegrityPassed: terminusIntegrity.integrityPassed,
    bandAExecutionSolePathLocked,
    p0ProofStatus: effectiveP0Status,
    p0ArtifactPresent: diskP0 !== null,
    p0ProofReferencedInSolePath: p0ProofReferenced,
    goDecision,
    goIntegrityPassed: terminusIntegrity.goIntegrityPassed,
    frozenEnvMutationDetected,
    baselinePresent: baseline !== null,
    regressionDetected,
    violations,
    recommendedCommands: [
      "npm run ops:validate-era25-band-a-market-proof-execution-sole-path-integrity -- --json",
      "npm run ops:validate-era25-convergence-governance-terminus-freeze-integrity -- --json",
      "npm run ops:validate-p0-staging-proof-integrity -- --json",
      "npm run smoke:p0-staging-proof-unblock",
      "npm run test:ci:governance-bundles",
      "npm run test:ci:commercial-pilot-runbook:cert",
    ],
  };
}
