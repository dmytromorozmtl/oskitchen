/**
 * Launch Wizard — era25 month 2 market readiness convergence integrity convergence.
 */
import type { Month2MarketReadinessConvergenceEra25UiSlice } from "@/lib/commercial/month2-market-readiness-convergence-ui-era25";

export const LAUNCH_WIZARD_ERA25_MONTH2_MARKET_READINESS_CONVERGENCE_ERA49_POLICY_ID =
  "era49-launch-wizard-era25-month2-market-readiness-convergence-v1" as const;

export const LAUNCH_WIZARD_ERA25_MONTH2_MARKET_READINESS_CONVERGENCE_ANCHOR =
  "#launch-wizard-era25-month2-market-readiness-convergence" as const;

export type LaunchWizardEra25Month2MarketReadinessConvergenceSlice = {
  policyId: typeof LAUNCH_WIZARD_ERA25_MONTH2_MARKET_READINESS_CONVERGENCE_ERA49_POLICY_ID;
  visible: boolean;
  goDecision: string;
  customerName: string | null;
  month2MarketReadinessConvergenceIntegrityFailed: boolean;
  pilotWeek1ExecutionConvergenceIntegrityFailed: boolean;
  convergenceBlocked: boolean;
  completedBlockingCount: number;
  totalBlockingCount: number;
  progressLabel: string;
  launchWizardHref: string;
  platformOpsHref: string;
  ghostKitchenLandingHref: string;
  integrityValidateCommand: string;
  postWeek1ConvergenceOrchestratorCommand: string;
};

export function buildLaunchWizardEra25Month2MarketReadinessConvergenceSlice(
  slice: Month2MarketReadinessConvergenceEra25UiSlice | null,
  customerName?: string | null,
): LaunchWizardEra25Month2MarketReadinessConvergenceSlice | null {
  if (!slice) return null;

  const attentionNeeded =
    slice.month2MarketReadinessConvergenceEra25Milestone !==
      "month2_market_readiness_convergence_era25_ready" || slice.convergenceBlocked;

  return {
    policyId: LAUNCH_WIZARD_ERA25_MONTH2_MARKET_READINESS_CONVERGENCE_ERA49_POLICY_ID,
    visible: true,
    goDecision: slice.goDecision ?? "NO-GO",
    customerName: customerName ?? null,
    month2MarketReadinessConvergenceIntegrityFailed:
      !slice.month2MarketReadinessConvergenceIntegrityPassed,
    pilotWeek1ExecutionConvergenceIntegrityFailed:
      !slice.pilotWeek1ExecutionConvergenceIntegrityPassed,
    convergenceBlocked: slice.convergenceBlocked,
    completedBlockingCount: slice.completedBlockingCount,
    totalBlockingCount: slice.totalBlockingCount,
    progressLabel: attentionNeeded
      ? `${slice.month2MarketReadinessConvergenceEra25Milestone.replaceAll("_", " ")} · ${slice.completedBlockingCount}/${slice.totalBlockingCount} workstreams`
      : `Month 2 ready · ${slice.completedBlockingCount}/${slice.totalBlockingCount} workstreams · GO ${slice.goDecision ?? "GO"}`,
    launchWizardHref: slice.launchWizardHref,
    platformOpsHref: slice.platformOpsHref,
    ghostKitchenLandingHref: slice.ghostKitchenLandingHref,
    integrityValidateCommand: slice.integrityValidateCommand,
    postWeek1ConvergenceOrchestratorCommand: slice.postWeek1ConvergenceOrchestratorCommand,
  };
}

export function launchWizardEra25Month2MarketReadinessConvergenceHref(): string {
  return `/dashboard/launch-wizard${LAUNCH_WIZARD_ERA25_MONTH2_MARKET_READINESS_CONVERGENCE_ANCHOR}`;
}
