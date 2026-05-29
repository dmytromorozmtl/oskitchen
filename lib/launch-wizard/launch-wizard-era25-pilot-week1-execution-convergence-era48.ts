/**
 * Launch Wizard — era25 pilot week 1 execution convergence integrity convergence.
 */
import type { PilotWeek1ExecutionConvergenceEra25UiSlice } from "@/lib/commercial/pilot-week1-execution-convergence-ui-era25";

export const LAUNCH_WIZARD_ERA25_PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA48_POLICY_ID =
  "era48-launch-wizard-era25-pilot-week1-execution-convergence-v1" as const;

export const LAUNCH_WIZARD_ERA25_PILOT_WEEK1_EXECUTION_CONVERGENCE_ANCHOR =
  "#launch-wizard-era25-pilot-week1-execution-convergence" as const;

export type LaunchWizardEra25PilotWeek1ExecutionConvergenceSlice = {
  policyId: typeof LAUNCH_WIZARD_ERA25_PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA48_POLICY_ID;
  visible: boolean;
  goDecision: string;
  customerName: string | null;
  pilotWeek1ExecutionConvergenceIntegrityFailed: boolean;
  paidPilotGoConvergenceIntegrityFailed: boolean;
  convergenceBlocked: boolean;
  completedPhaseCount: number;
  totalPhaseCount: number;
  progressLabel: string;
  launchWizardHref: string;
  platformOpsHref: string;
  integrationHealthHref: string;
  integrityValidateCommand: string;
  postGoConvergenceOrchestratorCommand: string;
};

export function buildLaunchWizardEra25PilotWeek1ExecutionConvergenceSlice(
  slice: PilotWeek1ExecutionConvergenceEra25UiSlice | null,
  customerName?: string | null,
): LaunchWizardEra25PilotWeek1ExecutionConvergenceSlice | null {
  if (!slice) return null;

  const attentionNeeded =
    slice.pilotWeek1ExecutionConvergenceEra25Milestone !==
      "pilot_week1_execution_convergence_era25_ready" || slice.convergenceBlocked;

  return {
    policyId: LAUNCH_WIZARD_ERA25_PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA48_POLICY_ID,
    visible: true,
    goDecision: slice.goDecision ?? "NO-GO",
    customerName: customerName ?? null,
    pilotWeek1ExecutionConvergenceIntegrityFailed: !slice.pilotWeek1ExecutionConvergenceIntegrityPassed,
    paidPilotGoConvergenceIntegrityFailed: !slice.paidPilotGoConvergenceIntegrityPassed,
    convergenceBlocked: slice.convergenceBlocked,
    completedPhaseCount: slice.completedPhaseCount,
    totalPhaseCount: slice.totalPhaseCount,
    progressLabel: attentionNeeded
      ? `${slice.pilotWeek1ExecutionConvergenceEra25Milestone.replaceAll("_", " ")} · ${slice.completedPhaseCount}/${slice.totalPhaseCount} days`
      : `Week 1 ready · ${slice.completedPhaseCount}/${slice.totalPhaseCount} days · GO ${slice.goDecision ?? "GO"}`,
    launchWizardHref: slice.launchWizardHref,
    platformOpsHref: slice.platformOpsHref,
    integrationHealthHref: slice.integrationHealthHref,
    integrityValidateCommand: slice.integrityValidateCommand,
    postGoConvergenceOrchestratorCommand: slice.postGoConvergenceOrchestratorCommand,
  };
}

export function launchWizardEra25PilotWeek1ExecutionConvergenceHref(): string {
  return `/dashboard/launch-wizard${LAUNCH_WIZARD_ERA25_PILOT_WEEK1_EXECUTION_CONVERGENCE_ANCHOR}`;
}
