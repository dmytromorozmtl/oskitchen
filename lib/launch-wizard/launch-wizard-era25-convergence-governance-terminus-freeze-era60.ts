/**
 * Launch Wizard — era25 convergence governance terminus freeze integrity.
 */
import type { Era25ConvergenceGovernanceTerminusFreezeEra25UiSlice } from "@/lib/commercial/era25-convergence-governance-terminus-freeze-ui-era25";

export const LAUNCH_WIZARD_ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_ERA60_POLICY_ID =
  "era60-launch-wizard-era25-convergence-governance-terminus-freeze-v1" as const;

export const LAUNCH_WIZARD_ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_ANCHOR =
  "#launch-wizard-era25-convergence-governance-terminus-freeze" as const;

export type LaunchWizardEra25ConvergenceGovernanceTerminusFreezeSlice = {
  policyId: typeof LAUNCH_WIZARD_ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_ERA60_POLICY_ID;
  visible: boolean;
  goDecision: string;
  customerName: string | null;
  era25ConvergenceGovernanceTerminusFreezeIntegrityFailed: boolean;
  era25CommercialPilotConvergenceTrainCapstoneIntegrityFailed: boolean;
  terminusFreezeBlocked: boolean;
  era25ProductConvergenceSurfacesSuppressed: boolean;
  frozenEnvMutationDetected: boolean;
  p0ProofStatus: string | null;
  progressLabel: string;
  launchWizardHref: string;
  platformOpsHref: string;
  p0OpsVaultHref: string;
  improvementLoopHref: string;
  todayHref: string;
  integrityValidateCommand: string;
  governanceBundlesCertCommand: string;
  commercialPilotRunbookCertCommand: string;
};

export function buildLaunchWizardEra25ConvergenceGovernanceTerminusFreezeSlice(
  slice: Era25ConvergenceGovernanceTerminusFreezeEra25UiSlice | null,
  customerName?: string | null,
): LaunchWizardEra25ConvergenceGovernanceTerminusFreezeSlice | null {
  if (!slice) return null;

  const attentionNeeded = slice.terminusFreezeBlocked;

  return {
    policyId: LAUNCH_WIZARD_ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_ERA60_POLICY_ID,
    visible: true,
    goDecision: slice.goDecision ?? "NO-GO",
    customerName: customerName ?? null,
    era25ConvergenceGovernanceTerminusFreezeIntegrityFailed:
      !slice.era25ConvergenceGovernanceTerminusFreezeIntegrityPassed,
    era25CommercialPilotConvergenceTrainCapstoneIntegrityFailed:
      !slice.era25CommercialPilotConvergenceTrainCapstoneIntegrityPassed,
    terminusFreezeBlocked: slice.terminusFreezeBlocked,
    era25ProductConvergenceSurfacesSuppressed: slice.era25ProductConvergenceSurfacesSuppressed,
    frozenEnvMutationDetected: slice.frozenEnvMutationDetected,
    p0ProofStatus: slice.p0ProofStatus,
    progressLabel: attentionNeeded
      ? slice.frozenEnvMutationDetected
        ? "Frozen env mutation · clear era25 governance attest keys"
        : slice.marketProofReferencedInTerminusFreeze && slice.p0ProofStatus !== "proof_passed"
          ? "Market proof referenced · P0 artifact not proof_passed"
          : `Terminus freeze pending · capstone ${slice.trainCapstoneComplete ? "closed" : "open"}`
      : `Governance frozen · convergence suppressed · P0 ${slice.p0ProofStatus ?? "Band A"}`,
    launchWizardHref: slice.launchWizardHref,
    platformOpsHref: slice.platformOpsHref,
    p0OpsVaultHref: slice.p0OpsVaultHref,
    improvementLoopHref: slice.improvementLoopHref,
    todayHref: slice.todayHref,
    integrityValidateCommand: slice.integrityValidateCommand,
    governanceBundlesCertCommand: slice.governanceBundlesCertCommand,
    commercialPilotRunbookCertCommand: slice.commercialPilotRunbookCertCommand,
  };
}

export function launchWizardEra25ConvergenceGovernanceTerminusFreezeHref(): string {
  return `/dashboard/launch-wizard${LAUNCH_WIZARD_ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_ANCHOR}`;
}
