/**
 * Era25 post-terminal-seal commercial ops permanence integrity.
 * Policy: era65-era25-post-terminal-seal-commercial-ops-permanence-integrity-v1
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import { evaluateContinuousImprovementLoopIntegrity } from "@/lib/commercial/continuous-improvement-loop-integrity-era34";
import {
  evaluateEra25GovernanceTrainTerminalSealIntegrity,
  type Era25GovernanceTrainTerminalSealIntegrityBaseline,
  type Era25GovernanceTrainTerminalSealIntegritySummary,
} from "@/lib/commercial/era25-governance-train-terminal-seal-integrity-era64";
import {
  detectEra25GovernanceReopenClaimedAfterPermanence,
  detectEra25PostTerminalSealCommercialOpsPermanenceStarted,
} from "@/lib/commercial/era25-post-terminal-seal-commercial-ops-permanence-phases-era65";
import { PILOT_GONOGO_SUMMARY_ARTIFACT_PATH } from "@/lib/commercial/market-leader-positioning-phases-era21";
import type { InvestorNarrativeOnepagerSummary } from "@/lib/commercial/investor-narrative-onepager-summary";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { PilotCaseStudyDraftSummary } from "@/lib/commercial/pilot-case-study-draft-summary";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { PilotMetricsBaselineSummary } from "@/lib/commercial/pilot-metrics-baseline-summary";
import type { PilotRollbackDrillSummary } from "@/lib/commercial/pilot-rollback-drill-summary";
import type { Tier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";

export const ERA25_POST_TERMINAL_SEAL_COMMERCIAL_OPS_PERMANENCE_INTEGRITY_ERA65_POLICY_ID =
  "era65-era25-post-terminal-seal-commercial-ops-permanence-integrity-v1" as const;

export const ERA25_POST_TERMINAL_SEAL_COMMERCIAL_OPS_PERMANENCE_INTEGRITY_BASELINE_ARTIFACT =
  "artifacts/era25-post-terminal-seal-commercial-ops-permanence-integrity-baseline.json" as const;

export type Era25PostTerminalSealCommercialOpsPermanenceIntegrityViolationId =
  | "era25_governance_train_terminal_seal_integrity_fail"
  | "go_integrity_fail"
  | "permanence_without_terminal_seal"
  | "permanence_claims_governance_reopen"
  | "continuous_improvement_loop_integrity_fail"
  | "fake_permanence_attestation"
  | "fake_permanence_report_attestation"
  | "baseline_regression";

export type Era25PostTerminalSealCommercialOpsPermanenceIntegrityViolation = {
  id: Era25PostTerminalSealCommercialOpsPermanenceIntegrityViolationId;
  detail: string;
};

export type Era25PostTerminalSealCommercialOpsPermanenceIntegrityBaseline = {
  era25PostTerminalSealCommercialOpsPermanenceHonest: true;
  recordedAt: string;
  era25MarketProofGovernanceChainClosedAtPermanence: true;
  era25GovernanceTrainSealedAtPermanence: true;
  postMarketProofSteadyOpsWitnessActiveAtPermanence: true;
  p0ProofStatusAtPermanence: "proof_passed";
  goDecision: "GO" | "NO-GO" | string;
  frozenEnvKeyCount: number;
  postTerminalSealCommercialOpsPermanenceActive: true;
};

export type Era25PostTerminalSealCommercialOpsPermanenceIntegritySummary = {
  policyId: typeof ERA25_POST_TERMINAL_SEAL_COMMERCIAL_OPS_PERMANENCE_INTEGRITY_ERA65_POLICY_ID;
  integrityPassed: boolean;
  era25PostTerminalSealCommercialOpsPermanenceExecutionStarted: boolean;
  era25PostTerminalSealCommercialOpsPermanenceComplete: boolean;
  era25GovernanceTrainTerminalSealComplete: boolean;
  era25GovernanceTrainTerminalSealIntegrityPassed: boolean;
  era25MarketProofGovernanceChainClosed: boolean;
  continuousImprovementLoopIntegrityPassed: boolean;
  governanceReopenClaimed: boolean;
  era25GovernanceTrainSealed: boolean;
  postMarketProofSteadyOpsWitnessActive: boolean;
  postTerminalSealCommercialOpsPermanenceActive: boolean;
  p0ProofStatus: string | null;
  p0ArtifactProofPassed: boolean;
  goDecision: string | null;
  goIntegrityPassed: boolean;
  frozenEnvMutationDetected: boolean;
  baselinePresent: boolean;
  regressionDetected: boolean;
  violations: readonly Era25PostTerminalSealCommercialOpsPermanenceIntegrityViolation[];
  recommendedCommands: readonly string[];
};

const BLOCKING_VIOLATION_IDS: readonly Era25PostTerminalSealCommercialOpsPermanenceIntegrityViolationId[] =
  [
    "era25_governance_train_terminal_seal_integrity_fail",
    "go_integrity_fail",
    "permanence_without_terminal_seal",
    "permanence_claims_governance_reopen",
    "continuous_improvement_loop_integrity_fail",
    "fake_permanence_attestation",
    "fake_permanence_report_attestation",
    "baseline_regression",
  ];

function readPermanenceIntegrityBaseline(
  root: string,
): Era25PostTerminalSealCommercialOpsPermanenceIntegrityBaseline | null {
  try {
    const path = join(
      root,
      ERA25_POST_TERMINAL_SEAL_COMMERCIAL_OPS_PERMANENCE_INTEGRITY_BASELINE_ARTIFACT,
    );
    if (!existsSync(path)) return null;
    return JSON.parse(
      readFileSync(path, "utf8"),
    ) as Era25PostTerminalSealCommercialOpsPermanenceIntegrityBaseline;
  } catch {
    return null;
  }
}

function parseEnvBoolean(raw: string | undefined): boolean {
  if (raw === undefined) return false;
  const value = raw.trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes";
}

function pushUpstreamSealViolations(
  violations: Era25PostTerminalSealCommercialOpsPermanenceIntegrityViolation[],
  sealIntegrity: Era25GovernanceTrainTerminalSealIntegritySummary,
): void {
  if (!sealIntegrity.goIntegrityPassed) {
    violations.push({
      id: "go_integrity_fail",
      detail:
        "GO artifact fails pilot-gono-go integrity — fix before era25 post-terminal-seal commercial ops permanence attest.",
    });
  }
  if (!sealIntegrity.integrityPassed) {
    violations.push({
      id: "era25_governance_train_terminal_seal_integrity_fail",
      detail:
        "Era25 governance train terminal seal integrity FAIL — complete Phase AN before commercial ops permanence.",
    });
  }
}

export function evaluateEra25PostTerminalSealCommercialOpsPermanenceIntegrity(
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
    sealIntegrityBaselineOverride?: Era25GovernanceTrainTerminalSealIntegrityBaseline | null;
    sealIntegrityOverride?: Era25GovernanceTrainTerminalSealIntegritySummary | null;
    baselineOverride?: Era25PostTerminalSealCommercialOpsPermanenceIntegrityBaseline | null;
  },
): Era25PostTerminalSealCommercialOpsPermanenceIntegritySummary {
  const env = options?.env ?? process.env;
  const baseline =
    options?.baselineOverride !== undefined
      ? options.baselineOverride
      : readPermanenceIntegrityBaseline(root);

  const sealIntegrity =
    options?.sealIntegrityOverride ??
    evaluateEra25GovernanceTrainTerminalSealIntegrity(root, {
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
      baselineOverride: options?.sealIntegrityBaselineOverride,
    });

  const improvementLoopIntegrity = evaluateContinuousImprovementLoopIntegrity(root, { env });
  const governanceReopenClaimed = detectEra25GovernanceReopenClaimedAfterPermanence(env);
  const goDecision = sealIntegrity.goDecision;

  const era25PostTerminalSealCommercialOpsPermanenceExecutionStarted =
    detectEra25PostTerminalSealCommercialOpsPermanenceStarted(env);
  const permanenceAttested = parseEnvBoolean(
    env.ERA25_POST_TERMINAL_SEAL_COMMERCIAL_OPS_PERMANENCE_ERA25_ATTESTED,
  );
  const reportReviewed = parseEnvBoolean(
    env.ERA25_POST_TERMINAL_SEAL_COMMERCIAL_OPS_PERMANENCE_ERA25_REPORT_REVIEWED,
  );
  const era25MarketProofGovernanceChainClosed = sealIntegrity.era25MarketProofGovernanceChainClosed;
  const era25GovernanceTrainSealed = sealIntegrity.era25GovernanceTrainSealed;
  const postMarketProofSteadyOpsWitnessActive = sealIntegrity.postMarketProofSteadyOpsWitnessActive;
  const permanencePrerequisitesHonest =
    era25MarketProofGovernanceChainClosed &&
    sealIntegrity.integrityPassed &&
    era25GovernanceTrainSealed &&
    postMarketProofSteadyOpsWitnessActive &&
    sealIntegrity.p0ArtifactProofPassed &&
    improvementLoopIntegrity.integrityPassed &&
    !governanceReopenClaimed;
  const permanencePathActive =
    baseline?.era25PostTerminalSealCommercialOpsPermanenceHonest === true ||
    era25PostTerminalSealCommercialOpsPermanenceExecutionStarted;
  const permanenceHonestForAttest = permanencePrerequisitesHonest;
  const postTerminalSealCommercialOpsPermanenceActive =
    baseline?.postTerminalSealCommercialOpsPermanenceActive === true ||
    (permanenceHonestForAttest && permanenceAttested);

  const violations: Era25PostTerminalSealCommercialOpsPermanenceIntegrityViolation[] = [];

  if (era25PostTerminalSealCommercialOpsPermanenceExecutionStarted) {
    pushUpstreamSealViolations(violations, sealIntegrity);
  }

  if (
    era25PostTerminalSealCommercialOpsPermanenceExecutionStarted &&
    !era25GovernanceTrainSealed
  ) {
    violations.push({
      id: "permanence_without_terminal_seal",
      detail:
        "ERA25_POST_TERMINAL_SEAL_COMMERCIAL_OPS_PERMANENCE_* env present but governance train terminal seal is not active — complete Phase AN first.",
    });
  }

  if (permanencePathActive && governanceReopenClaimed) {
    violations.push({
      id: "permanence_claims_governance_reopen",
      detail:
        "Mutable era25 convergence governance env keys detected after commercial ops permanence path — clear frozen attest keys; era25 governance must not reopen post-permanence.",
    });
  }

  if (
    era25PostTerminalSealCommercialOpsPermanenceExecutionStarted &&
    !improvementLoopIntegrity.integrityPassed
  ) {
    violations.push({
      id: "continuous_improvement_loop_integrity_fail",
      detail:
        "Continuous improvement loop integrity FAIL — sustain honest improvement loop rhythm before post-terminal-seal commercial ops permanence.",
    });
  }

  if (era25PostTerminalSealCommercialOpsPermanenceExecutionStarted && goDecision !== "GO") {
    violations.push({
      id: "go_integrity_fail",
      detail: `Permanence started but GO decision=${goDecision ?? "missing"} — ${PILOT_GONOGO_SUMMARY_ARTIFACT_PATH} must remain honest GO.`,
    });
  }

  if (
    permanenceAttested &&
    era25PostTerminalSealCommercialOpsPermanenceExecutionStarted &&
    !permanenceHonestForAttest
  ) {
    violations.push({
      id: "fake_permanence_attestation",
      detail:
        "ERA25_POST_TERMINAL_SEAL_COMMERCIAL_OPS_PERMANENCE_ERA25_ATTESTED=1 before honest terminal seal + improvement loop + permanence integrity PASS — never attest without ops:validate-era25-post-terminal-seal-commercial-ops-permanence-integrity PASS.",
    });
  }

  if (
    reportReviewed &&
    era25PostTerminalSealCommercialOpsPermanenceExecutionStarted &&
    !permanenceHonestForAttest
  ) {
    violations.push({
      id: "fake_permanence_report_attestation",
      detail:
        "ERA25_POST_TERMINAL_SEAL_COMMERCIAL_OPS_PERMANENCE_ERA25_REPORT_REVIEWED=1 before permanence integrity PASS — never attest report without ops:validate-era25-post-terminal-seal-commercial-ops-permanence-integrity PASS.",
    });
  }

  if (
    baseline?.era25PostTerminalSealCommercialOpsPermanenceHonest &&
    (!era25MarketProofGovernanceChainClosed ||
      !sealIntegrity.goIntegrityPassed ||
      !era25GovernanceTrainSealed ||
      !postMarketProofSteadyOpsWitnessActive ||
      governanceReopenClaimed)
  ) {
    violations.push({
      id: "baseline_regression",
      detail: `Baseline recorded honest commercial ops permanence at ${baseline.recordedAt} but terminal seal / steady witness / GO is no longer honest.`,
    });
  }

  const integrityPassed = !violations.some((row) => BLOCKING_VIOLATION_IDS.includes(row.id));
  const regressionDetected = violations.some((row) => row.id === "baseline_regression");

  return {
    policyId: ERA25_POST_TERMINAL_SEAL_COMMERCIAL_OPS_PERMANENCE_INTEGRITY_ERA65_POLICY_ID,
    integrityPassed,
    era25PostTerminalSealCommercialOpsPermanenceExecutionStarted,
    era25PostTerminalSealCommercialOpsPermanenceComplete:
      permanenceHonestForAttest && sealIntegrity.integrityPassed,
    era25GovernanceTrainTerminalSealComplete: sealIntegrity.era25GovernanceTrainTerminalSealComplete,
    era25GovernanceTrainTerminalSealIntegrityPassed: sealIntegrity.integrityPassed,
    era25MarketProofGovernanceChainClosed,
    continuousImprovementLoopIntegrityPassed: improvementLoopIntegrity.integrityPassed,
    governanceReopenClaimed,
    era25GovernanceTrainSealed,
    postMarketProofSteadyOpsWitnessActive,
    postTerminalSealCommercialOpsPermanenceActive,
    p0ProofStatus: sealIntegrity.p0ProofStatus,
    p0ArtifactProofPassed: sealIntegrity.p0ArtifactProofPassed,
    goDecision,
    goIntegrityPassed: sealIntegrity.goIntegrityPassed,
    frozenEnvMutationDetected: governanceReopenClaimed,
    baselinePresent: baseline !== null,
    regressionDetected,
    violations,
    recommendedCommands: [
      "npm run ops:validate-era25-post-terminal-seal-commercial-ops-permanence-integrity -- --json",
      "npm run ops:validate-era25-governance-train-terminal-seal-integrity -- --json",
      "npm run ops:validate-continuous-improvement-loop-integrity -- --json",
      "npm run test:ci:governance-bundles",
      "npm run test:ci:commercial-pilot-runbook:cert",
    ],
  };
}
