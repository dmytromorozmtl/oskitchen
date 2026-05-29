/**
 * Launch Wizard — era25 post-market-proof steady operational witness integrity.
 */
import type { Era25PostMarketProofSteadyOperationalWitnessEra25UiSlice } from "@/lib/commercial/era25-post-market-proof-steady-operational-witness-ui-era25";

export const LAUNCH_WIZARD_ERA25_POST_MARKET_PROOF_STEADY_OPERATIONAL_WITNESS_ERA63_POLICY_ID =
  "era63-launch-wizard-era25-post-market-proof-steady-operational-witness-v1" as const;

export const LAUNCH_WIZARD_ERA25_POST_MARKET_PROOF_STEADY_OPERATIONAL_WITNESS_ANCHOR =
  "#launch-wizard-era25-post-market-proof-steady-operational-witness" as const;

export type LaunchWizardEra25PostMarketProofSteadyOperationalWitnessSlice = {
  policyId: typeof LAUNCH_WIZARD_ERA25_POST_MARKET_PROOF_STEADY_OPERATIONAL_WITNESS_ERA63_POLICY_ID;
  visible: boolean;
  goDecision: string;
  customerName: string | null;
  era25PostMarketProofSteadyOperationalWitnessIntegrityFailed: boolean;
  era25P0MarketProofHonestClosureCapstoneIntegrityFailed: boolean;
  witnessBlocked: boolean;
  era25MarketProofGovernanceChainClosed: boolean;
  postMarketProofSteadyOpsWitnessActive: boolean;
  governanceReopenClaimed: boolean;
  continuousImprovementLoopIntegrityPassed: boolean;
  p0ProofStatus: string | null;
  progressLabel: string;
  launchWizardHref: string;
  platformOpsHref: string;
  improvementLoopHref: string;
  todayHref: string;
  integrityValidateCommand: string;
  governanceBundlesCertCommand: string;
  commercialPilotRunbookCertCommand: string;
};

export function buildLaunchWizardEra25PostMarketProofSteadyOperationalWitnessSlice(
  slice: Era25PostMarketProofSteadyOperationalWitnessEra25UiSlice | null,
  customerName?: string | null,
): LaunchWizardEra25PostMarketProofSteadyOperationalWitnessSlice | null {
  if (!slice) return null;

  const attentionNeeded = slice.witnessBlocked;

  return {
    policyId: LAUNCH_WIZARD_ERA25_POST_MARKET_PROOF_STEADY_OPERATIONAL_WITNESS_ERA63_POLICY_ID,
    visible: true,
    goDecision: slice.goDecision ?? "NO-GO",
    customerName: customerName ?? null,
    era25PostMarketProofSteadyOperationalWitnessIntegrityFailed:
      !slice.era25PostMarketProofSteadyOperationalWitnessIntegrityPassed,
    era25P0MarketProofHonestClosureCapstoneIntegrityFailed:
      !slice.era25P0MarketProofHonestClosureCapstoneIntegrityPassed,
    witnessBlocked: slice.witnessBlocked,
    era25MarketProofGovernanceChainClosed: slice.era25MarketProofGovernanceChainClosed,
    postMarketProofSteadyOpsWitnessActive: slice.postMarketProofSteadyOpsWitnessActive,
    governanceReopenClaimed: slice.governanceReopenClaimed,
    continuousImprovementLoopIntegrityPassed: slice.continuousImprovementLoopIntegrityPassed,
    p0ProofStatus: slice.p0ProofStatus,
    progressLabel: attentionNeeded
      ? slice.governanceReopenClaimed
        ? "Governance reopen env detected · clear frozen era25 keys"
        : !slice.continuousImprovementLoopIntegrityPassed
          ? "Improvement loop integrity FAIL"
          : !slice.era25MarketProofGovernanceChainClosed
            ? "Awaiting P0 closure capstone before steady ops witness"
            : "Witness pending · sustain improvement loop on frozen governance"
      : "Post-market steady ops witness active · era25 governance frozen",
    launchWizardHref: slice.launchWizardHref,
    platformOpsHref: slice.platformOpsHref,
    improvementLoopHref: slice.improvementLoopHref,
    todayHref: slice.todayHref,
    integrityValidateCommand: slice.integrityValidateCommand,
    governanceBundlesCertCommand: slice.governanceBundlesCertCommand,
    commercialPilotRunbookCertCommand: slice.commercialPilotRunbookCertCommand,
  };
}

export function launchWizardEra25PostMarketProofSteadyOperationalWitnessHref(): string {
  return `/dashboard/launch-wizard${LAUNCH_WIZARD_ERA25_POST_MARKET_PROOF_STEADY_OPERATIONAL_WITNESS_ANCHOR}`;
}
