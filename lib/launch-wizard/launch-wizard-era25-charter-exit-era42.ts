/**
 * Launch Wizard — era25 charter exit outside linear path integrity convergence.
 */
import type { Era25CharterExitUiSlice } from "@/lib/commercial/era25-charter-exit-ui-era24";

export const LAUNCH_WIZARD_ERA25_CHARTER_EXIT_ERA42_POLICY_ID =
  "era42-launch-wizard-era25-charter-exit-v1" as const;

export const LAUNCH_WIZARD_ERA25_CHARTER_EXIT_ANCHOR = "#launch-wizard-era25-charter-exit" as const;

export type LaunchWizardEra25CharterExitSlice = {
  policyId: typeof LAUNCH_WIZARD_ERA25_CHARTER_EXIT_ERA42_POLICY_ID;
  visible: boolean;
  goDecision: string;
  customerName: string | null;
  era25CharterExitIntegrityFailed: boolean;
  linearChainTerminusGuardIntegrityFailed: boolean;
  progressLabel: string;
  launchWizardHref: string;
  todayHref: string;
  platformOpsHref: string;
  integrityValidateCommand: string;
  postTerminusGuardOrchestratorCommand: string;
};

export function buildLaunchWizardEra25CharterExitSlice(
  charterExit: Era25CharterExitUiSlice | null,
  customerName?: string | null,
): LaunchWizardEra25CharterExitSlice | null {
  if (!charterExit) return null;

  const attentionNeeded = charterExit.era25CharterExitMilestone !== "era25_charter_exit_healthy";

  return {
    policyId: LAUNCH_WIZARD_ERA25_CHARTER_EXIT_ERA42_POLICY_ID,
    visible: true,
    goDecision: charterExit.goDecision ?? "GO",
    customerName: customerName ?? null,
    era25CharterExitIntegrityFailed: !charterExit.era25CharterExitIntegrityPassed,
    linearChainTerminusGuardIntegrityFailed: !charterExit.linearChainTerminusGuardIntegrityPassed,
    progressLabel: attentionNeeded
      ? `outside linear · ${charterExit.era25CharterDocCount} docs · attention needed`
      : `outside linear · ${charterExit.era25CharterDocCount} charter docs · healthy`,
    launchWizardHref: charterExit.launchWizardHref,
    todayHref: charterExit.todayHref,
    platformOpsHref: charterExit.platformOpsHref,
    integrityValidateCommand: charterExit.integrityValidateCommand,
    postTerminusGuardOrchestratorCommand: charterExit.postTerminusGuardOrchestratorCommand,
  };
}

export function launchWizardEra25CharterExitHref(): string {
  return `/dashboard/launch-wizard${LAUNCH_WIZARD_ERA25_CHARTER_EXIT_ANCHOR}`;
}
