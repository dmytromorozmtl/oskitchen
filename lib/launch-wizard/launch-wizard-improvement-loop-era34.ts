/**
 * Launch Wizard — Continuous improvement loop integrity convergence.
 */
import type { ContinuousImprovementLoopUiSlice } from "@/lib/commercial/continuous-improvement-loop-ui-era22";

export const LAUNCH_WIZARD_IMPROVEMENT_LOOP_ERA34_POLICY_ID =
  "era34-launch-wizard-improvement-loop-v1" as const;

export const LAUNCH_WIZARD_IMPROVEMENT_LOOP_ANCHOR = "#launch-wizard-improvement-loop" as const;

export type LaunchWizardImprovementLoopSlice = {
  policyId: typeof LAUNCH_WIZARD_IMPROVEMENT_LOOP_ERA34_POLICY_ID;
  visible: boolean;
  goDecision: string;
  customerName: string | null;
  improvementLoopIntegrityFailed: boolean;
  sustainedOpsIntegrityFailed: boolean;
  progressLabel: string;
  launchWizardHref: string;
  todayHref: string;
  platformOpsHref: string;
  integrityValidateCommand: string;
  postSustainedOpsOrchestratorCommand: string;
};

export function buildLaunchWizardImprovementLoopSlice(
  improvementLoop: ContinuousImprovementLoopUiSlice | null,
): LaunchWizardImprovementLoopSlice | null {
  if (!improvementLoop) return null;

  const trackCount = improvementLoop.tracks.length;
  const attentionCount = improvementLoop.overdueCount + improvementLoop.dueSoonCount;

  return {
    policyId: LAUNCH_WIZARD_IMPROVEMENT_LOOP_ERA34_POLICY_ID,
    visible: true,
    goDecision: improvementLoop.goDecision,
    customerName: improvementLoop.customerName,
    improvementLoopIntegrityFailed: !improvementLoop.improvementLoopIntegrityPassed,
    sustainedOpsIntegrityFailed: !improvementLoop.sustainedOpsIntegrityPassed,
    progressLabel:
      attentionCount > 0
        ? `${attentionCount}/${trackCount} tracks need attention`
        : `${improvementLoop.healthyCount}/${trackCount} healthy`,
    launchWizardHref: improvementLoop.launchWizardHref,
    todayHref: improvementLoop.todayHref,
    platformOpsHref: improvementLoop.platformOpsHref,
    integrityValidateCommand: improvementLoop.integrityValidateCommand,
    postSustainedOpsOrchestratorCommand: improvementLoop.postSustainedOpsOrchestratorCommand,
  };
}

export function launchWizardImprovementLoopHref(): string {
  return `/dashboard/launch-wizard${LAUNCH_WIZARD_IMPROVEMENT_LOOP_ANCHOR}`;
}
