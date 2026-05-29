/**
 * Launch Wizard — era25 paid pilot GO convergence integrity convergence.
 */
import type { PaidPilotGoConvergenceEra25UiSlice } from "@/lib/commercial/paid-pilot-go-convergence-ui-era25";

export const LAUNCH_WIZARD_ERA25_PAID_PILOT_GO_CONVERGENCE_ERA47_POLICY_ID =
  "era47-launch-wizard-era25-paid-pilot-go-convergence-v1" as const;

export const LAUNCH_WIZARD_ERA25_PAID_PILOT_GO_CONVERGENCE_ANCHOR =
  "#launch-wizard-era25-paid-pilot-go-convergence" as const;

export type LaunchWizardEra25PaidPilotGoConvergenceSlice = {
  policyId: typeof LAUNCH_WIZARD_ERA25_PAID_PILOT_GO_CONVERGENCE_ERA47_POLICY_ID;
  visible: boolean;
  goDecision: string;
  customerName: string | null;
  paidPilotGoConvergenceIntegrityFailed: boolean;
  ownerDailyBriefingBreakthroughIntegrityFailed: boolean;
  convergenceBlocked: boolean;
  icpQualified: boolean;
  loiRecorded: boolean;
  progressLabel: string;
  launchWizardHref: string;
  platformOpsHref: string;
  integrityValidateCommand: string;
  postBreakthroughOrchestratorCommand: string;
};

export function buildLaunchWizardEra25PaidPilotGoConvergenceSlice(
  slice: PaidPilotGoConvergenceEra25UiSlice | null,
  customerName?: string | null,
): LaunchWizardEra25PaidPilotGoConvergenceSlice | null {
  if (!slice) return null;

  const attentionNeeded =
    slice.paidPilotGoConvergenceEra25Milestone !== "paid_pilot_go_convergence_era25_ready" ||
    slice.convergenceBlocked;

  return {
    policyId: LAUNCH_WIZARD_ERA25_PAID_PILOT_GO_CONVERGENCE_ERA47_POLICY_ID,
    visible: true,
    goDecision: slice.goDecision ?? "NO-GO",
    customerName: customerName ?? null,
    paidPilotGoConvergenceIntegrityFailed: !slice.paidPilotGoConvergenceIntegrityPassed,
    ownerDailyBriefingBreakthroughIntegrityFailed: !slice.ownerDailyBriefingBreakthroughIntegrityPassed,
    convergenceBlocked: slice.convergenceBlocked,
    icpQualified: slice.icpQualified,
    loiRecorded: slice.loiRecorded,
    progressLabel: attentionNeeded
      ? `${slice.paidPilotGoConvergenceEra25Milestone.replaceAll("_", " ")} · ${slice.goDecision ?? "NO ARTIFACT"}`
      : `GO convergence ready · ${slice.goDecision ?? "GO"} · ICP + LOI + kickoff`,
    launchWizardHref: slice.launchWizardHref,
    platformOpsHref: slice.platformOpsHref,
    integrityValidateCommand: slice.integrityValidateCommand,
    postBreakthroughOrchestratorCommand: slice.postBreakthroughOrchestratorCommand,
  };
}

export function launchWizardEra25PaidPilotGoConvergenceHref(): string {
  return `/dashboard/launch-wizard${LAUNCH_WIZARD_ERA25_PAID_PILOT_GO_CONVERGENCE_ANCHOR}`;
}
