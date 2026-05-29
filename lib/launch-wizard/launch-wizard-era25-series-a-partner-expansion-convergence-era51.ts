/**
 * Launch Wizard — era25 Series A partner expansion convergence integrity convergence.
 */
import type { SeriesAPartnerExpansionConvergenceEra25UiSlice } from "@/lib/commercial/series-a-partner-expansion-convergence-ui-era25";

export const LAUNCH_WIZARD_ERA25_SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA51_POLICY_ID =
  "era51-launch-wizard-era25-series-a-partner-expansion-convergence-v1" as const;

export const LAUNCH_WIZARD_ERA25_SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ANCHOR =
  "#launch-wizard-era25-series-a-partner-expansion-convergence" as const;

export type LaunchWizardEra25SeriesAPartnerExpansionConvergenceSlice = {
  policyId: typeof LAUNCH_WIZARD_ERA25_SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA51_POLICY_ID;
  visible: boolean;
  goDecision: string;
  customerName: string | null;
  seriesAPartnerExpansionConvergenceIntegrityFailed: boolean;
  scaleReadinessConvergenceIntegrityFailed: boolean;
  convergenceBlocked: boolean;
  completedBlockingCount: number;
  totalBlockingCount: number;
  progressLabel: string;
  launchWizardHref: string;
  platformOpsHref: string;
  reportsHref: string;
  integrationHealthHref: string;
  integrityValidateCommand: string;
  postScaleConvergenceOrchestratorCommand: string;
};

export function buildLaunchWizardEra25SeriesAPartnerExpansionConvergenceSlice(
  slice: SeriesAPartnerExpansionConvergenceEra25UiSlice | null,
  customerName?: string | null,
): LaunchWizardEra25SeriesAPartnerExpansionConvergenceSlice | null {
  if (!slice) return null;

  const attentionNeeded =
    slice.seriesAPartnerExpansionConvergenceEra25Milestone !==
      "series_a_partner_expansion_convergence_era25_ready" || slice.convergenceBlocked;

  return {
    policyId: LAUNCH_WIZARD_ERA25_SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA51_POLICY_ID,
    visible: true,
    goDecision: slice.goDecision ?? "NO-GO",
    customerName: customerName ?? null,
    seriesAPartnerExpansionConvergenceIntegrityFailed:
      !slice.seriesAPartnerExpansionConvergenceIntegrityPassed,
    scaleReadinessConvergenceIntegrityFailed: !slice.scaleReadinessConvergenceIntegrityPassed,
    convergenceBlocked: slice.convergenceBlocked,
    completedBlockingCount: slice.completedBlockingCount,
    totalBlockingCount: slice.totalBlockingCount,
    progressLabel: attentionNeeded
      ? `${slice.seriesAPartnerExpansionConvergenceEra25Milestone.replaceAll("_", " ")} · ${slice.completedBlockingCount}/${slice.totalBlockingCount} tracks`
      : `Series A ready · ${slice.completedBlockingCount}/${slice.totalBlockingCount} tracks · GO ${slice.goDecision ?? "GO"}`,
    launchWizardHref: slice.launchWizardHref,
    platformOpsHref: slice.platformOpsHref,
    reportsHref: slice.reportsHref,
    integrationHealthHref: slice.integrationHealthHref,
    integrityValidateCommand: slice.integrityValidateCommand,
    postScaleConvergenceOrchestratorCommand: slice.postScaleConvergenceOrchestratorCommand,
  };
}

export function launchWizardEra25SeriesAPartnerExpansionConvergenceHref(): string {
  return `/dashboard/launch-wizard${LAUNCH_WIZARD_ERA25_SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ANCHOR}`;
}
