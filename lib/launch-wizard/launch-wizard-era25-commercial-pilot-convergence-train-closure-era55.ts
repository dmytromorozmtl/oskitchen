/**
 * Launch Wizard — era25 commercial pilot convergence train closure integrity.
 */
import type { Era25CommercialPilotConvergenceTrainClosureEra25UiSlice } from "@/lib/commercial/era25-commercial-pilot-convergence-train-closure-ui-era25";

export const LAUNCH_WIZARD_ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_ERA55_POLICY_ID =
  "era55-launch-wizard-era25-commercial-pilot-convergence-train-closure-v1" as const;

export const LAUNCH_WIZARD_ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_ANCHOR =
  "#launch-wizard-era25-commercial-pilot-convergence-train-closure" as const;

export type LaunchWizardEra25CommercialPilotConvergenceTrainClosureSlice = {
  policyId: typeof LAUNCH_WIZARD_ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_ERA55_POLICY_ID;
  visible: boolean;
  goDecision: string;
  customerName: string | null;
  era25CommercialPilotConvergenceTrainClosureIntegrityFailed: boolean;
  pureOperationalModeTerminusConvergenceIntegrityFailed: boolean;
  trainClosureBlocked: boolean;
  convergenceIntegrityBaselinesHonestCount: number;
  convergenceIntegrityBaselinesTotalCount: number;
  progressLabel: string;
  launchWizardHref: string;
  platformOpsHref: string;
  todayHref: string;
  integrityValidateCommand: string;
  commercialPilotRunbookCertCommand: string;
};

export function buildLaunchWizardEra25CommercialPilotConvergenceTrainClosureSlice(
  slice: Era25CommercialPilotConvergenceTrainClosureEra25UiSlice | null,
  customerName?: string | null,
): LaunchWizardEra25CommercialPilotConvergenceTrainClosureSlice | null {
  if (!slice) return null;

  const attentionNeeded = slice.trainClosureBlocked;

  return {
    policyId: LAUNCH_WIZARD_ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_ERA55_POLICY_ID,
    visible: true,
    goDecision: slice.goDecision ?? "NO-GO",
    customerName: customerName ?? null,
    era25CommercialPilotConvergenceTrainClosureIntegrityFailed:
      !slice.era25CommercialPilotConvergenceTrainClosureIntegrityPassed,
    pureOperationalModeTerminusConvergenceIntegrityFailed:
      !slice.pureOperationalModeTerminusConvergenceIntegrityPassed,
    trainClosureBlocked: slice.trainClosureBlocked,
    convergenceIntegrityBaselinesHonestCount: slice.convergenceIntegrityBaselinesHonestCount,
    convergenceIntegrityBaselinesTotalCount: slice.convergenceIntegrityBaselinesTotalCount,
    progressLabel: attentionNeeded
      ? `${slice.convergenceIntegrityBaselinesHonestCount}/${slice.convergenceIntegrityBaselinesTotalCount} baselines honest · pure ops ${slice.pureOperationalModeEra25Active ? "active" : "pending"}`
      : `Train closed · ${slice.convergenceIntegrityBaselinesHonestCount}/${slice.convergenceIntegrityBaselinesTotalCount} baselines · GO ${slice.goDecision ?? "GO"}`,
    launchWizardHref: slice.launchWizardHref,
    platformOpsHref: slice.platformOpsHref,
    todayHref: slice.todayHref,
    integrityValidateCommand: slice.integrityValidateCommand,
    commercialPilotRunbookCertCommand: slice.commercialPilotRunbookCertCommand,
  };
}

export function launchWizardEra25CommercialPilotConvergenceTrainClosureHref(): string {
  return `/dashboard/launch-wizard${LAUNCH_WIZARD_ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_ANCHOR}`;
}
