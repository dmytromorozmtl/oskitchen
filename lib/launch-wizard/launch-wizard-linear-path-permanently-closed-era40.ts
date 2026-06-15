/**
 * Launch Wizard — Linear path permanently closed integrity convergence.
 */
import type { LinearPathPermanentlyClosedUiSlice } from "@/lib/commercial/linear-path-permanently-closed-ui-era24";

export const LAUNCH_WIZARD_LINEAR_PATH_PERMANENTLY_CLOSED_ERA40_POLICY_ID =
  "era40-launch-wizard-linear-path-permanently-closed-v1" as const;

export const LAUNCH_WIZARD_LINEAR_PATH_PERMANENTLY_CLOSED_ANCHOR =
  "#launch-wizard-linear-path-permanently-closed" as const;

export type LaunchWizardLinearPathPermanentlyClosedSlice = {
  policyId: typeof LAUNCH_WIZARD_LINEAR_PATH_PERMANENTLY_CLOSED_ERA40_POLICY_ID;
  visible: boolean;
  goDecision: string;
  customerName: string | null;
  linearPathPermanentlyClosedIntegrityFailed: boolean;
  commercialPilotPathAbsoluteEndIntegrityFailed: boolean;
  progressLabel: string;
  launchWizardHref: string;
  todayHref: string;
  platformOpsHref: string;
  integrityValidateCommand: string;
  postAbsoluteEndOrchestratorCommand: string;
};

export function buildLaunchWizardLinearPathPermanentlyClosedSlice(
  linearPath: LinearPathPermanentlyClosedUiSlice | null,
  customerName?: string | null,
): LaunchWizardLinearPathPermanentlyClosedSlice | null {
  if (!linearPath) return null;

  const attentionNeeded =
    linearPath.linearPathPermanentlyClosedMilestone !== "linear_path_permanently_closed_healthy";

  return {
    policyId: LAUNCH_WIZARD_LINEAR_PATH_PERMANENTLY_CLOSED_ERA40_POLICY_ID,
    visible: true,
    goDecision: linearPath.goDecision ?? "GO",
    customerName: customerName ?? null,
    linearPathPermanentlyClosedIntegrityFailed: !linearPath.linearPathPermanentlyClosedIntegrityPassed,
    commercialPilotPathAbsoluteEndIntegrityFailed:
      !linearPath.commercialPilotPathAbsoluteEndIntegrityPassed,
    progressLabel: attentionNeeded
      ? `${linearPath.docChainSteps}-step doc chain · attention needed`
      : `${linearPath.docChainSteps}-step doc chain · Step 17+ forbidden`,
    launchWizardHref: linearPath.launchWizardHref,
    todayHref: linearPath.todayHref,
    platformOpsHref: linearPath.platformOpsHref,
    integrityValidateCommand: linearPath.integrityValidateCommand,
    postAbsoluteEndOrchestratorCommand: linearPath.postAbsoluteEndOrchestratorCommand,
  };
}

export function launchWizardLinearPathPermanentlyClosedHref(): string {
  return `/dashboard/launch-wizard${LAUNCH_WIZARD_LINEAR_PATH_PERMANENTLY_CLOSED_ANCHOR}`;
}
