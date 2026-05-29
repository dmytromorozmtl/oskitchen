/**
 * Launch Wizard — Commercial pilot path absolute end integrity convergence.
 */
import type { CommercialPilotPathAbsoluteEndUiSlice } from "@/lib/commercial/commercial-pilot-path-absolute-end-ui-era24";

export const LAUNCH_WIZARD_COMMERCIAL_PILOT_PATH_ABSOLUTE_END_ERA39_POLICY_ID =
  "era39-launch-wizard-commercial-pilot-path-absolute-end-v1" as const;

export const LAUNCH_WIZARD_COMMERCIAL_PILOT_PATH_ABSOLUTE_END_ANCHOR =
  "#launch-wizard-commercial-pilot-path-absolute-end" as const;

export type LaunchWizardCommercialPilotPathAbsoluteEndSlice = {
  policyId: typeof LAUNCH_WIZARD_COMMERCIAL_PILOT_PATH_ABSOLUTE_END_ERA39_POLICY_ID;
  visible: boolean;
  goDecision: string;
  customerName: string | null;
  commercialPilotPathAbsoluteEndIntegrityFailed: boolean;
  postTerminusSteadyStateIntegrityFailed: boolean;
  progressLabel: string;
  launchWizardHref: string;
  todayHref: string;
  platformOpsHref: string;
  integrityValidateCommand: string;
  postSteadyStateOrchestratorCommand: string;
};

export function buildLaunchWizardCommercialPilotPathAbsoluteEndSlice(
  absoluteEnd: CommercialPilotPathAbsoluteEndUiSlice | null,
  customerName?: string | null,
): LaunchWizardCommercialPilotPathAbsoluteEndSlice | null {
  if (!absoluteEnd) return null;

  const attentionNeeded = absoluteEnd.absoluteEndMilestone !== "absolute_end_healthy";

  return {
    policyId: LAUNCH_WIZARD_COMMERCIAL_PILOT_PATH_ABSOLUTE_END_ERA39_POLICY_ID,
    visible: true,
    goDecision: absoluteEnd.goDecision ?? "GO",
    customerName: customerName ?? null,
    commercialPilotPathAbsoluteEndIntegrityFailed:
      !absoluteEnd.commercialPilotPathAbsoluteEndIntegrityPassed,
    postTerminusSteadyStateIntegrityFailed: !absoluteEnd.postTerminusSteadyStateIntegrityPassed,
    progressLabel: attentionNeeded
      ? `${absoluteEnd.completedSteps}/${absoluteEnd.totalSteps} steps · attention needed`
      : `${absoluteEnd.completedSteps}/${absoluteEnd.totalSteps} steps`,
    launchWizardHref: absoluteEnd.launchWizardHref,
    todayHref: absoluteEnd.todayHref,
    platformOpsHref: absoluteEnd.platformOpsHref,
    integrityValidateCommand: absoluteEnd.integrityValidateCommand,
    postSteadyStateOrchestratorCommand: absoluteEnd.postSteadyStateOrchestratorCommand,
  };
}

export function launchWizardCommercialPilotPathAbsoluteEndHref(): string {
  return `/dashboard/launch-wizard${LAUNCH_WIZARD_COMMERCIAL_PILOT_PATH_ABSOLUTE_END_ANCHOR}`;
}
