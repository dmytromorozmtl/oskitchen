/**
 * Launch Wizard — era25 post-terminal-seal commercial ops permanence integrity.
 */
import type { Era25PostTerminalSealCommercialOpsPermanenceEra25UiSlice } from "@/lib/commercial/era25-post-terminal-seal-commercial-ops-permanence-ui-era25";

export const LAUNCH_WIZARD_ERA25_POST_TERMINAL_SEAL_COMMERCIAL_OPS_PERMANENCE_ERA65_POLICY_ID =
  "era65-launch-wizard-era25-post-terminal-seal-commercial-ops-permanence-v1" as const;

export const LAUNCH_WIZARD_ERA25_POST_TERMINAL_SEAL_COMMERCIAL_OPS_PERMANENCE_ANCHOR =
  "#launch-wizard-era25-post-terminal-seal-commercial-ops-permanence" as const;

export type LaunchWizardEra25PostTerminalSealCommercialOpsPermanenceSlice = {
  policyId: typeof LAUNCH_WIZARD_ERA25_POST_TERMINAL_SEAL_COMMERCIAL_OPS_PERMANENCE_ERA65_POLICY_ID;
  visible: boolean;
  goDecision: string;
  customerName: string | null;
  era25PostTerminalSealCommercialOpsPermanenceIntegrityFailed: boolean;
  era25GovernanceTrainTerminalSealIntegrityFailed: boolean;
  permanenceBlocked: boolean;
  era25MarketProofGovernanceChainClosed: boolean;
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

export function buildLaunchWizardEra25PostTerminalSealCommercialOpsPermanenceSlice(
  slice: Era25PostTerminalSealCommercialOpsPermanenceEra25UiSlice | null,
  customerName?: string | null,
): LaunchWizardEra25PostTerminalSealCommercialOpsPermanenceSlice | null {
  if (!slice) return null;

  const attentionNeeded = slice.permanenceBlocked;

  return {
    policyId: LAUNCH_WIZARD_ERA25_POST_TERMINAL_SEAL_COMMERCIAL_OPS_PERMANENCE_ERA65_POLICY_ID,
    visible: true,
    goDecision: slice.goDecision ?? "NO-GO",
    customerName: customerName ?? null,
    era25PostTerminalSealCommercialOpsPermanenceIntegrityFailed:
      !slice.era25PostTerminalSealCommercialOpsPermanenceIntegrityPassed,
    era25GovernanceTrainTerminalSealIntegrityFailed:
      !slice.era25GovernanceTrainTerminalSealIntegrityPassed,
    permanenceBlocked: slice.permanenceBlocked,
    era25MarketProofGovernanceChainClosed: slice.era25MarketProofGovernanceChainClosed,
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
          : !slice.era25GovernanceTrainSealed
            ? "Awaiting terminal seal before commercial ops permanence"
            : "Permanence pending · sustain honest commercial artifacts"
      : "Commercial ops permanence active · era25 governance permanently frozen",
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

export function launchWizardEra25PostTerminalSealCommercialOpsPermanenceHref(): string {
  return `/dashboard/launch-wizard${LAUNCH_WIZARD_ERA25_POST_TERMINAL_SEAL_COMMERCIAL_OPS_PERMANENCE_ANCHOR}`;
}
