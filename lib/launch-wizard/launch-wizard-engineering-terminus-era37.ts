/**
 * Launch Wizard — Engineering path terminus integrity convergence.
 */
import type { EngineeringPathTerminusUiSlice } from "@/lib/commercial/engineering-path-terminus-ui-era24";

export const LAUNCH_WIZARD_ENGINEERING_TERMINUS_ERA37_POLICY_ID =
  "era37-launch-wizard-engineering-terminus-v1" as const;

export const LAUNCH_WIZARD_ENGINEERING_TERMINUS_ANCHOR = "#launch-wizard-engineering-terminus" as const;

export type LaunchWizardEngineeringTerminusSlice = {
  policyId: typeof LAUNCH_WIZARD_ENGINEERING_TERMINUS_ERA37_POLICY_ID;
  visible: boolean;
  goDecision: string;
  customerName: string | null;
  engineeringTerminusIntegrityFailed: boolean;
  maintenanceModeIntegrityFailed: boolean;
  progressLabel: string;
  launchWizardHref: string;
  todayHref: string;
  platformOpsHref: string;
  integrityValidateCommand: string;
  postMaintenanceModeOrchestratorCommand: string;
};

export function buildLaunchWizardEngineeringTerminusSlice(
  engineeringTerminus: EngineeringPathTerminusUiSlice | null,
  customerName?: string | null,
): LaunchWizardEngineeringTerminusSlice | null {
  if (!engineeringTerminus) return null;

  const attentionCount =
    (engineeringTerminus.firstBlockedGateStep ? 1 : 0) +
    (engineeringTerminus.firstBlockedStep &&
    engineeringTerminus.firstBlockedStep.id !== engineeringTerminus.firstBlockedGateStep?.id
      ? 1
      : 0);

  return {
    policyId: LAUNCH_WIZARD_ENGINEERING_TERMINUS_ERA37_POLICY_ID,
    visible: true,
    goDecision: engineeringTerminus.goDecision ?? "GO",
    customerName: customerName ?? null,
    engineeringTerminusIntegrityFailed: !engineeringTerminus.engineeringPathTerminusIntegrityPassed,
    maintenanceModeIntegrityFailed: !engineeringTerminus.maintenanceModeIntegrityPassed,
    progressLabel:
      attentionCount > 0
        ? `${engineeringTerminus.completedSteps}/${engineeringTerminus.totalSteps} steps · attention needed`
        : `${engineeringTerminus.completedSteps}/${engineeringTerminus.totalSteps} steps`,
    launchWizardHref: engineeringTerminus.launchWizardHref,
    todayHref: engineeringTerminus.todayHref,
    platformOpsHref: engineeringTerminus.platformOpsHref,
    integrityValidateCommand: engineeringTerminus.integrityValidateCommand,
    postMaintenanceModeOrchestratorCommand: engineeringTerminus.postMaintenanceModeOrchestratorCommand,
  };
}

export function launchWizardEngineeringTerminusHref(): string {
  return `/dashboard/launch-wizard${LAUNCH_WIZARD_ENGINEERING_TERMINUS_ANCHOR}`;
}
