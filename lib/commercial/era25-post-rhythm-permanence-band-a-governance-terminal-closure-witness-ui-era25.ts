/**
 * Era25 post-rhythm-permanence Band A governance terminal closure witness UI slice.
 */
import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import type { Era25BandAGovernanceChainCapstoneWitnessIntegritySummary } from "@/lib/commercial/era25-band-a-governance-chain-capstone-witness-integrity-era66";
import { evaluateEra25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessIntegrity } from "@/lib/commercial/era25-post-rhythm-permanence-band-a-governance-terminal-closure-witness-integrity-era69";
import {
  ERA25_POST_RHYTHM_PERMANENCE_BAND_A_GOVERNANCE_TERMINAL_CLOSURE_WITNESS_DOC,
  ERA25_POST_RHYTHM_PERMANENCE_BAND_A_GOVERNANCE_TERMINAL_CLOSURE_WITNESS_FOREVER_COMMANDS,
  ERA25_POST_RHYTHM_PERMANENCE_BAND_A_GOVERNANCE_TERMINAL_CLOSURE_WITNESS_GUARDRAILS,
  ERA25_POST_RHYTHM_PERMANENCE_BAND_A_GOVERNANCE_TERMINAL_CLOSURE_WITNESS_BACKLOG_ID,
  ERA25_POST_RHYTHM_PERMANENCE_BAND_A_GOVERNANCE_TERMINAL_CLOSURE_WITNESS_PLATFORM_ANCHOR,
  detectEra25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessStarted,
} from "@/lib/commercial/era25-post-rhythm-permanence-band-a-governance-terminal-closure-witness-phases-era69";
import type { Era25PostBandAGovernanceSteadyProductModeWitnessIntegritySummary } from "@/lib/commercial/era25-post-band-a-governance-steady-product-mode-witness-integrity-era67";
import type { Era25PostSteadyProductModeCommercialOpsRhythmPermanenceIntegritySummary } from "@/lib/commercial/era25-post-steady-product-mode-commercial-ops-rhythm-permanence-integrity-era68";
import type { InvestorNarrativeOnepagerSummary } from "@/lib/commercial/investor-narrative-onepager-summary";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { PilotCaseStudyDraftSummary } from "@/lib/commercial/pilot-case-study-draft-summary";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { PilotMetricsBaselineSummary } from "@/lib/commercial/pilot-metrics-baseline-summary";
import type { PilotRollbackDrillSummary } from "@/lib/commercial/pilot-rollback-drill-summary";
import type { Tier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";
import { SERIES_A_PLATFORM_OPS_ROUTE } from "@/lib/commercial/sustained-operational-excellence-phases-era21";
import { LAUNCH_WIZARD_ROUTE } from "@/lib/launch-wizard/launch-wizard-era19-policy";
import { LAUNCH_WIZARD_ERA25_POST_RHYTHM_PERMANENCE_BAND_A_GOVERNANCE_TERMINAL_CLOSURE_WITNESS_ANCHOR } from "@/lib/launch-wizard/launch-wizard-era25-post-rhythm-permanence-band-a-governance-terminal-closure-witness-era69";

export const ERA25_POST_RHYTHM_PERMANENCE_BAND_A_GOVERNANCE_TERMINAL_CLOSURE_WITNESS_ERA25_UI_POLICY_ID =
  "era25-post-rhythm-permanence-band-a-governance-terminal-closure-witness-ui-v1" as const;

export type Era25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessEra25UiSlice = {
  policyId: typeof ERA25_POST_RHYTHM_PERMANENCE_BAND_A_GOVERNANCE_TERMINAL_CLOSURE_WITNESS_ERA25_UI_POLICY_ID;
  visible: boolean;
  era25MarketProofGovernanceChainClosed: boolean;
  terminalClosureWitnessBlocked: boolean;
  terminalClosureWitnessComplete: boolean;
  postRhythmPermanenceBandAGovernanceTerminalClosureWitnessActive: boolean;
  postSteadyProductModeCommercialOpsRhythmPermanenceActive: boolean;
  era25GovernanceTrainSealed: boolean;
  governanceReopenClaimed: boolean;
  continuousImprovementLoopIntegrityPassed: boolean;
  p0ProofStatus: string | null;
  p0ArtifactProofPassed: boolean;
  goDecision: string | null;
  convergenceDoc: typeof ERA25_POST_RHYTHM_PERMANENCE_BAND_A_GOVERNANCE_TERMINAL_CLOSURE_WITNESS_DOC;
  backlogId: typeof ERA25_POST_RHYTHM_PERMANENCE_BAND_A_GOVERNANCE_TERMINAL_CLOSURE_WITNESS_BACKLOG_ID;
  guardrails: typeof ERA25_POST_RHYTHM_PERMANENCE_BAND_A_GOVERNANCE_TERMINAL_CLOSURE_WITNESS_GUARDRAILS;
  foreverCommands: typeof ERA25_POST_RHYTHM_PERMANENCE_BAND_A_GOVERNANCE_TERMINAL_CLOSURE_WITNESS_FOREVER_COMMANDS;
  integrityValidateCommand: string;
  syncIntegrityBaselineCommand: string;
  validateRhythmPermanenceIntegrityCommand: string;
  validateImprovementLoopIntegrityCommand: string;
  governanceBundlesCertCommand: string;
  commercialPilotRunbookCertCommand: string;
  era25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessIntegrityPassed: boolean;
  era25PostSteadyProductModeCommercialOpsRhythmPermanenceIntegrityPassed: boolean;
  launchWizardHref: string;
  platformOpsHref: string;
  improvementLoopHref: string;
  commercialOpsHref: string;
  todayHref: string;
  headline: string;
};

export function buildEra25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessEra25UiSlice(input: {
  era25PostSteadyProductModeCommercialOpsRhythmPermanenceVisible: boolean;
  era25MarketProofGovernanceChainClosed: boolean;
  postSteadyProductModeCommercialOpsRhythmPermanenceActive: boolean;
  era25GovernanceTrainSealed: boolean;
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
  capstoneIntegritySummary?: Era25BandAGovernanceChainCapstoneWitnessIntegritySummary | null;
  steadyProductModeIntegritySummary?: Era25PostBandAGovernanceSteadyProductModeWitnessIntegritySummary | null;
  rhythmPermanenceIntegritySummary?: Era25PostSteadyProductModeCommercialOpsRhythmPermanenceIntegritySummary | null;
}): Era25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessEra25UiSlice | null {
  const env = input.env ?? process.env;
  const terminalClosureWitnessStarted =
    detectEra25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessStarted(env);

  if (
    !input.era25PostSteadyProductModeCommercialOpsRhythmPermanenceVisible &&
    !terminalClosureWitnessStarted
  ) {
    return null;
  }

  const p0ProofStatus = input.p0ProofStatus ?? input.p0Staging?.p0ProofStatus ?? null;
  const tier2ProofStatus = input.tier2ProofStatus ?? input.tier2Summary?.tier2ProofStatus ?? null;

  const terminalClosureWitnessIntegrity =
    evaluateEra25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessIntegrity(
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
        steadyProductModeIntegrityOverride: input.steadyProductModeIntegritySummary ?? null,
        rhythmPermanenceIntegrityOverride: input.rhythmPermanenceIntegritySummary ?? null,
      },
    );

  const terminalClosureWitnessComplete =
    terminalClosureWitnessIntegrity.era25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessComplete;
  const terminalClosureWitnessBlocked = !terminalClosureWitnessComplete;

  const headline = terminalClosureWitnessComplete
    ? "Band A governance terminal closure witness active · era61–AR stack permanently closed · improvement loop + honest commercial artifacts only"
    : input.postSteadyProductModeCommercialOpsRhythmPermanenceActive
      ? terminalClosureWitnessIntegrity.governanceReopenClaimed
        ? "Terminal closure witness blocked · era25 governance reopen env detected — clear frozen keys"
        : !terminalClosureWitnessIntegrity.continuousImprovementLoopIntegrityPassed
          ? "Terminal closure witness blocked · improvement loop integrity FAIL"
          : "Awaiting Band A governance terminal closure witness after commercial ops rhythm permanence"
      : "Awaiting commercial ops rhythm permanence before terminal closure witness";

  return {
    policyId: ERA25_POST_RHYTHM_PERMANENCE_BAND_A_GOVERNANCE_TERMINAL_CLOSURE_WITNESS_ERA25_UI_POLICY_ID,
    visible: true,
    era25MarketProofGovernanceChainClosed: input.era25MarketProofGovernanceChainClosed,
    terminalClosureWitnessBlocked,
    terminalClosureWitnessComplete,
    postRhythmPermanenceBandAGovernanceTerminalClosureWitnessActive:
      terminalClosureWitnessIntegrity.postRhythmPermanenceBandAGovernanceTerminalClosureWitnessActive,
    postSteadyProductModeCommercialOpsRhythmPermanenceActive:
      terminalClosureWitnessIntegrity.postSteadyProductModeCommercialOpsRhythmPermanenceActive,
    era25GovernanceTrainSealed: terminalClosureWitnessIntegrity.era25GovernanceTrainSealed,
    governanceReopenClaimed: terminalClosureWitnessIntegrity.governanceReopenClaimed,
    continuousImprovementLoopIntegrityPassed:
      terminalClosureWitnessIntegrity.continuousImprovementLoopIntegrityPassed,
    p0ProofStatus: terminalClosureWitnessIntegrity.p0ProofStatus,
    p0ArtifactProofPassed: terminalClosureWitnessIntegrity.p0ArtifactProofPassed,
    goDecision: terminalClosureWitnessIntegrity.goDecision,
    convergenceDoc: ERA25_POST_RHYTHM_PERMANENCE_BAND_A_GOVERNANCE_TERMINAL_CLOSURE_WITNESS_DOC,
    backlogId: ERA25_POST_RHYTHM_PERMANENCE_BAND_A_GOVERNANCE_TERMINAL_CLOSURE_WITNESS_BACKLOG_ID,
    guardrails: ERA25_POST_RHYTHM_PERMANENCE_BAND_A_GOVERNANCE_TERMINAL_CLOSURE_WITNESS_GUARDRAILS,
    foreverCommands:
      ERA25_POST_RHYTHM_PERMANENCE_BAND_A_GOVERNANCE_TERMINAL_CLOSURE_WITNESS_FOREVER_COMMANDS,
    integrityValidateCommand:
      "npm run ops:validate-era25-post-rhythm-permanence-band-a-governance-terminal-closure-witness-integrity -- --json",
    syncIntegrityBaselineCommand:
      "npm run ops:sync-era25-post-rhythm-permanence-band-a-governance-terminal-closure-witness-integrity-baseline -- --write",
    validateRhythmPermanenceIntegrityCommand:
      "npm run ops:validate-era25-post-steady-product-mode-commercial-ops-rhythm-permanence-integrity -- --json",
    validateImprovementLoopIntegrityCommand:
      "npm run ops:validate-continuous-improvement-loop-integrity -- --json",
    governanceBundlesCertCommand: "npm run test:ci:governance-bundles",
    commercialPilotRunbookCertCommand: "npm run test:ci:commercial-pilot-runbook:cert",
    era25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessIntegrityPassed:
      terminalClosureWitnessIntegrity.integrityPassed,
    era25PostSteadyProductModeCommercialOpsRhythmPermanenceIntegrityPassed:
      terminalClosureWitnessIntegrity.era25PostSteadyProductModeCommercialOpsRhythmPermanenceIntegrityPassed,
    launchWizardHref: `${LAUNCH_WIZARD_ROUTE}${LAUNCH_WIZARD_ERA25_POST_RHYTHM_PERMANENCE_BAND_A_GOVERNANCE_TERMINAL_CLOSURE_WITNESS_ANCHOR}`,
    platformOpsHref: `${SERIES_A_PLATFORM_OPS_ROUTE}${ERA25_POST_RHYTHM_PERMANENCE_BAND_A_GOVERNANCE_TERMINAL_CLOSURE_WITNESS_PLATFORM_ANCHOR}`,
    improvementLoopHref: `${SERIES_A_PLATFORM_OPS_ROUTE}#continuous-improvement-loop`,
    commercialOpsHref: `${SERIES_A_PLATFORM_OPS_ROUTE}#commercial-pilot-ops`,
    todayHref: "/dashboard/today",
    headline,
  };
}

export function formatEra25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessEra25Label(
  slice: Era25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessEra25UiSlice,
): string {
  const status = slice.terminalClosureWitnessBlocked ? "BLOCKED" : "CLOSED";
  const witness = slice.postRhythmPermanenceBandAGovernanceTerminalClosureWitnessActive
    ? "terminal witness"
    : "pending";
  return `era25 Band A governance terminal closure · ${status} · ${witness}`;
}
