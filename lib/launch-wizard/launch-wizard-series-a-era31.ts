/**
 * Launch Wizard — Series A / partner expansion integrity convergence.
 */
import type { SeriesAPartnerExpansionUiSlice } from "@/lib/commercial/series-a-partner-expansion-ui-era21";
import { LAUNCH_WIZARD_COMMERCIAL_BLOCKERS_ANCHOR } from "@/lib/launch-wizard/launch-wizard-commercial-setup-era19-policy";

export const LAUNCH_WIZARD_SERIES_A_ERA31_POLICY_ID = "era31-launch-wizard-series-a-v1" as const;

export const LAUNCH_WIZARD_SERIES_A_ANCHOR = "#launch-wizard-series-a" as const;

export type LaunchWizardSeriesASlice = {
  policyId: typeof LAUNCH_WIZARD_SERIES_A_ERA31_POLICY_ID;
  visible: boolean;
  goDecision: string;
  customerName: string | null;
  seriesAIntegrityFailed: boolean;
  scaleIntegrityFailed: boolean;
  progressLabel: string;
  launchWizardHref: string;
  todayHref: string;
  platformOpsHref: string;
  integrityValidateCommand: string;
  postScaleOrchestratorCommand: string;
};

export function buildLaunchWizardSeriesASlice(
  seriesA: SeriesAPartnerExpansionUiSlice | null,
): LaunchWizardSeriesASlice | null {
  if (!seriesA) return null;

  return {
    policyId: LAUNCH_WIZARD_SERIES_A_ERA31_POLICY_ID,
    visible: true,
    goDecision: seriesA.goDecision,
    customerName: seriesA.customerName,
    seriesAIntegrityFailed: !seriesA.seriesAIntegrityPassed,
    scaleIntegrityFailed: !seriesA.scaleIntegrityPassed,
    progressLabel: `${seriesA.completedBlockingPhaseCount}/${seriesA.blockingPhaseCount} tracks`,
    launchWizardHref: seriesA.launchWizardHref,
    todayHref: seriesA.todayHref,
    platformOpsHref: seriesA.platformOpsHref,
    integrityValidateCommand: seriesA.integrityValidateCommand,
    postScaleOrchestratorCommand: seriesA.postScaleOrchestratorCommand,
  };
}

export function launchWizardSeriesAHref(): string {
  return `/dashboard/launch-wizard${LAUNCH_WIZARD_SERIES_A_ANCHOR}`;
}
