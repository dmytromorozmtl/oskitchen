/**
 * Launch Wizard — era25 post-rhythm-permanence Band A governance terminal closure witness integrity.
 */
import type { Era25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessEra25UiSlice } from "@/lib/commercial/era25-post-rhythm-permanence-band-a-governance-terminal-closure-witness-ui-era25";

export const LAUNCH_WIZARD_ERA25_POST_RHYTHM_PERMANENCE_BAND_A_GOVERNANCE_TERMINAL_CLOSURE_WITNESS_ERA69_POLICY_ID =
  "era69-launch-wizard-era25-post-rhythm-permanence-band-a-governance-terminal-closure-witness-v1" as const;

export const LAUNCH_WIZARD_ERA25_POST_RHYTHM_PERMANENCE_BAND_A_GOVERNANCE_TERMINAL_CLOSURE_WITNESS_ANCHOR =
  "#launch-wizard-era25-post-rhythm-permanence-band-a-governance-terminal-closure-witness" as const;

export type LaunchWizardEra25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessSlice = {
  policyId: typeof LAUNCH_WIZARD_ERA25_POST_RHYTHM_PERMANENCE_BAND_A_GOVERNANCE_TERMINAL_CLOSURE_WITNESS_ERA69_POLICY_ID;
  visible: boolean;
  goDecision: string;
  customerName: string | null;
  era25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessIntegrityFailed: boolean;
  era25PostSteadyProductModeCommercialOpsRhythmPermanenceIntegrityFailed: boolean;
  terminalClosureWitnessBlocked: boolean;
  era25MarketProofGovernanceChainClosed: boolean;
  postRhythmPermanenceBandAGovernanceTerminalClosureWitnessActive: boolean;
  postSteadyProductModeCommercialOpsRhythmPermanenceActive: boolean;
  era25GovernanceTrainSealed: boolean;
  governanceReopenClaimed: boolean;
  continuousImprovementLoopIntegrityPassed: boolean;
  p0ProofStatus: string | null;
  progressLabel: string;
  launchWizardHref: string;
  platformOpsHref: string;
  improvementLoopHref: string;
  commercialOpsHref: string;
  todayHref: string;
  integrityValidateCommand: string;
  governanceBundlesCertCommand: string;
  commercialPilotRunbookCertCommand: string;
};

export function buildLaunchWizardEra25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessSlice(
  slice: Era25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessEra25UiSlice | null,
  customerName?: string | null,
): LaunchWizardEra25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessSlice | null {
  if (!slice) return null;

  const attentionNeeded = slice.terminalClosureWitnessBlocked;

  return {
    policyId:
      LAUNCH_WIZARD_ERA25_POST_RHYTHM_PERMANENCE_BAND_A_GOVERNANCE_TERMINAL_CLOSURE_WITNESS_ERA69_POLICY_ID,
    visible: true,
    goDecision: slice.goDecision ?? "NO-GO",
    customerName: customerName ?? null,
    era25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessIntegrityFailed:
      !slice.era25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessIntegrityPassed,
    era25PostSteadyProductModeCommercialOpsRhythmPermanenceIntegrityFailed:
      !slice.era25PostSteadyProductModeCommercialOpsRhythmPermanenceIntegrityPassed,
    terminalClosureWitnessBlocked: slice.terminalClosureWitnessBlocked,
    era25MarketProofGovernanceChainClosed: slice.era25MarketProofGovernanceChainClosed,
    postRhythmPermanenceBandAGovernanceTerminalClosureWitnessActive:
      slice.postRhythmPermanenceBandAGovernanceTerminalClosureWitnessActive,
    postSteadyProductModeCommercialOpsRhythmPermanenceActive:
      slice.postSteadyProductModeCommercialOpsRhythmPermanenceActive,
    era25GovernanceTrainSealed: slice.era25GovernanceTrainSealed,
    governanceReopenClaimed: slice.governanceReopenClaimed,
    continuousImprovementLoopIntegrityPassed: slice.continuousImprovementLoopIntegrityPassed,
    p0ProofStatus: slice.p0ProofStatus,
    progressLabel: attentionNeeded
      ? slice.governanceReopenClaimed
        ? "Governance reopen env detected · clear frozen era25 keys"
        : !slice.continuousImprovementLoopIntegrityPassed
          ? "Improvement loop integrity FAIL"
          : !slice.postSteadyProductModeCommercialOpsRhythmPermanenceActive
            ? "Awaiting rhythm permanence before terminal closure witness"
            : "Terminal closure witness pending · sustain honest commercial artifacts"
      : "Band A governance terminal closure witness active · era61–AR stack closed",
    launchWizardHref: slice.launchWizardHref,
    platformOpsHref: slice.platformOpsHref,
    improvementLoopHref: slice.improvementLoopHref,
    commercialOpsHref: slice.commercialOpsHref,
    todayHref: slice.todayHref,
    integrityValidateCommand: slice.integrityValidateCommand,
    governanceBundlesCertCommand: slice.governanceBundlesCertCommand,
    commercialPilotRunbookCertCommand: slice.commercialPilotRunbookCertCommand,
  };
}

export function launchWizardEra25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessHref(): string {
  return `/dashboard/launch-wizard${LAUNCH_WIZARD_ERA25_POST_RHYTHM_PERMANENCE_BAND_A_GOVERNANCE_TERMINAL_CLOSURE_WITNESS_ANCHOR}`;
}
