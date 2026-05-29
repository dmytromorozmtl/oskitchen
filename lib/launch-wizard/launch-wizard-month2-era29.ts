/**
 * Launch Wizard — Month 2 market readiness integrity convergence.
 */
import type { Month2MarketReadinessUiSlice } from "@/lib/commercial/month2-market-readiness-ui-era21";
import { LAUNCH_WIZARD_COMMERCIAL_BLOCKERS_ANCHOR } from "@/lib/launch-wizard/launch-wizard-commercial-setup-era19-policy";

export const LAUNCH_WIZARD_MONTH2_ERA29_POLICY_ID = "era29-launch-wizard-month2-v1" as const;

export const LAUNCH_WIZARD_MONTH2_ANCHOR = "#launch-wizard-month2" as const;

export type LaunchWizardMonth2Slice = {
  policyId: typeof LAUNCH_WIZARD_MONTH2_ERA29_POLICY_ID;
  visible: boolean;
  goDecision: string;
  customerName: string | null;
  month2IntegrityFailed: boolean;
  week1IntegrityFailed: boolean;
  progressLabel: string;
  launchWizardHref: string;
  todayHref: string;
  integrityValidateCommand: string;
  postWeek1OrchestratorCommand: string;
};

export function buildLaunchWizardMonth2Slice(
  month2: Month2MarketReadinessUiSlice | null,
): LaunchWizardMonth2Slice | null {
  if (!month2) return null;

  return {
    policyId: LAUNCH_WIZARD_MONTH2_ERA29_POLICY_ID,
    visible: true,
    goDecision: month2.goDecision,
    customerName: month2.customerName,
    month2IntegrityFailed: !month2.month2IntegrityPassed,
    week1IntegrityFailed: !month2.week1IntegrityPassed,
    progressLabel: `${month2.completedBlockingPhaseCount}/${month2.blockingPhaseCount} workstreams`,
    launchWizardHref: month2.launchWizardHref,
    todayHref: month2.todayHref,
    integrityValidateCommand: month2.integrityValidateCommand,
    postWeek1OrchestratorCommand: month2.postWeek1OrchestratorCommand,
  };
}

export function launchWizardMonth2Href(): string {
  return `/dashboard/launch-wizard${LAUNCH_WIZARD_MONTH2_ANCHOR}`;
}
