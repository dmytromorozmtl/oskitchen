/**
 * Era25 governance train terminal seal integrity.
 * Policy: era64-era25-governance-train-terminal-seal-integrity-v1
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import { evaluateContinuousImprovementLoopIntegrity } from "@/lib/commercial/continuous-improvement-loop-integrity-era34";
import {
  detectEra25GovernanceReopenClaimedAfterTerminalSeal,
  detectEra25GovernanceTrainTerminalSealStarted,
} from "@/lib/commercial/era25-governance-train-terminal-seal-phases-era64";
import {
  evaluateEra25PostMarketProofSteadyOperationalWitnessIntegrity,
  type Era25PostMarketProofSteadyOperationalWitnessIntegrityBaseline,
  type Era25PostMarketProofSteadyOperationalWitnessIntegritySummary,
} from "@/lib/commercial/era25-post-market-proof-steady-operational-witness-integrity-era63";
import { PILOT_GONOGO_SUMMARY_ARTIFACT_PATH } from "@/lib/commercial/market-leader-positioning-phases-era21";
import type { InvestorNarrativeOnepagerSummary } from "@/lib/commercial/investor-narrative-onepager-summary";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { PilotCaseStudyDraftSummary } from "@/lib/commercial/pilot-case-study-draft-summary";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { PilotMetricsBaselineSummary } from "@/lib/commercial/pilot-metrics-baseline-summary";
import type { PilotRollbackDrillSummary } from "@/lib/commercial/pilot-rollback-drill-summary";
import type { Tier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";

export const ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_INTEGRITY_ERA64_POLICY_ID =
  "era64-era25-governance-train-terminal-seal-integrity-v1" as const;

export const ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_INTEGRITY_BASELINE_ARTIFACT =
  "artifacts/era25-governance-train-terminal-seal-integrity-baseline.json" as const;

export type Era25GovernanceTrainTerminalSealIntegrityViolationId =
  | "era25_post_market_proof_steady_operational_witness_integrity_fail"
  | "go_integrity_fail"
  | "seal_without_steady_witness"
  | "seal_claims_governance_reopen"
  | "continuous_improvement_loop_integrity_fail"
  | "fake_seal_attestation"
  | "fake_seal_report_attestation"
  | "baseline_regression";

export type Era25GovernanceTrainTerminalSealIntegrityViolation = {
  id: Era25GovernanceTrainTerminalSealIntegrityViolationId;
  detail: string;
};

export type Era25GovernanceTrainTerminalSealIntegrityBaseline = {
  era25GovernanceTrainTerminalSealHonest: true;
  recordedAt: string;
  era25MarketProofGovernanceChainClosedAtSeal: true;
  postMarketProofSteadyOpsWitnessActiveAtSeal: true;
  p0ProofStatusAtSeal: "proof_passed";
  goDecision: "GO" | "NO-GO" | string;
  frozenEnvKeyCount: number;
  era25GovernanceTrainSealed: true;
};

export type Era25GovernanceTrainTerminalSealIntegritySummary = {
  policyId: typeof ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_INTEGRITY_ERA64_POLICY_ID;
  integrityPassed: boolean;
  era25GovernanceTrainTerminalSealExecutionStarted: boolean;
  era25GovernanceTrainTerminalSealComplete: boolean;
  era25PostMarketProofSteadyOperationalWitnessComplete: boolean;
  era25PostMarketProofSteadyOperationalWitnessIntegrityPassed: boolean;
  era25MarketProofGovernanceChainClosed: boolean;
  continuousImprovementLoopIntegrityPassed: boolean;
  governanceReopenClaimed: boolean;
  postMarketProofSteadyOpsWitnessActive: boolean;
  era25GovernanceTrainSealed: boolean;
  p0ProofStatus: string | null;
  p0ArtifactProofPassed: boolean;
  goDecision: string | null;
  goIntegrityPassed: boolean;
  frozenEnvMutationDetected: boolean;
  baselinePresent: boolean;
  regressionDetected: boolean;
  violations: readonly Era25GovernanceTrainTerminalSealIntegrityViolation[];
  recommendedCommands: readonly string[];
};

const BLOCKING_VIOLATION_IDS: readonly Era25GovernanceTrainTerminalSealIntegrityViolationId[] = [
  "era25_post_market_proof_steady_operational_witness_integrity_fail",
  "go_integrity_fail",
  "seal_without_steady_witness",
  "seal_claims_governance_reopen",
  "continuous_improvement_loop_integrity_fail",
  "fake_seal_attestation",
  "fake_seal_report_attestation",
  "baseline_regression",
];

function readSealIntegrityBaseline(
  root: string,
): Era25GovernanceTrainTerminalSealIntegrityBaseline | null {
  try {
    const path = join(root, ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_INTEGRITY_BASELINE_ARTIFACT);
    if (!existsSync(path)) return null;
    return JSON.parse(
      readFileSync(path, "utf8"),
    ) as Era25GovernanceTrainTerminalSealIntegrityBaseline;
  } catch {
    return null;
  }
}

function parseEnvBoolean(raw: string | undefined): boolean {
  if (raw === undefined) return false;
  const value = raw.trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes";
}

function pushUpstreamWitnessViolations(
  violations: Era25GovernanceTrainTerminalSealIntegrityViolation[],
  witnessIntegrity: Era25PostMarketProofSteadyOperationalWitnessIntegritySummary,
): void {
  if (!witnessIntegrity.goIntegrityPassed) {
    violations.push({
      id: "go_integrity_fail",
      detail:
        "GO artifact fails pilot-gono-go integrity — fix before era25 governance train terminal seal attest.",
    });
  }
  if (!witnessIntegrity.integrityPassed) {
    violations.push({
      id: "era25_post_market_proof_steady_operational_witness_integrity_fail",
      detail:
        "Era25 post-market-proof steady operational witness integrity FAIL — complete Phase AM before governance train terminal seal.",
    });
  }
}

export function evaluateEra25GovernanceTrainTerminalSealIntegrity(
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
    witnessIntegrityBaselineOverride?: Era25PostMarketProofSteadyOperationalWitnessIntegrityBaseline | null;
    witnessIntegrityOverride?: Era25PostMarketProofSteadyOperationalWitnessIntegritySummary | null;
    baselineOverride?: Era25GovernanceTrainTerminalSealIntegrityBaseline | null;
  },
): Era25GovernanceTrainTerminalSealIntegritySummary {
  const env = options?.env ?? process.env;
  const baseline =
    options?.baselineOverride !== undefined
      ? options.baselineOverride
      : readSealIntegrityBaseline(root);

  const witnessIntegrity =
    options?.witnessIntegrityOverride ??
    evaluateEra25PostMarketProofSteadyOperationalWitnessIntegrity(root, {
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
      baselineOverride: options?.witnessIntegrityBaselineOverride,
    });

  const improvementLoopIntegrity = evaluateContinuousImprovementLoopIntegrity(root, { env });
  const governanceReopenClaimed = detectEra25GovernanceReopenClaimedAfterTerminalSeal(env);
  const goDecision = witnessIntegrity.goDecision;

  const era25GovernanceTrainTerminalSealExecutionStarted =
    detectEra25GovernanceTrainTerminalSealStarted(env);
  const sealAttested = parseEnvBoolean(env.ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_ERA25_ATTESTED);
  const reportReviewed = parseEnvBoolean(
    env.ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_ERA25_REPORT_REVIEWED,
  );
  const era25MarketProofGovernanceChainClosed = witnessIntegrity.era25MarketProofGovernanceChainClosed;
  const postMarketProofSteadyOpsWitnessActive = witnessIntegrity.postMarketProofSteadyOpsWitnessActive;
  const sealPrerequisitesHonest =
    era25MarketProofGovernanceChainClosed &&
    witnessIntegrity.integrityPassed &&
    postMarketProofSteadyOpsWitnessActive &&
    witnessIntegrity.p0ArtifactProofPassed &&
    improvementLoopIntegrity.integrityPassed &&
    !governanceReopenClaimed;
  const sealPathActive =
    baseline?.era25GovernanceTrainTerminalSealHonest === true ||
    era25GovernanceTrainTerminalSealExecutionStarted;
  const sealHonestForAttest = sealPrerequisitesHonest;
  const era25GovernanceTrainSealed =
    baseline?.era25GovernanceTrainSealed === true || (sealHonestForAttest && sealAttested);

  const violations: Era25GovernanceTrainTerminalSealIntegrityViolation[] = [];

  if (era25GovernanceTrainTerminalSealExecutionStarted) {
    pushUpstreamWitnessViolations(violations, witnessIntegrity);
  }

  if (
    era25GovernanceTrainTerminalSealExecutionStarted &&
    !postMarketProofSteadyOpsWitnessActive
  ) {
    violations.push({
      id: "seal_without_steady_witness",
      detail:
        "ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_* env present but post-market steady ops witness is not active — complete Phase AM first.",
    });
  }

  if (sealPathActive && governanceReopenClaimed) {
    violations.push({
      id: "seal_claims_governance_reopen",
      detail:
        "Mutable era25 convergence governance env keys detected after terminal seal path — clear frozen attest keys; era25 governance train (era47–AM) must not reopen post-seal.",
    });
  }

  if (era25GovernanceTrainTerminalSealExecutionStarted && !improvementLoopIntegrity.integrityPassed) {
    violations.push({
      id: "continuous_improvement_loop_integrity_fail",
      detail:
        "Continuous improvement loop integrity FAIL — sustain honest improvement loop rhythm before governance train terminal seal.",
    });
  }

  if (era25GovernanceTrainTerminalSealExecutionStarted && goDecision !== "GO") {
    violations.push({
      id: "go_integrity_fail",
      detail: `Seal started but GO decision=${goDecision ?? "missing"} — ${PILOT_GONOGO_SUMMARY_ARTIFACT_PATH} must remain honest GO.`,
    });
  }

  if (sealAttested && era25GovernanceTrainTerminalSealExecutionStarted && !sealHonestForAttest) {
    violations.push({
      id: "fake_seal_attestation",
      detail:
        "ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_ERA25_ATTESTED=1 before honest steady witness + improvement loop + seal integrity PASS — never attest without ops:validate-era25-governance-train-terminal-seal-integrity PASS.",
    });
  }

  if (
    reportReviewed &&
    era25GovernanceTrainTerminalSealExecutionStarted &&
    !sealHonestForAttest
  ) {
    violations.push({
      id: "fake_seal_report_attestation",
      detail:
        "ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_ERA25_REPORT_REVIEWED=1 before seal integrity PASS — never attest report without ops:validate-era25-governance-train-terminal-seal-integrity PASS.",
    });
  }

  if (
    baseline?.era25GovernanceTrainTerminalSealHonest &&
    (!era25MarketProofGovernanceChainClosed ||
      !witnessIntegrity.goIntegrityPassed ||
      !postMarketProofSteadyOpsWitnessActive ||
      governanceReopenClaimed)
  ) {
    violations.push({
      id: "baseline_regression",
      detail: `Baseline recorded honest governance train terminal seal at ${baseline.recordedAt} but steady witness / GO / governance chain is no longer honest.`,
    });
  }

  const integrityPassed = !violations.some((row) => BLOCKING_VIOLATION_IDS.includes(row.id));
  const regressionDetected = violations.some((row) => row.id === "baseline_regression");

  return {
    policyId: ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_INTEGRITY_ERA64_POLICY_ID,
    integrityPassed,
    era25GovernanceTrainTerminalSealExecutionStarted,
    era25GovernanceTrainTerminalSealComplete:
      sealHonestForAttest && witnessIntegrity.integrityPassed,
    era25PostMarketProofSteadyOperationalWitnessComplete:
      witnessIntegrity.era25PostMarketProofSteadyOperationalWitnessComplete,
    era25PostMarketProofSteadyOperationalWitnessIntegrityPassed: witnessIntegrity.integrityPassed,
    era25MarketProofGovernanceChainClosed,
    continuousImprovementLoopIntegrityPassed: improvementLoopIntegrity.integrityPassed,
    governanceReopenClaimed,
    postMarketProofSteadyOpsWitnessActive,
    era25GovernanceTrainSealed,
    p0ProofStatus: witnessIntegrity.p0ProofStatus,
    p0ArtifactProofPassed: witnessIntegrity.p0ArtifactProofPassed,
    goDecision,
    goIntegrityPassed: witnessIntegrity.goIntegrityPassed,
    frozenEnvMutationDetected: governanceReopenClaimed,
    baselinePresent: baseline !== null,
    regressionDetected,
    violations,
    recommendedCommands: [
      "npm run ops:validate-era25-governance-train-terminal-seal-integrity -- --json",
      "npm run ops:validate-era25-post-market-proof-steady-operational-witness-integrity -- --json",
      "npm run ops:validate-continuous-improvement-loop-integrity -- --json",
      "npm run test:ci:governance-bundles",
      "npm run test:ci:commercial-pilot-runbook:cert",
    ],
  };
}
