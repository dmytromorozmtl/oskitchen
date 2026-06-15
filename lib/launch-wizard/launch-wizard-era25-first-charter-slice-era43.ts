/**
 * Launch Wizard — era25 first charter slice readiness integrity convergence.
 */
import type { Era25FirstCharterSliceReadinessUiSlice } from "@/lib/commercial/era25-first-charter-slice-readiness-ui-era24";

export const LAUNCH_WIZARD_ERA25_FIRST_CHARTER_SLICE_ERA43_POLICY_ID =
  "era43-launch-wizard-era25-first-charter-slice-v1" as const;

export const LAUNCH_WIZARD_ERA25_FIRST_CHARTER_SLICE_ANCHOR =
  "#launch-wizard-era25-first-charter-slice" as const;

export type LaunchWizardEra25FirstCharterSliceSlice = {
  policyId: typeof LAUNCH_WIZARD_ERA25_FIRST_CHARTER_SLICE_ERA43_POLICY_ID;
  visible: boolean;
  goDecision: string;
  customerName: string | null;
  era25FirstCharterSliceIntegrityFailed: boolean;
  era25CharterExitIntegrityFailed: boolean;
  progressLabel: string;
  launchWizardHref: string;
  todayHref: string;
  platformOpsHref: string;
  integrityValidateCommand: string;
  postCharterExitOrchestratorCommand: string;
};

export function buildLaunchWizardEra25FirstCharterSliceSlice(
  slice: Era25FirstCharterSliceReadinessUiSlice | null,
  customerName?: string | null,
): LaunchWizardEra25FirstCharterSliceSlice | null {
  if (!slice) return null;

  const attentionNeeded =
    slice.era25FirstCharterSliceReadinessMilestone !== "era25_first_charter_slice_ready";

  return {
    policyId: LAUNCH_WIZARD_ERA25_FIRST_CHARTER_SLICE_ERA43_POLICY_ID,
    visible: true,
    goDecision: slice.goDecision ?? "GO",
    customerName: customerName ?? null,
    era25FirstCharterSliceIntegrityFailed: !slice.era25FirstCharterSliceIntegrityPassed,
    era25CharterExitIntegrityFailed: !slice.era25CharterExitIntegrityPassed,
    progressLabel: attentionNeeded
      ? `${slice.missingSectionCount}/${slice.requiredSectionCount} sections · attention needed`
      : `${slice.requiredSectionCount} sections validated · ready`,
    launchWizardHref: slice.launchWizardHref,
    todayHref: slice.todayHref,
    platformOpsHref: slice.platformOpsHref,
    integrityValidateCommand: slice.integrityValidateCommand,
    postCharterExitOrchestratorCommand: slice.postCharterExitOrchestratorCommand,
  };
}

export function launchWizardEra25FirstCharterSliceHref(): string {
  return `/dashboard/launch-wizard${LAUNCH_WIZARD_ERA25_FIRST_CHARTER_SLICE_ANCHOR}`;
}
