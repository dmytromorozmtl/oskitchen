/**
 * Era25 Band A governance chain capstone witness integrity.
 * Policy: era66-era25-band-a-governance-chain-capstone-witness-integrity-v1
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import { evaluateContinuousImprovementLoopIntegrity } from "@/lib/commercial/continuous-improvement-loop-integrity-era34";
import {
  detectEra25GovernanceReopenClaimedAfterCapstoneWitness,
  detectEra25BandAGovernanceChainCapstoneWitnessStarted,
} from "@/lib/commercial/era25-band-a-governance-chain-capstone-witness-phases-era66";
import {
  evaluateEra25PostTerminalSealCommercialOpsPermanenceIntegrity,
  type Era25PostTerminalSealCommercialOpsPermanenceIntegrityBaseline,
  type Era25PostTerminalSealCommercialOpsPermanenceIntegritySummary,
} from "@/lib/commercial/era25-post-terminal-seal-commercial-ops-permanence-integrity-era65";
import { PILOT_GONOGO_SUMMARY_ARTIFACT_PATH } from "@/lib/commercial/market-leader-positioning-phases-era21";
import type { InvestorNarrativeOnepagerSummary } from "@/lib/commercial/investor-narrative-onepager-summary";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { PilotCaseStudyDraftSummary } from "@/lib/commercial/pilot-case-study-draft-summary";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { PilotMetricsBaselineSummary } from "@/lib/commercial/pilot-metrics-baseline-summary";
import type { PilotRollbackDrillSummary } from "@/lib/commercial/pilot-rollback-drill-summary";
import type { Tier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";

export const ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_INTEGRITY_ERA66_POLICY_ID =
  "era66-era25-band-a-governance-chain-capstone-witness-integrity-v1" as const;

export const ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_INTEGRITY_BASELINE_ARTIFACT =
  "artifacts/era25-band-a-governance-chain-capstone-witness-integrity-baseline.json" as const;

export type Era25BandAGovernanceChainCapstoneWitnessIntegrityViolationId =
  | "era25_post_terminal_seal_commercial_ops_permanence_integrity_fail"
  | "go_integrity_fail"
  | "capstone_witness_without_permanence"
  | "capstone_witness_claims_governance_reopen"
  | "continuous_improvement_loop_integrity_fail"
  | "fake_capstone_witness_attestation"
  | "fake_capstone_witness_report_attestation"
  | "baseline_regression";

export type Era25BandAGovernanceChainCapstoneWitnessIntegrityViolation = {
  id: Era25BandAGovernanceChainCapstoneWitnessIntegrityViolationId;
  detail: string;
};

export type Era25BandAGovernanceChainCapstoneWitnessIntegrityBaseline = {
  era25BandAGovernanceChainCapstoneWitnessHonest: true;
  recordedAt: string;
  era25MarketProofGovernanceChainClosedAtCapstone: true;
  era25GovernanceTrainSealedAtCapstone: true;
  postTerminalSealCommercialOpsPermanenceActiveAtCapstone: true;
  p0ProofStatusAtCapstone: "proof_passed";
  goDecision: "GO" | "NO-GO" | string;
  frozenEnvKeyCount: number;
  bandAGovernanceChainCapstoneWitnessActive: true;
};

export type Era25BandAGovernanceChainCapstoneWitnessIntegritySummary = {
  policyId: typeof ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_INTEGRITY_ERA66_POLICY_ID;
  integrityPassed: boolean;
  era25BandAGovernanceChainCapstoneWitnessExecutionStarted: boolean;
  era25BandAGovernanceChainCapstoneWitnessComplete: boolean;
  era25PostTerminalSealCommercialOpsPermanenceComplete: boolean;
  era25PostTerminalSealCommercialOpsPermanenceIntegrityPassed: boolean;
  era25MarketProofGovernanceChainClosed: boolean;
  continuousImprovementLoopIntegrityPassed: boolean;
  governanceReopenClaimed: boolean;
  era25GovernanceTrainSealed: boolean;
  postTerminalSealCommercialOpsPermanenceActive: boolean;
  bandAGovernanceChainCapstoneWitnessActive: boolean;
  p0ProofStatus: string | null;
  p0ArtifactProofPassed: boolean;
  goDecision: string | null;
  goIntegrityPassed: boolean;
  frozenEnvMutationDetected: boolean;
  baselinePresent: boolean;
  regressionDetected: boolean;
  violations: readonly Era25BandAGovernanceChainCapstoneWitnessIntegrityViolation[];
  recommendedCommands: readonly string[];
};

const BLOCKING_VIOLATION_IDS: readonly Era25BandAGovernanceChainCapstoneWitnessIntegrityViolationId[] =
  [
    "era25_post_terminal_seal_commercial_ops_permanence_integrity_fail",
    "go_integrity_fail",
    "capstone_witness_without_permanence",
    "capstone_witness_claims_governance_reopen",
    "continuous_improvement_loop_integrity_fail",
    "fake_capstone_witness_attestation",
    "fake_capstone_witness_report_attestation",
    "baseline_regression",
  ];

function readCapstoneWitnessIntegrityBaseline(
  root: string,
): Era25BandAGovernanceChainCapstoneWitnessIntegrityBaseline | null {
  try {
    const path = join(
      root,
      ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_INTEGRITY_BASELINE_ARTIFACT,
    );
    if (!existsSync(path)) return null;
    return JSON.parse(
      readFileSync(path, "utf8"),
    ) as Era25BandAGovernanceChainCapstoneWitnessIntegrityBaseline;
  } catch {
    return null;
  }
}

function parseEnvBoolean(raw: string | undefined): boolean {
  if (raw === undefined) return false;
  const value = raw.trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes";
}

function pushUpstreamPermanenceViolations(
  violations: Era25BandAGovernanceChainCapstoneWitnessIntegrityViolation[],
  permanenceIntegrity: Era25PostTerminalSealCommercialOpsPermanenceIntegritySummary,
): void {
  if (!permanenceIntegrity.goIntegrityPassed) {
    violations.push({
      id: "go_integrity_fail",
      detail:
        "GO artifact fails pilot-gono-go integrity — fix before era25 Band A governance chain capstone witness attest.",
    });
  }
  if (!permanenceIntegrity.integrityPassed) {
    violations.push({
      id: "era25_post_terminal_seal_commercial_ops_permanence_integrity_fail",
      detail:
        "Era25 post-terminal-seal commercial ops permanence integrity FAIL — complete Phase AO before Band A capstone witness.",
    });
  }
}

export function evaluateEra25BandAGovernanceChainCapstoneWitnessIntegrity(
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
    permanenceIntegrityOverride?: Era25PostTerminalSealCommercialOpsPermanenceIntegritySummary | null;
    baselineOverride?: Era25BandAGovernanceChainCapstoneWitnessIntegrityBaseline | null;
  },
): Era25BandAGovernanceChainCapstoneWitnessIntegritySummary {
  const env = options?.env ?? process.env;
  const baseline =
    options?.baselineOverride !== undefined
      ? options.baselineOverride
      : readCapstoneWitnessIntegrityBaseline(root);

  const permanenceIntegrity =
    options?.permanenceIntegrityOverride ??
    evaluateEra25PostTerminalSealCommercialOpsPermanenceIntegrity(root, {
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
      baselineOverride: options?.permanenceIntegrityBaselineOverride,
    });

  const improvementLoopIntegrity = evaluateContinuousImprovementLoopIntegrity(root, { env });
  const governanceReopenClaimed = detectEra25GovernanceReopenClaimedAfterCapstoneWitness(env);
  const goDecision = permanenceIntegrity.goDecision;

  const era25BandAGovernanceChainCapstoneWitnessExecutionStarted =
    detectEra25BandAGovernanceChainCapstoneWitnessStarted(env);
  const witnessAttested = parseEnvBoolean(
    env.ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_ERA25_ATTESTED,
  );
  const reportReviewed = parseEnvBoolean(
    env.ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_ERA25_REPORT_REVIEWED,
  );
  const era25MarketProofGovernanceChainClosed = permanenceIntegrity.era25MarketProofGovernanceChainClosed;
  const era25GovernanceTrainSealed = permanenceIntegrity.era25GovernanceTrainSealed;
  const postTerminalSealCommercialOpsPermanenceActive =
    permanenceIntegrity.postTerminalSealCommercialOpsPermanenceActive;
  const witnessPrerequisitesHonest =
    era25MarketProofGovernanceChainClosed &&
    permanenceIntegrity.integrityPassed &&
    postTerminalSealCommercialOpsPermanenceActive &&
    era25GovernanceTrainSealed &&
    permanenceIntegrity.p0ArtifactProofPassed &&
    improvementLoopIntegrity.integrityPassed &&
    !governanceReopenClaimed;
  const witnessPathActive =
    baseline?.era25BandAGovernanceChainCapstoneWitnessHonest === true ||
    era25BandAGovernanceChainCapstoneWitnessExecutionStarted;
  const witnessHonestForAttest = witnessPrerequisitesHonest;
  const bandAGovernanceChainCapstoneWitnessActive =
    baseline?.bandAGovernanceChainCapstoneWitnessActive === true ||
    (witnessHonestForAttest && witnessAttested);

  const violations: Era25BandAGovernanceChainCapstoneWitnessIntegrityViolation[] = [];

  if (era25BandAGovernanceChainCapstoneWitnessExecutionStarted) {
    pushUpstreamPermanenceViolations(violations, permanenceIntegrity);
  }

  if (
    era25BandAGovernanceChainCapstoneWitnessExecutionStarted &&
    !postTerminalSealCommercialOpsPermanenceActive
  ) {
    violations.push({
      id: "capstone_witness_without_permanence",
      detail:
        "ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_* env present but commercial ops permanence is not active — complete Phase AO first.",
    });
  }

  if (witnessPathActive && governanceReopenClaimed) {
    violations.push({
      id: "capstone_witness_claims_governance_reopen",
      detail:
        "Mutable era25 convergence governance env keys detected after Band A capstone witness path — clear frozen attest keys; era61–AO governance chain must not reopen post-witness.",
    });
  }

  if (
    era25BandAGovernanceChainCapstoneWitnessExecutionStarted &&
    !improvementLoopIntegrity.integrityPassed
  ) {
    violations.push({
      id: "continuous_improvement_loop_integrity_fail",
      detail:
        "Continuous improvement loop integrity FAIL — sustain honest improvement loop rhythm before Band A governance chain capstone witness.",
    });
  }

  if (era25BandAGovernanceChainCapstoneWitnessExecutionStarted && goDecision !== "GO") {
    violations.push({
      id: "go_integrity_fail",
      detail: `Capstone witness started but GO decision=${goDecision ?? "missing"} — ${PILOT_GONOGO_SUMMARY_ARTIFACT_PATH} must remain honest GO.`,
    });
  }

  if (
    witnessAttested &&
    era25BandAGovernanceChainCapstoneWitnessExecutionStarted &&
    !witnessHonestForAttest
  ) {
    violations.push({
      id: "fake_capstone_witness_attestation",
      detail:
        "ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_ERA25_ATTESTED=1 before honest commercial ops permanence + improvement loop + capstone witness integrity PASS — never attest without ops:validate-era25-band-a-governance-chain-capstone-witness-integrity PASS.",
    });
  }

  if (
    reportReviewed &&
    era25BandAGovernanceChainCapstoneWitnessExecutionStarted &&
    !witnessHonestForAttest
  ) {
    violations.push({
      id: "fake_capstone_witness_report_attestation",
      detail:
        "ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_ERA25_REPORT_REVIEWED=1 before capstone witness integrity PASS — never attest report without ops:validate-era25-band-a-governance-chain-capstone-witness-integrity PASS.",
    });
  }

  if (
    baseline?.era25BandAGovernanceChainCapstoneWitnessHonest &&
    (!era25MarketProofGovernanceChainClosed ||
      !permanenceIntegrity.goIntegrityPassed ||
      !postTerminalSealCommercialOpsPermanenceActive ||
      !era25GovernanceTrainSealed ||
      governanceReopenClaimed)
  ) {
    violations.push({
      id: "baseline_regression",
      detail: `Baseline recorded honest Band A capstone witness at ${baseline.recordedAt} but permanence / train seal / GO is no longer honest.`,
    });
  }

  const integrityPassed = !violations.some((row) => BLOCKING_VIOLATION_IDS.includes(row.id));
  const regressionDetected = violations.some((row) => row.id === "baseline_regression");

  return {
    policyId: ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_INTEGRITY_ERA66_POLICY_ID,
    integrityPassed,
    era25BandAGovernanceChainCapstoneWitnessExecutionStarted,
    era25BandAGovernanceChainCapstoneWitnessComplete:
      witnessHonestForAttest && permanenceIntegrity.integrityPassed,
    era25PostTerminalSealCommercialOpsPermanenceComplete:
      permanenceIntegrity.era25PostTerminalSealCommercialOpsPermanenceComplete,
    era25PostTerminalSealCommercialOpsPermanenceIntegrityPassed: permanenceIntegrity.integrityPassed,
    era25MarketProofGovernanceChainClosed,
    continuousImprovementLoopIntegrityPassed: improvementLoopIntegrity.integrityPassed,
    governanceReopenClaimed,
    era25GovernanceTrainSealed,
    postTerminalSealCommercialOpsPermanenceActive,
    bandAGovernanceChainCapstoneWitnessActive,
    p0ProofStatus: permanenceIntegrity.p0ProofStatus,
    p0ArtifactProofPassed: permanenceIntegrity.p0ArtifactProofPassed,
    goDecision,
    goIntegrityPassed: permanenceIntegrity.goIntegrityPassed,
    frozenEnvMutationDetected: governanceReopenClaimed,
    baselinePresent: baseline !== null,
    regressionDetected,
    violations,
    recommendedCommands: [
      "npm run ops:validate-era25-band-a-governance-chain-capstone-witness-integrity -- --json",
      "npm run ops:validate-era25-post-terminal-seal-commercial-ops-permanence-integrity -- --json",
      "npm run ops:validate-continuous-improvement-loop-integrity -- --json",
      "npm run test:ci:governance-bundles",
      "npm run test:ci:commercial-pilot-runbook:cert",
    ],
  };
}
