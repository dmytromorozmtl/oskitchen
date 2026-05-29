/**
 * Era25 post-terminal-seal commercial ops permanence UI slice.
 */
import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import { evaluateEra25PostTerminalSealCommercialOpsPermanenceIntegrity } from "@/lib/commercial/era25-post-terminal-seal-commercial-ops-permanence-integrity-era65";
import type { Era25GovernanceTrainTerminalSealIntegritySummary } from "@/lib/commercial/era25-governance-train-terminal-seal-integrity-era64";
import {
  ERA25_POST_TERMINAL_SEAL_COMMERCIAL_OPS_PERMANENCE_DOC,
  ERA25_POST_TERMINAL_SEAL_COMMERCIAL_OPS_PERMANENCE_FOREVER_COMMANDS,
  ERA25_POST_TERMINAL_SEAL_COMMERCIAL_OPS_PERMANENCE_GUARDRAILS,
  ERA25_POST_TERMINAL_SEAL_COMMERCIAL_OPS_PERMANENCE_BACKLOG_ID,
  ERA25_POST_TERMINAL_SEAL_COMMERCIAL_OPS_PERMANENCE_PLATFORM_ANCHOR,
  detectEra25PostTerminalSealCommercialOpsPermanenceStarted,
} from "@/lib/commercial/era25-post-terminal-seal-commercial-ops-permanence-phases-era65";
import type { InvestorNarrativeOnepagerSummary } from "@/lib/commercial/investor-narrative-onepager-summary";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { PilotCaseStudyDraftSummary } from "@/lib/commercial/pilot-case-study-draft-summary";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { PilotMetricsBaselineSummary } from "@/lib/commercial/pilot-metrics-baseline-summary";
import type { PilotRollbackDrillSummary } from "@/lib/commercial/pilot-rollback-drill-summary";
import type { Tier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";
import { SERIES_A_PLATFORM_OPS_ROUTE } from "@/lib/commercial/sustained-operational-excellence-phases-era21";
import { LAUNCH_WIZARD_ROUTE } from "@/lib/launch-wizard/launch-wizard-era19-policy";
import { LAUNCH_WIZARD_ERA25_POST_TERMINAL_SEAL_COMMERCIAL_OPS_PERMANENCE_ANCHOR } from "@/lib/launch-wizard/launch-wizard-era25-post-terminal-seal-commercial-ops-permanence-era65";

export const ERA25_POST_TERMINAL_SEAL_COMMERCIAL_OPS_PERMANENCE_ERA25_UI_POLICY_ID =
  "era25-post-terminal-seal-commercial-ops-permanence-ui-v1" as const;

export type Era25PostTerminalSealCommercialOpsPermanenceEra25UiSlice = {
  policyId: typeof ERA25_POST_TERMINAL_SEAL_COMMERCIAL_OPS_PERMANENCE_ERA25_UI_POLICY_ID;
  visible: boolean;
  era25MarketProofGovernanceChainClosed: boolean;
  permanenceBlocked: boolean;
  permanenceComplete: boolean;
  postTerminalSealCommercialOpsPermanenceActive: boolean;
  era25GovernanceTrainSealed: boolean;
  postMarketProofSteadyOpsWitnessActive: boolean;
  governanceReopenClaimed: boolean;
  continuousImprovementLoopIntegrityPassed: boolean;
  p0ProofStatus: string | null;
  p0ArtifactProofPassed: boolean;
  goDecision: string | null;
  convergenceDoc: typeof ERA25_POST_TERMINAL_SEAL_COMMERCIAL_OPS_PERMANENCE_DOC;
  backlogId: typeof ERA25_POST_TERMINAL_SEAL_COMMERCIAL_OPS_PERMANENCE_BACKLOG_ID;
  guardrails: typeof ERA25_POST_TERMINAL_SEAL_COMMERCIAL_OPS_PERMANENCE_GUARDRAILS;
  foreverCommands: typeof ERA25_POST_TERMINAL_SEAL_COMMERCIAL_OPS_PERMANENCE_FOREVER_COMMANDS;
  integrityValidateCommand: string;
  syncIntegrityBaselineCommand: string;
  validateTerminalSealIntegrityCommand: string;
  validateImprovementLoopIntegrityCommand: string;
  governanceBundlesCertCommand: string;
  commercialPilotRunbookCertCommand: string;
  era25PostTerminalSealCommercialOpsPermanenceIntegrityPassed: boolean;
  era25GovernanceTrainTerminalSealIntegrityPassed: boolean;
  launchWizardHref: string;
  platformOpsHref: string;
  improvementLoopHref: string;
  commercialOpsHref: string;
  todayHref: string;
  headline: string;
};

export function buildEra25PostTerminalSealCommercialOpsPermanenceEra25UiSlice(input: {
  era25GovernanceTrainTerminalSealVisible: boolean;
  era25MarketProofGovernanceChainClosed: boolean;
  era25GovernanceTrainSealed: boolean;
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
  sealIntegritySummary?: Era25GovernanceTrainTerminalSealIntegritySummary | null;
}): Era25PostTerminalSealCommercialOpsPermanenceEra25UiSlice | null {
  const env = input.env ?? process.env;
  const permanenceStarted = detectEra25PostTerminalSealCommercialOpsPermanenceStarted(env);

  if (!input.era25GovernanceTrainTerminalSealVisible && !permanenceStarted) {
    return null;
  }

  const p0ProofStatus = input.p0ProofStatus ?? input.p0Staging?.p0ProofStatus ?? null;
  const tier2ProofStatus = input.tier2ProofStatus ?? input.tier2Summary?.tier2ProofStatus ?? null;

  const permanenceIntegrity = evaluateEra25PostTerminalSealCommercialOpsPermanenceIntegrity(
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
      sealIntegrityOverride: input.sealIntegritySummary ?? null,
    },
  );

  const permanenceComplete = permanenceIntegrity.era25PostTerminalSealCommercialOpsPermanenceComplete;
  const permanenceBlocked = !permanenceComplete;

  const headline = permanenceComplete
    ? "Post-terminal-seal commercial ops permanence active · honest artifacts + improvement loop only"
    : input.era25GovernanceTrainSealed
      ? permanenceIntegrity.governanceReopenClaimed
        ? "Permanence blocked · era25 governance reopen env detected — clear frozen keys"
        : !permanenceIntegrity.continuousImprovementLoopIntegrityPassed
          ? "Permanence blocked · improvement loop integrity FAIL"
          : "Awaiting commercial ops permanence after governance train terminal seal"
      : "Awaiting governance train terminal seal before commercial ops permanence";

  return {
    policyId: ERA25_POST_TERMINAL_SEAL_COMMERCIAL_OPS_PERMANENCE_ERA25_UI_POLICY_ID,
    visible: true,
    era25MarketProofGovernanceChainClosed: input.era25MarketProofGovernanceChainClosed,
    permanenceBlocked,
    permanenceComplete,
    postTerminalSealCommercialOpsPermanenceActive:
      permanenceIntegrity.postTerminalSealCommercialOpsPermanenceActive,
    era25GovernanceTrainSealed: permanenceIntegrity.era25GovernanceTrainSealed,
    postMarketProofSteadyOpsWitnessActive: permanenceIntegrity.postMarketProofSteadyOpsWitnessActive,
    governanceReopenClaimed: permanenceIntegrity.governanceReopenClaimed,
    continuousImprovementLoopIntegrityPassed:
      permanenceIntegrity.continuousImprovementLoopIntegrityPassed,
    p0ProofStatus: permanenceIntegrity.p0ProofStatus,
    p0ArtifactProofPassed: permanenceIntegrity.p0ArtifactProofPassed,
    goDecision: permanenceIntegrity.goDecision,
    convergenceDoc: ERA25_POST_TERMINAL_SEAL_COMMERCIAL_OPS_PERMANENCE_DOC,
    backlogId: ERA25_POST_TERMINAL_SEAL_COMMERCIAL_OPS_PERMANENCE_BACKLOG_ID,
    guardrails: ERA25_POST_TERMINAL_SEAL_COMMERCIAL_OPS_PERMANENCE_GUARDRAILS,
    foreverCommands: ERA25_POST_TERMINAL_SEAL_COMMERCIAL_OPS_PERMANENCE_FOREVER_COMMANDS,
    integrityValidateCommand:
      "npm run ops:validate-era25-post-terminal-seal-commercial-ops-permanence-integrity -- --json",
    syncIntegrityBaselineCommand:
      "npm run ops:sync-era25-post-terminal-seal-commercial-ops-permanence-integrity-baseline -- --write",
    validateTerminalSealIntegrityCommand:
      "npm run ops:validate-era25-governance-train-terminal-seal-integrity -- --json",
    validateImprovementLoopIntegrityCommand:
      "npm run ops:validate-continuous-improvement-loop-integrity -- --json",
    governanceBundlesCertCommand: "npm run test:ci:governance-bundles",
    commercialPilotRunbookCertCommand: "npm run test:ci:commercial-pilot-runbook:cert",
    era25PostTerminalSealCommercialOpsPermanenceIntegrityPassed: permanenceIntegrity.integrityPassed,
    era25GovernanceTrainTerminalSealIntegrityPassed:
      permanenceIntegrity.era25GovernanceTrainTerminalSealIntegrityPassed,
    launchWizardHref: `${LAUNCH_WIZARD_ROUTE}${LAUNCH_WIZARD_ERA25_POST_TERMINAL_SEAL_COMMERCIAL_OPS_PERMANENCE_ANCHOR}`,
    platformOpsHref: `${SERIES_A_PLATFORM_OPS_ROUTE}${ERA25_POST_TERMINAL_SEAL_COMMERCIAL_OPS_PERMANENCE_PLATFORM_ANCHOR}`,
    improvementLoopHref: `${SERIES_A_PLATFORM_OPS_ROUTE}#continuous-improvement-loop`,
    commercialOpsHref: `${SERIES_A_PLATFORM_OPS_ROUTE}#commercial-pilot-ops`,
    todayHref: "/dashboard/today",
    headline,
  };
}

export function formatEra25PostTerminalSealCommercialOpsPermanenceEra25Label(
  slice: Era25PostTerminalSealCommercialOpsPermanenceEra25UiSlice,
): string {
  const status = slice.permanenceBlocked ? "BLOCKED" : "PERMANENT";
  const ops = slice.postTerminalSealCommercialOpsPermanenceActive ? "commercial ops" : "pending";
  return `era25 post-seal permanence · ${status} · ${ops}`;
}
