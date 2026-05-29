/**
 * Launch Wizard — era25 Band A governance chain capstone witness integrity.
 */
import type { Era25BandAGovernanceChainCapstoneWitnessEra25UiSlice } from "@/lib/commercial/era25-band-a-governance-chain-capstone-witness-ui-era25";

export const LAUNCH_WIZARD_ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_ERA66_POLICY_ID =
  "era66-launch-wizard-era25-band-a-governance-chain-capstone-witness-v1" as const;

export const LAUNCH_WIZARD_ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_ANCHOR =
  "#launch-wizard-era25-band-a-governance-chain-capstone-witness" as const;

export type LaunchWizardEra25BandAGovernanceChainCapstoneWitnessSlice = {
  policyId: typeof LAUNCH_WIZARD_ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_ERA66_POLICY_ID;
  visible: boolean;
  goDecision: string;
  customerName: string | null;
  era25BandAGovernanceChainCapstoneWitnessIntegrityFailed: boolean;
  era25PostTerminalSealCommercialOpsPermanenceIntegrityFailed: boolean;
  capstoneWitnessBlocked: boolean;
  era25MarketProofGovernanceChainClosed: boolean;
  bandAGovernanceChainCapstoneWitnessActive: boolean;
  postTerminalSealCommercialOpsPermanenceActive: boolean;
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

export function buildLaunchWizardEra25BandAGovernanceChainCapstoneWitnessSlice(
  slice: Era25BandAGovernanceChainCapstoneWitnessEra25UiSlice | null,
  customerName?: string | null,
): LaunchWizardEra25BandAGovernanceChainCapstoneWitnessSlice | null {
  if (!slice) return null;

  const attentionNeeded = slice.capstoneWitnessBlocked;

  return {
    policyId: LAUNCH_WIZARD_ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_ERA66_POLICY_ID,
    visible: true,
    goDecision: slice.goDecision ?? "NO-GO",
    customerName: customerName ?? null,
    era25BandAGovernanceChainCapstoneWitnessIntegrityFailed:
      !slice.era25BandAGovernanceChainCapstoneWitnessIntegrityPassed,
    era25PostTerminalSealCommercialOpsPermanenceIntegrityFailed:
      !slice.era25PostTerminalSealCommercialOpsPermanenceIntegrityPassed,
    capstoneWitnessBlocked: slice.capstoneWitnessBlocked,
    era25MarketProofGovernanceChainClosed: slice.era25MarketProofGovernanceChainClosed,
    bandAGovernanceChainCapstoneWitnessActive: slice.bandAGovernanceChainCapstoneWitnessActive,
    postTerminalSealCommercialOpsPermanenceActive: slice.postTerminalSealCommercialOpsPermanenceActive,
    era25GovernanceTrainSealed: slice.era25GovernanceTrainSealed,
    governanceReopenClaimed: slice.governanceReopenClaimed,
    continuousImprovementLoopIntegrityPassed: slice.continuousImprovementLoopIntegrityPassed,
    p0ProofStatus: slice.p0ProofStatus,
    progressLabel: attentionNeeded
      ? slice.governanceReopenClaimed
        ? "Governance reopen env detected · clear frozen era25 keys"
        : !slice.continuousImprovementLoopIntegrityPassed
          ? "Improvement loop integrity FAIL"
          : !slice.postTerminalSealCommercialOpsPermanenceActive
            ? "Awaiting commercial ops permanence before capstone witness"
            : "Capstone witness pending · attest era61–AO stack closure"
      : "Band A governance chain capstone witness active · post-governance steady ops",
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

export function launchWizardEra25BandAGovernanceChainCapstoneWitnessHref(): string {
  return `/dashboard/launch-wizard${LAUNCH_WIZARD_ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_ANCHOR}`;
}
