/**
 * Launch Wizard — era25 market leader positioning convergence integrity convergence.
 */
import type { MarketLeaderPositioningConvergenceEra25UiSlice } from "@/lib/commercial/market-leader-positioning-convergence-ui-era25";

export const LAUNCH_WIZARD_ERA25_MARKET_LEADER_POSITIONING_CONVERGENCE_ERA52_POLICY_ID =
  "era52-launch-wizard-era25-market-leader-positioning-convergence-v1" as const;

export const LAUNCH_WIZARD_ERA25_MARKET_LEADER_POSITIONING_CONVERGENCE_ANCHOR =
  "#launch-wizard-era25-market-leader-positioning-convergence" as const;

export type LaunchWizardEra25MarketLeaderPositioningConvergenceSlice = {
  policyId: typeof LAUNCH_WIZARD_ERA25_MARKET_LEADER_POSITIONING_CONVERGENCE_ERA52_POLICY_ID;
  visible: boolean;
  goDecision: string;
  customerName: string | null;
  marketLeaderPositioningConvergenceIntegrityFailed: boolean;
  seriesAPartnerExpansionConvergenceIntegrityFailed: boolean;
  convergenceBlocked: boolean;
  completedBlockingCount: number;
  totalBlockingCount: number;
  progressLabel: string;
  launchWizardHref: string;
  platformOpsHref: string;
  reportsHref: string;
  ghostKitchenLandingHref: string;
  integrityValidateCommand: string;
  postSeriesAConvergenceOrchestratorCommand: string;
};

export function buildLaunchWizardEra25MarketLeaderPositioningConvergenceSlice(
  slice: MarketLeaderPositioningConvergenceEra25UiSlice | null,
  customerName?: string | null,
): LaunchWizardEra25MarketLeaderPositioningConvergenceSlice | null {
  if (!slice) return null;

  const attentionNeeded =
    slice.marketLeaderPositioningConvergenceEra25Milestone !==
      "market_leader_positioning_convergence_era25_ready" || slice.convergenceBlocked;

  return {
    policyId: LAUNCH_WIZARD_ERA25_MARKET_LEADER_POSITIONING_CONVERGENCE_ERA52_POLICY_ID,
    visible: true,
    goDecision: slice.goDecision ?? "NO-GO",
    customerName: customerName ?? null,
    marketLeaderPositioningConvergenceIntegrityFailed:
      !slice.marketLeaderPositioningConvergenceIntegrityPassed,
    seriesAPartnerExpansionConvergenceIntegrityFailed:
      !slice.seriesAPartnerExpansionConvergenceIntegrityPassed,
    convergenceBlocked: slice.convergenceBlocked,
    completedBlockingCount: slice.completedBlockingCount,
    totalBlockingCount: slice.totalBlockingCount,
    progressLabel: attentionNeeded
      ? `${slice.marketLeaderPositioningConvergenceEra25Milestone.replaceAll("_", " ")} · ${slice.completedBlockingCount}/${slice.totalBlockingCount} pillars`
      : `Market leader ready · ${slice.completedBlockingCount}/${slice.totalBlockingCount} pillars · GO ${slice.goDecision ?? "GO"}`,
    launchWizardHref: slice.launchWizardHref,
    platformOpsHref: slice.platformOpsHref,
    reportsHref: slice.reportsHref,
    ghostKitchenLandingHref: slice.ghostKitchenLandingHref,
    integrityValidateCommand: slice.integrityValidateCommand,
    postSeriesAConvergenceOrchestratorCommand: slice.postSeriesAConvergenceOrchestratorCommand,
  };
}

export function launchWizardEra25MarketLeaderPositioningConvergenceHref(): string {
  return `/dashboard/launch-wizard${LAUNCH_WIZARD_ERA25_MARKET_LEADER_POSITIONING_CONVERGENCE_ANCHOR}`;
}
