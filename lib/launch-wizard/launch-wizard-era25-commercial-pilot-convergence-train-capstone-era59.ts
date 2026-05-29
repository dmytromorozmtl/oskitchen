/**
 * Launch Wizard — era25 commercial pilot convergence train capstone integrity.
 */
import type { Era25CommercialPilotConvergenceTrainCapstoneEra25UiSlice } from "@/lib/commercial/era25-commercial-pilot-convergence-train-capstone-ui-era25";

export const LAUNCH_WIZARD_ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_ERA59_POLICY_ID =
  "era59-launch-wizard-era25-commercial-pilot-convergence-train-capstone-v1" as const;

export const LAUNCH_WIZARD_ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_ANCHOR =
  "#launch-wizard-era25-commercial-pilot-convergence-train-capstone" as const;

export type LaunchWizardEra25CommercialPilotConvergenceTrainCapstoneSlice = {
  policyId: typeof LAUNCH_WIZARD_ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_ERA59_POLICY_ID;
  visible: boolean;
  goDecision: string;
  customerName: string | null;
  era25CommercialPilotConvergenceTrainCapstoneIntegrityFailed: boolean;
  era25SteadyStateOperatorLoopLockIntegrityFailed: boolean;
  trainCapstoneBlocked: boolean;
  frozenEnvMutationDetected: boolean;
  p0ProofStatus: string | null;
  p0ArtifactPresent: boolean;
  progressLabel: string;
  launchWizardHref: string;
  platformOpsHref: string;
  p0OpsVaultHref: string;
  todayHref: string;
  integrityValidateCommand: string;
  governanceBundlesCertCommand: string;
  commercialPilotRunbookCertCommand: string;
};

export function buildLaunchWizardEra25CommercialPilotConvergenceTrainCapstoneSlice(
  slice: Era25CommercialPilotConvergenceTrainCapstoneEra25UiSlice | null,
  customerName?: string | null,
): LaunchWizardEra25CommercialPilotConvergenceTrainCapstoneSlice | null {
  if (!slice) return null;

  const attentionNeeded = slice.trainCapstoneBlocked;

  return {
    policyId: LAUNCH_WIZARD_ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_ERA59_POLICY_ID,
    visible: true,
    goDecision: slice.goDecision ?? "NO-GO",
    customerName: customerName ?? null,
    era25CommercialPilotConvergenceTrainCapstoneIntegrityFailed:
      !slice.era25CommercialPilotConvergenceTrainCapstoneIntegrityPassed,
    era25SteadyStateOperatorLoopLockIntegrityFailed:
      !slice.era25SteadyStateOperatorLoopLockIntegrityPassed,
    trainCapstoneBlocked: slice.trainCapstoneBlocked,
    frozenEnvMutationDetected: slice.frozenEnvMutationDetected,
    p0ProofStatus: slice.p0ProofStatus,
    p0ArtifactPresent: slice.p0ArtifactPresent,
    progressLabel: attentionNeeded
      ? slice.frozenEnvMutationDetected
        ? "Frozen env mutation · clear era25 attest keys"
        : slice.p0ProofReferencedInCapstone && slice.p0ProofStatus !== "proof_passed"
          ? "P0 referenced · artifact not proof_passed"
          : `Train capstone pending · steady-state ${slice.steadyStateLockComplete ? "locked" : "open"}`
      : `Train capstone closed · P0 ${slice.p0ProofStatus ?? "honest"}`,
    launchWizardHref: slice.launchWizardHref,
    platformOpsHref: slice.platformOpsHref,
    p0OpsVaultHref: slice.p0OpsVaultHref,
    todayHref: slice.todayHref,
    integrityValidateCommand: slice.integrityValidateCommand,
    governanceBundlesCertCommand: slice.governanceBundlesCertCommand,
    commercialPilotRunbookCertCommand: slice.commercialPilotRunbookCertCommand,
  };
}

export function launchWizardEra25CommercialPilotConvergenceTrainCapstoneHref(): string {
  return `/dashboard/launch-wizard${LAUNCH_WIZARD_ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_ANCHOR}`;
}
