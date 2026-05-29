/**
 * Launch Wizard — era25 post-steady-product-mode commercial ops rhythm permanence integrity.
 */
import type { Era25PostSteadyProductModeCommercialOpsRhythmPermanenceEra25UiSlice } from "@/lib/commercial/era25-post-steady-product-mode-commercial-ops-rhythm-permanence-ui-era25";

export const LAUNCH_WIZARD_ERA25_POST_STEADY_PRODUCT_MODE_COMMERCIAL_OPS_RHYTHM_PERMANENCE_ERA68_POLICY_ID =
  "era68-launch-wizard-era25-post-steady-product-mode-commercial-ops-rhythm-permanence-v1" as const;

export const LAUNCH_WIZARD_ERA25_POST_STEADY_PRODUCT_MODE_COMMERCIAL_OPS_RHYTHM_PERMANENCE_ANCHOR =
  "#launch-wizard-era25-post-steady-product-mode-commercial-ops-rhythm-permanence" as const;

export type LaunchWizardEra25PostSteadyProductModeCommercialOpsRhythmPermanenceSlice = {
  policyId: typeof LAUNCH_WIZARD_ERA25_POST_STEADY_PRODUCT_MODE_COMMERCIAL_OPS_RHYTHM_PERMANENCE_ERA68_POLICY_ID;
  visible: boolean;
  goDecision: string;
  customerName: string | null;
  era25PostSteadyProductModeCommercialOpsRhythmPermanenceIntegrityFailed: boolean;
  era25PostBandAGovernanceSteadyProductModeWitnessIntegrityFailed: boolean;
  rhythmPermanenceBlocked: boolean;
  era25MarketProofGovernanceChainClosed: boolean;
  postSteadyProductModeCommercialOpsRhythmPermanenceActive: boolean;
  postBandAGovernanceSteadyProductModeWitnessActive: boolean;
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

export function buildLaunchWizardEra25PostSteadyProductModeCommercialOpsRhythmPermanenceSlice(
  slice: Era25PostSteadyProductModeCommercialOpsRhythmPermanenceEra25UiSlice | null,
  customerName?: string | null,
): LaunchWizardEra25PostSteadyProductModeCommercialOpsRhythmPermanenceSlice | null {
  if (!slice) return null;

  const attentionNeeded = slice.rhythmPermanenceBlocked;

  return {
    policyId: LAUNCH_WIZARD_ERA25_POST_STEADY_PRODUCT_MODE_COMMERCIAL_OPS_RHYTHM_PERMANENCE_ERA68_POLICY_ID,
    visible: true,
    goDecision: slice.goDecision ?? "NO-GO",
    customerName: customerName ?? null,
    era25PostSteadyProductModeCommercialOpsRhythmPermanenceIntegrityFailed:
      !slice.era25PostSteadyProductModeCommercialOpsRhythmPermanenceIntegrityPassed,
    era25PostBandAGovernanceSteadyProductModeWitnessIntegrityFailed:
      !slice.era25PostBandAGovernanceSteadyProductModeWitnessIntegrityPassed,
    rhythmPermanenceBlocked: slice.rhythmPermanenceBlocked,
    era25MarketProofGovernanceChainClosed: slice.era25MarketProofGovernanceChainClosed,
    postSteadyProductModeCommercialOpsRhythmPermanenceActive:
      slice.postSteadyProductModeCommercialOpsRhythmPermanenceActive,
    postBandAGovernanceSteadyProductModeWitnessActive:
      slice.postBandAGovernanceSteadyProductModeWitnessActive,
    era25GovernanceTrainSealed: slice.era25GovernanceTrainSealed,
    governanceReopenClaimed: slice.governanceReopenClaimed,
    continuousImprovementLoopIntegrityPassed: slice.continuousImprovementLoopIntegrityPassed,
    p0ProofStatus: slice.p0ProofStatus,
    progressLabel: attentionNeeded
      ? slice.governanceReopenClaimed
        ? "Governance reopen env detected · clear frozen era25 keys"
        : !slice.continuousImprovementLoopIntegrityPassed
          ? "Improvement loop integrity FAIL"
          : !slice.postBandAGovernanceSteadyProductModeWitnessActive
            ? "Awaiting steady product mode witness before rhythm permanence"
            : "Rhythm permanence pending · sustain honest commercial artifacts"
      : "Commercial ops rhythm permanence active · zero era25 env mutation",
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

export function launchWizardEra25PostSteadyProductModeCommercialOpsRhythmPermanenceHref(): string {
  return `/dashboard/launch-wizard${LAUNCH_WIZARD_ERA25_POST_STEADY_PRODUCT_MODE_COMMERCIAL_OPS_RHYTHM_PERMANENCE_ANCHOR}`;
}
