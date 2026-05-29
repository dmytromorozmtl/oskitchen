/**
 * Launch Wizard — Scale readiness integrity convergence.
 */
import type { ScaleReadinessUiSlice } from "@/lib/commercial/scale-readiness-ui-era21";
import { LAUNCH_WIZARD_COMMERCIAL_BLOCKERS_ANCHOR } from "@/lib/launch-wizard/launch-wizard-commercial-setup-era19-policy";

export const LAUNCH_WIZARD_SCALE_ERA30_POLICY_ID = "era30-launch-wizard-scale-v1" as const;

export const LAUNCH_WIZARD_SCALE_ANCHOR = "#launch-wizard-scale" as const;

export type LaunchWizardScaleSlice = {
  policyId: typeof LAUNCH_WIZARD_SCALE_ERA30_POLICY_ID;
  visible: boolean;
  goDecision: string;
  customerName: string | null;
  scaleIntegrityFailed: boolean;
  month2IntegrityFailed: boolean;
  progressLabel: string;
  launchWizardHref: string;
  todayHref: string;
  platformOpsHref: string;
  integrityValidateCommand: string;
  postMonth2OrchestratorCommand: string;
};

export function buildLaunchWizardScaleSlice(
  scale: ScaleReadinessUiSlice | null,
): LaunchWizardScaleSlice | null {
  if (!scale) return null;

  return {
    policyId: LAUNCH_WIZARD_SCALE_ERA30_POLICY_ID,
    visible: true,
    goDecision: scale.goDecision,
    customerName: scale.customerName,
    scaleIntegrityFailed: !scale.scaleIntegrityPassed,
    month2IntegrityFailed: !scale.month2IntegrityPassed,
    progressLabel: `${scale.completedBlockingPhaseCount}/${scale.blockingPhaseCount} gates`,
    launchWizardHref: scale.launchWizardHref,
    todayHref: scale.todayHref,
    platformOpsHref: scale.platformOpsHref,
    integrityValidateCommand: scale.integrityValidateCommand,
    postMonth2OrchestratorCommand: scale.postMonth2OrchestratorCommand,
  };
}

export function launchWizardScaleHref(): string {
  return `/dashboard/launch-wizard${LAUNCH_WIZARD_SCALE_ANCHOR}`;
}
