/**
 * Launch Wizard — Post-terminus steady state integrity convergence.
 */
import type { PostTerminusSteadyStateUiSlice } from "@/lib/commercial/post-terminus-steady-state-ui-era24";

export const LAUNCH_WIZARD_POST_TERMINUS_STEADY_STATE_ERA38_POLICY_ID =
  "era38-launch-wizard-post-terminus-steady-state-v1" as const;

export const LAUNCH_WIZARD_POST_TERMINUS_STEADY_STATE_ANCHOR =
  "#launch-wizard-post-terminus-steady-state" as const;

export type LaunchWizardPostTerminusSteadyStateSlice = {
  policyId: typeof LAUNCH_WIZARD_POST_TERMINUS_STEADY_STATE_ERA38_POLICY_ID;
  visible: boolean;
  goDecision: string;
  customerName: string | null;
  postTerminusSteadyStateIntegrityFailed: boolean;
  engineeringPathTerminusIntegrityFailed: boolean;
  progressLabel: string;
  launchWizardHref: string;
  todayHref: string;
  platformOpsHref: string;
  integrityValidateCommand: string;
  postEngineeringTerminusOrchestratorCommand: string;
};

export function buildLaunchWizardPostTerminusSteadyStateSlice(
  steadyState: PostTerminusSteadyStateUiSlice | null,
  customerName?: string | null,
): LaunchWizardPostTerminusSteadyStateSlice | null {
  if (!steadyState) return null;

  const attentionCount = steadyState.overdueCount;

  return {
    policyId: LAUNCH_WIZARD_POST_TERMINUS_STEADY_STATE_ERA38_POLICY_ID,
    visible: true,
    goDecision: steadyState.goDecision ?? "GO",
    customerName: customerName ?? null,
    postTerminusSteadyStateIntegrityFailed: !steadyState.postTerminusSteadyStateIntegrityPassed,
    engineeringPathTerminusIntegrityFailed: !steadyState.engineeringPathTerminusIntegrityPassed,
    progressLabel:
      attentionCount > 0
        ? `${steadyState.healthyCount}/${steadyState.tracks.length} tracks · ${attentionCount} overdue`
        : `${steadyState.healthyCount}/${steadyState.tracks.length} tracks`,
    launchWizardHref: steadyState.launchWizardHref,
    todayHref: steadyState.todayHref,
    platformOpsHref: steadyState.platformOpsHref,
    integrityValidateCommand: steadyState.integrityValidateCommand,
    postEngineeringTerminusOrchestratorCommand: steadyState.postEngineeringTerminusOrchestratorCommand,
  };
}

export function launchWizardPostTerminusSteadyStateHref(): string {
  return `/dashboard/launch-wizard${LAUNCH_WIZARD_POST_TERMINUS_STEADY_STATE_ANCHOR}`;
}
