/**
 * Launch Wizard — era25 governance train terminal seal integrity.
 */
import type { Era25GovernanceTrainTerminalSealEra25UiSlice } from "@/lib/commercial/era25-governance-train-terminal-seal-ui-era25";

export const LAUNCH_WIZARD_ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_ERA64_POLICY_ID =
  "era64-launch-wizard-era25-governance-train-terminal-seal-v1" as const;

export const LAUNCH_WIZARD_ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_ANCHOR =
  "#launch-wizard-era25-governance-train-terminal-seal" as const;

export type LaunchWizardEra25GovernanceTrainTerminalSealSlice = {
  policyId: typeof LAUNCH_WIZARD_ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_ERA64_POLICY_ID;
  visible: boolean;
  goDecision: string;
  customerName: string | null;
  era25GovernanceTrainTerminalSealIntegrityFailed: boolean;
  era25PostMarketProofSteadyOperationalWitnessIntegrityFailed: boolean;
  sealBlocked: boolean;
  era25MarketProofGovernanceChainClosed: boolean;
  era25GovernanceTrainSealed: boolean;
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

export function buildLaunchWizardEra25GovernanceTrainTerminalSealSlice(
  slice: Era25GovernanceTrainTerminalSealEra25UiSlice | null,
  customerName?: string | null,
): LaunchWizardEra25GovernanceTrainTerminalSealSlice | null {
  if (!slice) return null;

  const attentionNeeded = slice.sealBlocked;

  return {
    policyId: LAUNCH_WIZARD_ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_ERA64_POLICY_ID,
    visible: true,
    goDecision: slice.goDecision ?? "NO-GO",
    customerName: customerName ?? null,
    era25GovernanceTrainTerminalSealIntegrityFailed:
      !slice.era25GovernanceTrainTerminalSealIntegrityPassed,
    era25PostMarketProofSteadyOperationalWitnessIntegrityFailed:
      !slice.era25PostMarketProofSteadyOperationalWitnessIntegrityPassed,
    sealBlocked: slice.sealBlocked,
    era25MarketProofGovernanceChainClosed: slice.era25MarketProofGovernanceChainClosed,
    era25GovernanceTrainSealed: slice.era25GovernanceTrainSealed,
    postMarketProofSteadyOpsWitnessActive: slice.postMarketProofSteadyOpsWitnessActive,
    governanceReopenClaimed: slice.governanceReopenClaimed,
    continuousImprovementLoopIntegrityPassed: slice.continuousImprovementLoopIntegrityPassed,
    p0ProofStatus: slice.p0ProofStatus,
    progressLabel: attentionNeeded
      ? slice.governanceReopenClaimed
        ? "Governance reopen env detected · clear frozen era25 keys"
        : !slice.continuousImprovementLoopIntegrityPassed
          ? "Improvement loop integrity FAIL"
          : !slice.postMarketProofSteadyOpsWitnessActive
            ? "Awaiting post-market steady ops witness before terminal seal"
            : "Terminal seal pending · era25 governance train frozen"
      : "Governance train terminal seal active · era47–AM permanently closed",
    launchWizardHref: slice.launchWizardHref,
    platformOpsHref: slice.platformOpsHref,
    improvementLoopHref: slice.improvementLoopHref,
    todayHref: slice.todayHref,
    integrityValidateCommand: slice.integrityValidateCommand,
    governanceBundlesCertCommand: slice.governanceBundlesCertCommand,
    commercialPilotRunbookCertCommand: slice.commercialPilotRunbookCertCommand,
  };
}

export function launchWizardEra25GovernanceTrainTerminalSealHref(): string {
  return `/dashboard/launch-wizard${LAUNCH_WIZARD_ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_ANCHOR}`;
}
