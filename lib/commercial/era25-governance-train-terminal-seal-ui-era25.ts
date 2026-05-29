/**
 * Era25 governance train terminal seal UI slice.
 */
import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import { evaluateEra25GovernanceTrainTerminalSealIntegrity } from "@/lib/commercial/era25-governance-train-terminal-seal-integrity-era64";
import type { Era25PostMarketProofSteadyOperationalWitnessIntegritySummary } from "@/lib/commercial/era25-post-market-proof-steady-operational-witness-integrity-era63";
import {
  ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_DOC,
  ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_FOREVER_COMMANDS,
  ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_GUARDRAILS,
  ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_BACKLOG_ID,
  ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_PLATFORM_ANCHOR,
  detectEra25GovernanceTrainTerminalSealStarted,
} from "@/lib/commercial/era25-governance-train-terminal-seal-phases-era64";
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
  buildEra25PostTerminalSealCommercialOpsPermanenceEra25UiSlice,
  type Era25PostTerminalSealCommercialOpsPermanenceEra25UiSlice,
} from "@/lib/commercial/era25-post-terminal-seal-commercial-ops-permanence-ui-era25";
import { LAUNCH_WIZARD_ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_ANCHOR } from "@/lib/launch-wizard/launch-wizard-era25-governance-train-terminal-seal-era64";

export const ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_ERA25_UI_POLICY_ID =
  "era25-governance-train-terminal-seal-ui-v1" as const;

export type Era25GovernanceTrainTerminalSealEra25UiSlice = {
  policyId: typeof ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_ERA25_UI_POLICY_ID;
  visible: boolean;
  era25MarketProofGovernanceChainClosed: boolean;
  sealBlocked: boolean;
  sealComplete: boolean;
  era25GovernanceTrainSealed: boolean;
  postMarketProofSteadyOpsWitnessActive: boolean;
  governanceReopenClaimed: boolean;
  continuousImprovementLoopIntegrityPassed: boolean;
  p0ProofStatus: string | null;
  p0ArtifactProofPassed: boolean;
  goDecision: string | null;
  convergenceDoc: typeof ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_DOC;
  backlogId: typeof ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_BACKLOG_ID;
  guardrails: typeof ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_GUARDRAILS;
  foreverCommands: typeof ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_FOREVER_COMMANDS;
  integrityValidateCommand: string;
  syncIntegrityBaselineCommand: string;
  validateSteadyWitnessIntegrityCommand: string;
  validateImprovementLoopIntegrityCommand: string;
  governanceBundlesCertCommand: string;
  commercialPilotRunbookCertCommand: string;
  era25GovernanceTrainTerminalSealIntegrityPassed: boolean;
  era25PostMarketProofSteadyOperationalWitnessIntegrityPassed: boolean;
  launchWizardHref: string;
  platformOpsHref: string;
  improvementLoopHref: string;
  todayHref: string;
  headline: string;
  era25PostTerminalSealCommercialOpsPermanence: Era25PostTerminalSealCommercialOpsPermanenceEra25UiSlice | null;
};

export function buildEra25GovernanceTrainTerminalSealEra25UiSlice(input: {
  era25PostMarketProofSteadyOperationalWitnessVisible: boolean;
  era25MarketProofGovernanceChainClosed: boolean;
  postMarketProofSteadyOpsWitnessActive: boolean;
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
  witnessIntegritySummary?: Era25PostMarketProofSteadyOperationalWitnessIntegritySummary | null;
}): Era25GovernanceTrainTerminalSealEra25UiSlice | null {
  const env = input.env ?? process.env;
  const sealStarted = detectEra25GovernanceTrainTerminalSealStarted(env);

  if (!input.era25PostMarketProofSteadyOperationalWitnessVisible && !sealStarted) {
    return null;
  }

  const p0ProofStatus = input.p0ProofStatus ?? input.p0Staging?.p0ProofStatus ?? null;
  const tier2ProofStatus = input.tier2ProofStatus ?? input.tier2Summary?.tier2ProofStatus ?? null;

  const sealIntegrity = evaluateEra25GovernanceTrainTerminalSealIntegrity(process.cwd(), {
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
    witnessIntegrityOverride: input.witnessIntegritySummary ?? null,
  });

  const sealComplete = sealIntegrity.era25GovernanceTrainTerminalSealComplete;
  const sealBlocked = !sealComplete;

  const era25PostTerminalSealCommercialOpsPermanence =
    buildEra25PostTerminalSealCommercialOpsPermanenceEra25UiSlice({
      era25GovernanceTrainTerminalSealVisible: true,
      era25MarketProofGovernanceChainClosed: input.era25MarketProofGovernanceChainClosed,
      era25GovernanceTrainSealed: sealIntegrity.era25GovernanceTrainSealed,
      postMarketProofSteadyOpsWitnessActive: sealIntegrity.postMarketProofSteadyOpsWitnessActive,
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
      sealIntegritySummary: sealIntegrity,
    });

  const headline = sealComplete
    ? "Era25 governance train terminal seal active · era47–AM train permanently closed"
    : input.postMarketProofSteadyOpsWitnessActive
      ? sealIntegrity.governanceReopenClaimed
        ? "Seal blocked · era25 governance reopen env detected — clear frozen keys"
        : !sealIntegrity.continuousImprovementLoopIntegrityPassed
          ? "Seal blocked · improvement loop integrity FAIL"
          : "Awaiting governance train terminal seal after post-market steady ops witness"
      : "Awaiting post-market steady ops witness before governance train terminal seal";

  return {
    policyId: ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_ERA25_UI_POLICY_ID,
    visible: true,
    era25MarketProofGovernanceChainClosed: input.era25MarketProofGovernanceChainClosed,
    sealBlocked,
    sealComplete,
    era25GovernanceTrainSealed: sealIntegrity.era25GovernanceTrainSealed,
    postMarketProofSteadyOpsWitnessActive: sealIntegrity.postMarketProofSteadyOpsWitnessActive,
    governanceReopenClaimed: sealIntegrity.governanceReopenClaimed,
    continuousImprovementLoopIntegrityPassed:
      sealIntegrity.continuousImprovementLoopIntegrityPassed,
    p0ProofStatus: sealIntegrity.p0ProofStatus,
    p0ArtifactProofPassed: sealIntegrity.p0ArtifactProofPassed,
    goDecision: sealIntegrity.goDecision,
    convergenceDoc: ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_DOC,
    backlogId: ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_BACKLOG_ID,
    guardrails: ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_GUARDRAILS,
    foreverCommands: ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_FOREVER_COMMANDS,
    integrityValidateCommand:
      "npm run ops:validate-era25-governance-train-terminal-seal-integrity -- --json",
    syncIntegrityBaselineCommand:
      "npm run ops:sync-era25-governance-train-terminal-seal-integrity-baseline -- --write",
    validateSteadyWitnessIntegrityCommand:
      "npm run ops:validate-era25-post-market-proof-steady-operational-witness-integrity -- --json",
    validateImprovementLoopIntegrityCommand:
      "npm run ops:validate-continuous-improvement-loop-integrity -- --json",
    governanceBundlesCertCommand: "npm run test:ci:governance-bundles",
    commercialPilotRunbookCertCommand: "npm run test:ci:commercial-pilot-runbook:cert",
    era25GovernanceTrainTerminalSealIntegrityPassed: sealIntegrity.integrityPassed,
    era25PostMarketProofSteadyOperationalWitnessIntegrityPassed:
      sealIntegrity.era25PostMarketProofSteadyOperationalWitnessIntegrityPassed,
    launchWizardHref: `${LAUNCH_WIZARD_ROUTE}${LAUNCH_WIZARD_ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_ANCHOR}`,
    platformOpsHref: `${SERIES_A_PLATFORM_OPS_ROUTE}${ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_PLATFORM_ANCHOR}`,
    improvementLoopHref: `${SERIES_A_PLATFORM_OPS_ROUTE}#continuous-improvement-loop`,
    todayHref: "/dashboard/today",
    headline,
    era25PostTerminalSealCommercialOpsPermanence,
  };
}

export function formatEra25GovernanceTrainTerminalSealEra25Label(
  slice: Era25GovernanceTrainTerminalSealEra25UiSlice,
): string {
  const status = slice.sealBlocked ? "BLOCKED" : "SEALED";
  const train = slice.era25GovernanceTrainSealed ? "train sealed" : "pending";
  return `era25 governance train seal · ${status} · ${train}`;
}
