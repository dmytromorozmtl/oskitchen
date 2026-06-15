/**
 * Launch Wizard — era25 post-band-a-governance steady product mode witness integrity.
 */
import type { Era25PostBandAGovernanceSteadyProductModeWitnessEra25UiSlice } from "@/lib/commercial/era25-post-band-a-governance-steady-product-mode-witness-ui-era25";

export const LAUNCH_WIZARD_ERA25_POST_BAND_A_GOVERNANCE_STEADY_PRODUCT_MODE_WITNESS_ERA67_POLICY_ID =
  "era67-launch-wizard-era25-post-band-a-governance-steady-product-mode-witness-v1" as const;

export const LAUNCH_WIZARD_ERA25_POST_BAND_A_GOVERNANCE_STEADY_PRODUCT_MODE_WITNESS_ANCHOR =
  "#launch-wizard-era25-post-band-a-governance-steady-product-mode-witness" as const;

export type LaunchWizardEra25PostBandAGovernanceSteadyProductModeWitnessSlice = {
  policyId: typeof LAUNCH_WIZARD_ERA25_POST_BAND_A_GOVERNANCE_STEADY_PRODUCT_MODE_WITNESS_ERA67_POLICY_ID;
  visible: boolean;
  goDecision: string;
  customerName: string | null;
  era25PostBandAGovernanceSteadyProductModeWitnessIntegrityFailed: boolean;
  era25BandAGovernanceChainCapstoneWitnessIntegrityFailed: boolean;
  steadyProductModeWitnessBlocked: boolean;
  era25MarketProofGovernanceChainClosed: boolean;
  postBandAGovernanceSteadyProductModeWitnessActive: boolean;
  bandAGovernanceChainCapstoneWitnessActive: boolean;
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

export function buildLaunchWizardEra25PostBandAGovernanceSteadyProductModeWitnessSlice(
  slice: Era25PostBandAGovernanceSteadyProductModeWitnessEra25UiSlice | null,
  customerName?: string | null,
): LaunchWizardEra25PostBandAGovernanceSteadyProductModeWitnessSlice | null {
  if (!slice) return null;

  const attentionNeeded = slice.steadyProductModeWitnessBlocked;

  return {
    policyId: LAUNCH_WIZARD_ERA25_POST_BAND_A_GOVERNANCE_STEADY_PRODUCT_MODE_WITNESS_ERA67_POLICY_ID,
    visible: true,
    goDecision: slice.goDecision ?? "NO-GO",
    customerName: customerName ?? null,
    era25PostBandAGovernanceSteadyProductModeWitnessIntegrityFailed:
      !slice.era25PostBandAGovernanceSteadyProductModeWitnessIntegrityPassed,
    era25BandAGovernanceChainCapstoneWitnessIntegrityFailed:
      !slice.era25BandAGovernanceChainCapstoneWitnessIntegrityPassed,
    steadyProductModeWitnessBlocked: slice.steadyProductModeWitnessBlocked,
    era25MarketProofGovernanceChainClosed: slice.era25MarketProofGovernanceChainClosed,
    postBandAGovernanceSteadyProductModeWitnessActive:
      slice.postBandAGovernanceSteadyProductModeWitnessActive,
    bandAGovernanceChainCapstoneWitnessActive: slice.bandAGovernanceChainCapstoneWitnessActive,
    era25GovernanceTrainSealed: slice.era25GovernanceTrainSealed,
    governanceReopenClaimed: slice.governanceReopenClaimed,
    continuousImprovementLoopIntegrityPassed: slice.continuousImprovementLoopIntegrityPassed,
    p0ProofStatus: slice.p0ProofStatus,
    progressLabel: attentionNeeded
      ? slice.governanceReopenClaimed
        ? "Governance reopen env detected · clear frozen era25 keys"
        : !slice.continuousImprovementLoopIntegrityPassed
          ? "Improvement loop integrity FAIL"
          : !slice.bandAGovernanceChainCapstoneWitnessActive
            ? "Awaiting Band A capstone before steady product mode witness"
            : "Steady product mode witness pending · attest post-governance ops"
      : "Post-governance steady product mode active · zero era25 env mutation",
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

export function launchWizardEra25PostBandAGovernanceSteadyProductModeWitnessHref(): string {
  return `/dashboard/launch-wizard${LAUNCH_WIZARD_ERA25_POST_BAND_A_GOVERNANCE_STEADY_PRODUCT_MODE_WITNESS_ANCHOR}`;
}
