/**
 * Era25 commercial pilot convergence train capstone UI slice.
 */
import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import { evaluateEra25CommercialPilotConvergenceTrainCapstoneIntegrity } from "@/lib/commercial/era25-commercial-pilot-convergence-train-capstone-integrity-era59";
import {
  ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_DOC,
  ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_FOREVER_COMMANDS,
  ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_GUARDRAILS,
  ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_BACKLOG_ID,
  ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_PLATFORM_ANCHOR,
  detectEra25CommercialPilotConvergenceTrainCapstoneStarted,
} from "@/lib/commercial/era25-commercial-pilot-convergence-train-capstone-phases-era59";
import type { InvestorNarrativeOnepagerSummary } from "@/lib/commercial/investor-narrative-onepager-summary";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { PilotCaseStudyDraftSummary } from "@/lib/commercial/pilot-case-study-draft-summary";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { PilotMetricsBaselineSummary } from "@/lib/commercial/pilot-metrics-baseline-summary";
import type { PilotRollbackDrillSummary } from "@/lib/commercial/pilot-rollback-drill-summary";
import type { Tier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";
import { SERIES_A_PLATFORM_OPS_ROUTE } from "@/lib/commercial/sustained-operational-excellence-phases-era21";
import { LAUNCH_WIZARD_ROUTE } from "@/lib/launch-wizard/launch-wizard-era19-policy";
import {
  buildEra25ConvergenceGovernanceTerminusFreezeEra25UiSlice,
  type Era25ConvergenceGovernanceTerminusFreezeEra25UiSlice,
} from "@/lib/commercial/era25-convergence-governance-terminus-freeze-ui-era25";
import { LAUNCH_WIZARD_ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_ANCHOR } from "@/lib/launch-wizard/launch-wizard-era25-commercial-pilot-convergence-train-capstone-era59";

export const ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_ERA25_UI_POLICY_ID =
  "era25-commercial-pilot-convergence-train-capstone-ui-v1" as const;

export type Era25CommercialPilotConvergenceTrainCapstoneEra25UiSlice = {
  policyId: typeof ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_ERA25_UI_POLICY_ID;
  visible: boolean;
  steadyStateLockComplete: boolean;
  trainCapstoneBlocked: boolean;
  trainCapstoneComplete: boolean;
  p0ProofStatus: string | null;
  p0ArtifactPresent: boolean;
  p0ProofReferencedInCapstone: boolean;
  frozenEnvMutationDetected: boolean;
  goDecision: string | null;
  convergenceDoc: typeof ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_DOC;
  backlogId: typeof ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_BACKLOG_ID;
  guardrails: typeof ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_GUARDRAILS;
  foreverCommands: typeof ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_FOREVER_COMMANDS;
  integrityValidateCommand: string;
  syncIntegrityBaselineCommand: string;
  validateSteadyStateLockIntegrityCommand: string;
  validateP0StagingProofIntegrityCommand: string;
  p0StagingProofSmokeCommand: string;
  governanceBundlesCertCommand: string;
  commercialPilotRunbookCertCommand: string;
  era25CommercialPilotConvergenceTrainCapstoneIntegrityPassed: boolean;
  era25SteadyStateOperatorLoopLockIntegrityPassed: boolean;
  launchWizardHref: string;
  platformOpsHref: string;
  p0OpsVaultHref: string;
  todayHref: string;
  headline: string;
  era25ConvergenceGovernanceTerminusFreeze: Era25ConvergenceGovernanceTerminusFreezeEra25UiSlice | null;
};

export function buildEra25CommercialPilotConvergenceTrainCapstoneEra25UiSlice(input: {
  era25SteadyStateOperatorLoopLockVisible: boolean;
  steadyStateLockComplete: boolean;
  env?: NodeJS.ProcessEnv;
  goNoGoSummary?: PilotGoNoGoSummary | null;
  p0Staging?: P0StagingProofUnblockSummary | null;
  tier2Summary?: Tier2StagingGoldenPathSummary | null;
  metricsBaseline?: PilotMetricsBaselineSummary | null;
  caseStudyDraft?: PilotCaseStudyDraftSummary | null;
  investorOnepager?: InvestorNarrativeOnepagerSummary | null;
  rollbackDrill?: PilotRollbackDrillSummary | null;
  competitorMatrix?: CompetitorFeatureGapMatrixSummary | null;
  p0ProofStatus?: string | null;
  tier2ProofStatus?: string | null;
}): Era25CommercialPilotConvergenceTrainCapstoneEra25UiSlice | null {
  const env = input.env ?? process.env;
  const capstoneStarted = detectEra25CommercialPilotConvergenceTrainCapstoneStarted(env);

  if (!input.era25SteadyStateOperatorLoopLockVisible && !capstoneStarted) return null;

  const p0ProofStatus = input.p0ProofStatus ?? input.p0Staging?.p0ProofStatus ?? null;
  const tier2ProofStatus = input.tier2ProofStatus ?? input.tier2Summary?.tier2ProofStatus ?? null;

  const capstoneIntegrity = evaluateEra25CommercialPilotConvergenceTrainCapstoneIntegrity(
    process.cwd(),
    {
      env,
      goNoGoOverride: input.goNoGoSummary ?? null,
      p0StagingOverride: input.p0Staging ?? null,
      tier2SummaryOverride: input.tier2Summary ?? null,
      metricsBaselineOverride: input.metricsBaseline ?? null,
      caseStudyDraftOverride: input.caseStudyDraft ?? null,
      investorOnepagerOverride: input.investorOnepager ?? null,
      rollbackDrillOverride: input.rollbackDrill ?? null,
      competitorMatrixOverride: input.competitorMatrix ?? null,
      p0ProofStatusOverride: p0ProofStatus,
      tier2ProofStatusOverride: tier2ProofStatus,
    },
  );

  const trainCapstoneComplete =
    capstoneIntegrity.era25CommercialPilotConvergenceTrainCapstoneComplete;
  const trainCapstoneBlocked = !trainCapstoneComplete;

  const era25ConvergenceGovernanceTerminusFreeze =
    buildEra25ConvergenceGovernanceTerminusFreezeEra25UiSlice({
      era25CommercialPilotConvergenceTrainCapstoneVisible: true,
      trainCapstoneComplete,
      env,
      goNoGoSummary: input.goNoGoSummary,
      p0Staging: input.p0Staging,
      tier2Summary: input.tier2Summary,
      metricsBaseline: input.metricsBaseline,
      caseStudyDraft: input.caseStudyDraft,
      investorOnepager: input.investorOnepager,
      rollbackDrill: input.rollbackDrill,
      competitorMatrix: input.competitorMatrix,
      p0ProofStatus,
      tier2ProofStatus,
    });

  const headline = trainCapstoneComplete
    ? `Train capstone closed · era47–AH governance honest · P0 ${capstoneIntegrity.p0ProofStatus ?? "referenced"}`
    : input.steadyStateLockComplete
      ? capstoneIntegrity.frozenEnvMutationDetected
        ? "Train capstone blocked · clear frozen era25 env keys before capstone attest"
        : capstoneIntegrity.p0ProofReferencedInCapstone &&
            capstoneIntegrity.p0ProofStatus !== "proof_passed"
          ? "Train capstone blocked · P0 proof_passed referenced without honest artifact"
          : "Awaiting commercial pilot convergence train capstone after steady-state lock"
      : "Awaiting era25 steady-state operator loop lock before train capstone";

  return {
    policyId: ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_ERA25_UI_POLICY_ID,
    visible: true,
    steadyStateLockComplete: input.steadyStateLockComplete,
    trainCapstoneBlocked,
    trainCapstoneComplete,
    p0ProofStatus: capstoneIntegrity.p0ProofStatus,
    p0ArtifactPresent: capstoneIntegrity.p0ArtifactPresent,
    p0ProofReferencedInCapstone: capstoneIntegrity.p0ProofReferencedInCapstone,
    frozenEnvMutationDetected: capstoneIntegrity.frozenEnvMutationDetected,
    goDecision: capstoneIntegrity.goDecision,
    convergenceDoc: ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_DOC,
    backlogId: ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_BACKLOG_ID,
    guardrails: ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_GUARDRAILS,
    foreverCommands: ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_FOREVER_COMMANDS,
    integrityValidateCommand:
      "npm run ops:validate-era25-commercial-pilot-convergence-train-capstone-integrity -- --json",
    syncIntegrityBaselineCommand:
      "npm run ops:sync-era25-commercial-pilot-convergence-train-capstone-integrity-baseline -- --write",
    validateSteadyStateLockIntegrityCommand:
      "npm run ops:validate-era25-steady-state-operator-loop-lock-integrity -- --json",
    validateP0StagingProofIntegrityCommand:
      "npm run ops:validate-p0-staging-proof-integrity -- --json",
    p0StagingProofSmokeCommand: "npm run smoke:p0-staging-proof-unblock",
    governanceBundlesCertCommand: "npm run test:ci:governance-bundles",
    commercialPilotRunbookCertCommand: "npm run test:ci:commercial-pilot-runbook:cert",
    era25CommercialPilotConvergenceTrainCapstoneIntegrityPassed: capstoneIntegrity.integrityPassed,
    era25SteadyStateOperatorLoopLockIntegrityPassed:
      capstoneIntegrity.era25SteadyStateOperatorLoopLockIntegrityPassed,
    launchWizardHref: `${LAUNCH_WIZARD_ROUTE}${LAUNCH_WIZARD_ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_ANCHOR}`,
    platformOpsHref: `${SERIES_A_PLATFORM_OPS_ROUTE}${ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_PLATFORM_ANCHOR}`,
    p0OpsVaultHref: `${SERIES_A_PLATFORM_OPS_ROUTE}#p0-ops-vault`,
    todayHref: "/dashboard/today",
    headline,
    era25ConvergenceGovernanceTerminusFreeze,
  };
}

export function formatEra25CommercialPilotConvergenceTrainCapstoneEra25Label(
  slice: Era25CommercialPilotConvergenceTrainCapstoneEra25UiSlice,
): string {
  const status = slice.trainCapstoneBlocked ? "BLOCKED" : "CAPSTONE";
  const p0 = slice.p0ProofStatus ?? "p0 n/a";
  return `era25 train capstone · ${status} · ${p0}`;
}
