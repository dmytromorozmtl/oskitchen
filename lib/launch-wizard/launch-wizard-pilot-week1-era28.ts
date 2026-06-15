/**
 * Launch Wizard — Pilot Week 1 execution integrity convergence.
 */
import type { PilotWeek1ExecutionUiSlice } from "@/lib/commercial/pilot-week1-execution-ui-era21";
import { LAUNCH_WIZARD_COMMERCIAL_BLOCKERS_ANCHOR } from "@/lib/launch-wizard/launch-wizard-commercial-setup-era19-policy";

export const LAUNCH_WIZARD_PILOT_WEEK1_ERA28_POLICY_ID =
  "era28-launch-wizard-pilot-week1-v1" as const;

export const LAUNCH_WIZARD_PILOT_WEEK1_ANCHOR = "#launch-wizard-pilot-week1" as const;

export type LaunchWizardPilotWeek1Slice = {
  policyId: typeof LAUNCH_WIZARD_PILOT_WEEK1_ERA28_POLICY_ID;
  visible: boolean;
  goDecision: string;
  customerName: string | null;
  week1IntegrityFailed: boolean;
  progressLabel: string;
  launchWizardHref: string;
  todayHref: string;
  integrityValidateCommand: string;
  postGoOrchestratorCommand: string;
};

export function buildLaunchWizardPilotWeek1Slice(
  week1: PilotWeek1ExecutionUiSlice | null,
): LaunchWizardPilotWeek1Slice | null {
  if (!week1) return null;

  return {
    policyId: LAUNCH_WIZARD_PILOT_WEEK1_ERA28_POLICY_ID,
    visible: true,
    goDecision: week1.goDecision,
    customerName: week1.customerName,
    week1IntegrityFailed: !week1.week1IntegrityPassed || week1.goIntegrityFailed,
    progressLabel: `${week1.completedPhaseCount}/${week1.phases.length} days`,
    launchWizardHref: week1.launchWizardHref,
    todayHref: week1.todayHref,
    integrityValidateCommand: week1.integrityValidateCommand,
    postGoOrchestratorCommand: week1.postGoOrchestratorCommand,
  };
}

export function launchWizardPilotWeek1Href(): string {
  return `/dashboard/launch-wizard${LAUNCH_WIZARD_PILOT_WEEK1_ANCHOR}`;
}
