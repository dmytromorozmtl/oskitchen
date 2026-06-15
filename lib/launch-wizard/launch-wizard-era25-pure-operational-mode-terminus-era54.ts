/**
 * Launch Wizard — era25 pure operational mode terminus convergence integrity.
 */
import type { PureOperationalModeTerminusEra25UiSlice } from "@/lib/commercial/pure-operational-mode-terminus-ui-era25";

export const LAUNCH_WIZARD_ERA25_PURE_OPERATIONAL_MODE_TERMINUS_ERA54_POLICY_ID =
  "era54-launch-wizard-era25-pure-operational-mode-terminus-v1" as const;

export const LAUNCH_WIZARD_ERA25_PURE_OPERATIONAL_MODE_TERMINUS_ANCHOR =
  "#launch-wizard-era25-pure-operational-mode-terminus" as const;

export type LaunchWizardEra25PureOperationalModeTerminusSlice = {
  policyId: typeof LAUNCH_WIZARD_ERA25_PURE_OPERATIONAL_MODE_TERMINUS_ERA54_POLICY_ID;
  visible: boolean;
  goDecision: string;
  customerName: string | null;
  pureOperationalModeTerminusConvergenceIntegrityFailed: boolean;
  sustainedOperationalExcellenceConvergenceIntegrityFailed: boolean;
  terminusBlocked: boolean;
  healthyCount: number;
  trackCount: number;
  progressLabel: string;
  launchWizardHref: string;
  platformOpsHref: string;
  todayHref: string;
  improvementLoopHref: string;
  integrityValidateCommand: string;
  postSustainedOpsConvergenceOrchestratorCommand: string;
};

export function buildLaunchWizardEra25PureOperationalModeTerminusSlice(
  slice: PureOperationalModeTerminusEra25UiSlice | null,
  customerName?: string | null,
): LaunchWizardEra25PureOperationalModeTerminusSlice | null {
  if (!slice) return null;

  const attentionNeeded =
    slice.pureOperationalModeTerminusEra25Milestone !== "pure_operational_mode_era25_active" ||
    slice.terminusBlocked;

  return {
    policyId: LAUNCH_WIZARD_ERA25_PURE_OPERATIONAL_MODE_TERMINUS_ERA54_POLICY_ID,
    visible: true,
    goDecision: slice.goDecision ?? "NO-GO",
    customerName: customerName ?? null,
    pureOperationalModeTerminusConvergenceIntegrityFailed:
      !slice.pureOperationalModeTerminusConvergenceIntegrityPassed,
    sustainedOperationalExcellenceConvergenceIntegrityFailed:
      !slice.sustainedOperationalExcellenceConvergenceIntegrityPassed,
    terminusBlocked: slice.terminusBlocked,
    healthyCount: slice.healthyCount,
    trackCount: slice.tracks.length,
    progressLabel: attentionNeeded
      ? `${slice.pureOperationalModeTerminusEra25Milestone.replaceAll("_", " ")} · ${slice.healthyCount}/${slice.tracks.length} tracks`
      : `Pure ops active · ${slice.healthyCount}/${slice.tracks.length} tracks fresh · GO ${slice.goDecision ?? "GO"}`,
    launchWizardHref: slice.launchWizardHref,
    platformOpsHref: slice.platformOpsHref,
    todayHref: slice.todayHref,
    improvementLoopHref: slice.improvementLoopHref,
    integrityValidateCommand: slice.integrityValidateCommand,
    postSustainedOpsConvergenceOrchestratorCommand: slice.postSustainedOpsConvergenceOrchestratorCommand,
  };
}

export function launchWizardEra25PureOperationalModeTerminusHref(): string {
  return `/dashboard/launch-wizard${LAUNCH_WIZARD_ERA25_PURE_OPERATIONAL_MODE_TERMINUS_ANCHOR}`;
}
