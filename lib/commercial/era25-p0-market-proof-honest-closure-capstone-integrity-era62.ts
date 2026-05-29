/**
 * Era25 P0 market proof honest closure capstone integrity.
 * Policy: era62-era25-p0-market-proof-honest-closure-capstone-integrity-v1
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import {
  evaluateEra25BandAMarketProofExecutionSolePathIntegrity,
  type Era25BandAMarketProofExecutionSolePathIntegrityBaseline,
  type Era25BandAMarketProofExecutionSolePathIntegritySummary,
} from "@/lib/commercial/era25-band-a-market-proof-execution-sole-path-integrity-era61";
import {
  detectEra25FrozenEnvMutationAfterClosureCapstone,
  detectEra25P0MarketProofHonestClosureCapstoneStarted,
} from "@/lib/commercial/era25-p0-market-proof-honest-closure-capstone-phases-era62";
import { loadP0StagingProofArtifact } from "@/lib/commercial/p0-ops-vault-day0-orchestrator-era21";
import { P0_STAGING_PROOF_UNBLOCK_ERA17_SUMMARY_ARTIFACT } from "@/lib/commercial/p0-staging-proof-unblock-era17-policy";
import { PILOT_GONOGO_SUMMARY_ARTIFACT_PATH } from "@/lib/commercial/market-leader-positioning-phases-era21";
import type { InvestorNarrativeOnepagerSummary } from "@/lib/commercial/investor-narrative-onepager-summary";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { PilotCaseStudyDraftSummary } from "@/lib/commercial/pilot-case-study-draft-summary";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { PilotMetricsBaselineSummary } from "@/lib/commercial/pilot-metrics-baseline-summary";
import type { PilotRollbackDrillSummary } from "@/lib/commercial/pilot-rollback-drill-summary";
import type { Tier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";

export const ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_INTEGRITY_ERA62_POLICY_ID =
  "era62-era25-p0-market-proof-honest-closure-capstone-integrity-v1" as const;

export const ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_INTEGRITY_BASELINE_ARTIFACT =
  "artifacts/era25-p0-market-proof-honest-closure-capstone-integrity-baseline.json" as const;

export type Era25P0MarketProofHonestClosureCapstoneIntegrityViolationId =
  | "era25_band_a_market_proof_execution_sole_path_integrity_fail"
  | "go_integrity_fail"
  | "closure_without_sole_path"
  | "closure_claims_proof_passed_without_artifact"
  | "closure_attested_before_proof_passed_artifact"
  | "era25_frozen_env_mutation_after_closure_capstone"
  | "fake_closure_attestation"
  | "fake_closure_report_attestation"
  | "baseline_regression";

export type Era25P0MarketProofHonestClosureCapstoneIntegrityViolation = {
  id: Era25P0MarketProofHonestClosureCapstoneIntegrityViolationId;
  detail: string;
};

export type Era25P0MarketProofHonestClosureCapstoneIntegrityBaseline = {
  era25P0MarketProofHonestClosureCapstoneHonest: true;
  recordedAt: string;
  bandAExecutionSolePathLockedAtClosure: true;
  p0ProofStatusAtClosure: "proof_passed";
  goDecision: "GO" | "NO-GO" | string;
  frozenEnvKeyCount: number;
  era25MarketProofGovernanceChainClosed: true;
};

export type Era25P0MarketProofHonestClosureCapstoneIntegritySummary = {
  policyId: typeof ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_INTEGRITY_ERA62_POLICY_ID;
  integrityPassed: boolean;
  era25P0MarketProofHonestClosureCapstoneExecutionStarted: boolean;
  era25P0MarketProofHonestClosureCapstoneComplete: boolean;
  era25BandAMarketProofExecutionSolePathComplete: boolean;
  era25BandAMarketProofExecutionSolePathIntegrityPassed: boolean;
  bandAExecutionSolePathLocked: boolean;
  era25MarketProofGovernanceChainClosed: boolean;
  p0ProofStatus: string | null;
  p0ArtifactPresent: boolean;
  p0ArtifactProofPassed: boolean;
  goDecision: string | null;
  goIntegrityPassed: boolean;
  frozenEnvMutationDetected: boolean;
  baselinePresent: boolean;
  regressionDetected: boolean;
  violations: readonly Era25P0MarketProofHonestClosureCapstoneIntegrityViolation[];
  recommendedCommands: readonly string[];
};

const BLOCKING_VIOLATION_IDS: readonly Era25P0MarketProofHonestClosureCapstoneIntegrityViolationId[] =
  [
    "era25_band_a_market_proof_execution_sole_path_integrity_fail",
    "go_integrity_fail",
    "closure_without_sole_path",
    "closure_claims_proof_passed_without_artifact",
    "closure_attested_before_proof_passed_artifact",
    "era25_frozen_env_mutation_after_closure_capstone",
    "fake_closure_attestation",
    "fake_closure_report_attestation",
    "baseline_regression",
  ];

function readClosureCapstoneIntegrityBaseline(
  root: string,
): Era25P0MarketProofHonestClosureCapstoneIntegrityBaseline | null {
  try {
    const path = join(root, ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_INTEGRITY_BASELINE_ARTIFACT);
    if (!existsSync(path)) return null;
    return JSON.parse(
      readFileSync(path, "utf8"),
    ) as Era25P0MarketProofHonestClosureCapstoneIntegrityBaseline;
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
  return loadP0StagingProofArtifact(root);
}

function pushUpstreamSolePathViolations(
  violations: Era25P0MarketProofHonestClosureCapstoneIntegrityViolation[],
  solePathIntegrity: Era25BandAMarketProofExecutionSolePathIntegritySummary,
): void {
  if (!solePathIntegrity.goIntegrityPassed) {
    violations.push({
      id: "go_integrity_fail",
      detail:
        "GO artifact fails pilot-gono-go integrity — fix before era25 P0 market proof honest closure capstone attest.",
    });
  }
  if (!solePathIntegrity.integrityPassed) {
    violations.push({
      id: "era25_band_a_market_proof_execution_sole_path_integrity_fail",
      detail:
        "Era25 Band A market proof execution sole-path integrity FAIL — complete Phase AK before P0 closure capstone.",
    });
  }
}

export function evaluateEra25P0MarketProofHonestClosureCapstoneIntegrity(
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
    solePathIntegrityBaselineOverride?: Era25BandAMarketProofExecutionSolePathIntegrityBaseline | null;
    solePathIntegrityOverride?: Era25BandAMarketProofExecutionSolePathIntegritySummary | null;
    baselineOverride?: Era25P0MarketProofHonestClosureCapstoneIntegrityBaseline | null;
  },
): Era25P0MarketProofHonestClosureCapstoneIntegritySummary {
  const env = options?.env ?? process.env;
  const baseline =
    options?.baselineOverride !== undefined
      ? options.baselineOverride
      : readClosureCapstoneIntegrityBaseline(root);

  const solePathIntegrity =
    options?.solePathIntegrityOverride ??
    evaluateEra25BandAMarketProofExecutionSolePathIntegrity(root, {
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
      baselineOverride: options?.solePathIntegrityBaselineOverride,
    });

  const diskP0 = resolveDiskP0(root, options?.p0StagingOverride);
  const effectiveP0Status =
    options?.p0ProofStatusOverride ??
    options?.p0StagingOverride?.p0ProofStatus ??
    diskP0?.p0ProofStatus ??
    null;
  const artifactP0Honest = diskP0?.p0ProofStatus === "proof_passed";
  const goDecision = solePathIntegrity.goDecision;

  const era25P0MarketProofHonestClosureCapstoneExecutionStarted =
    detectEra25P0MarketProofHonestClosureCapstoneStarted(env);
  const closureAttested = parseEnvBoolean(
    env.ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_ERA25_ATTESTED,
  );
  const reportReviewed = parseEnvBoolean(
    env.ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_ERA25_REPORT_REVIEWED,
  );
  const frozenEnvMutationDetected = detectEra25FrozenEnvMutationAfterClosureCapstone(env);
  const bandAExecutionSolePathLocked = solePathIntegrity.bandAExecutionSolePathLocked;
  const closurePrerequisitesHonest =
    bandAExecutionSolePathLocked &&
    solePathIntegrity.integrityPassed &&
    !frozenEnvMutationDetected;
  const closurePathActive =
    baseline?.era25P0MarketProofHonestClosureCapstoneHonest === true ||
    era25P0MarketProofHonestClosureCapstoneExecutionStarted;
  const closureHonestForAttest =
    closurePrerequisitesHonest && artifactP0Honest;
  const era25MarketProofGovernanceChainClosed =
    baseline?.era25MarketProofGovernanceChainClosed === true ||
    (closureHonestForAttest && closureAttested);

  const claimsProofPassed = effectiveP0Status === "proof_passed";

  const violations: Era25P0MarketProofHonestClosureCapstoneIntegrityViolation[] = [];

  if (era25P0MarketProofHonestClosureCapstoneExecutionStarted) {
    pushUpstreamSolePathViolations(violations, solePathIntegrity);
  }

  if (era25P0MarketProofHonestClosureCapstoneExecutionStarted && !bandAExecutionSolePathLocked) {
    violations.push({
      id: "closure_without_sole_path",
      detail:
        "ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_* env present but Band A sole-path is not locked — complete Phase AK first.",
    });
  }

  if (closurePathActive && frozenEnvMutationDetected) {
    violations.push({
      id: "era25_frozen_env_mutation_after_closure_capstone",
      detail:
        "Mutable era25 governance env keys detected after closure capstone path is active — clear frozen keys; sustain improvement loop only.",
    });
  }

  if (closurePathActive && claimsProofPassed && !artifactP0Honest) {
    violations.push({
      id: "closure_claims_proof_passed_without_artifact",
      detail: `Closure capstone references proof_passed but ${P0_STAGING_PROOF_UNBLOCK_ERA17_SUMMARY_ARTIFACT} is not honestly proof_passed (status=${diskP0?.p0ProofStatus ?? "missing"}) — execute ops vault + smoke:p0-staging-proof-unblock first.`,
    });
  }

  if (
    (closureAttested || reportReviewed) &&
    era25P0MarketProofHonestClosureCapstoneExecutionStarted &&
    !artifactP0Honest
  ) {
    violations.push({
      id: "closure_attested_before_proof_passed_artifact",
      detail:
        "P0 market proof closure capstone attest env set before honest proof_passed on artifact — closure capstone is artifact-driven, not env-driven.",
    });
  }

  if (era25P0MarketProofHonestClosureCapstoneExecutionStarted && goDecision !== "GO") {
    violations.push({
      id: "go_integrity_fail",
      detail: `Closure capstone started but GO decision=${goDecision ?? "missing"} — ${PILOT_GONOGO_SUMMARY_ARTIFACT_PATH} must remain honest GO.`,
    });
  }

  if (
    closureAttested &&
    era25P0MarketProofHonestClosureCapstoneExecutionStarted &&
    !closureHonestForAttest
  ) {
    violations.push({
      id: "fake_closure_attestation",
      detail:
        "ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_ERA25_ATTESTED=1 before honest sole-path lock + proof_passed artifact + closure integrity PASS — never attest without ops:validate-era25-p0-market-proof-honest-closure-capstone-integrity PASS.",
    });
  }

  if (
    reportReviewed &&
    era25P0MarketProofHonestClosureCapstoneExecutionStarted &&
    !closureHonestForAttest
  ) {
    violations.push({
      id: "fake_closure_report_attestation",
      detail:
        "ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_ERA25_REPORT_REVIEWED=1 before closure integrity PASS — never attest report without ops:validate-era25-p0-market-proof-honest-closure-capstone-integrity PASS.",
    });
  }

  if (
    baseline?.era25P0MarketProofHonestClosureCapstoneHonest &&
    (!bandAExecutionSolePathLocked ||
      !solePathIntegrity.goIntegrityPassed ||
      frozenEnvMutationDetected ||
      !artifactP0Honest)
  ) {
    violations.push({
      id: "baseline_regression",
      detail: `Baseline recorded honest P0 closure capstone at ${baseline.recordedAt} but sole-path lock / GO / P0 artifact is no longer honest.`,
    });
  }

  const integrityPassed = !violations.some((row) => BLOCKING_VIOLATION_IDS.includes(row.id));
  const regressionDetected = violations.some((row) => row.id === "baseline_regression");

  return {
    policyId: ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_INTEGRITY_ERA62_POLICY_ID,
    integrityPassed,
    era25P0MarketProofHonestClosureCapstoneExecutionStarted,
    era25P0MarketProofHonestClosureCapstoneComplete:
      closureHonestForAttest && solePathIntegrity.integrityPassed,
    era25BandAMarketProofExecutionSolePathComplete:
      solePathIntegrity.era25BandAMarketProofExecutionSolePathComplete,
    era25BandAMarketProofExecutionSolePathIntegrityPassed: solePathIntegrity.integrityPassed,
    bandAExecutionSolePathLocked,
    era25MarketProofGovernanceChainClosed,
    p0ProofStatus: effectiveP0Status,
    p0ArtifactPresent: diskP0 !== null,
    p0ArtifactProofPassed: artifactP0Honest,
    goDecision,
    goIntegrityPassed: solePathIntegrity.goIntegrityPassed,
    frozenEnvMutationDetected,
    baselinePresent: baseline !== null,
    regressionDetected,
    violations,
    recommendedCommands: [
      "npm run ops:validate-era25-p0-market-proof-honest-closure-capstone-integrity -- --json",
      "npm run ops:validate-era25-band-a-market-proof-execution-sole-path-integrity -- --json",
      "npm run ops:validate-p0-staging-proof-integrity -- --json",
      "npm run smoke:p0-staging-proof-unblock",
      "npm run test:ci:governance-bundles",
      "npm run test:ci:commercial-pilot-runbook:cert",
    ],
  };
}
