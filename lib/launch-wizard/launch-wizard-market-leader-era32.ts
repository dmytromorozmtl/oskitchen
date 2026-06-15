/**
 * Launch Wizard — Market leader positioning integrity convergence.
 */
import type { MarketLeaderPositioningUiSlice } from "@/lib/commercial/market-leader-positioning-ui-era21";

export const LAUNCH_WIZARD_MARKET_LEADER_ERA32_POLICY_ID =
  "era32-launch-wizard-market-leader-v1" as const;

export const LAUNCH_WIZARD_MARKET_LEADER_ANCHOR = "#launch-wizard-market-leader" as const;

export type LaunchWizardMarketLeaderSlice = {
  policyId: typeof LAUNCH_WIZARD_MARKET_LEADER_ERA32_POLICY_ID;
  visible: boolean;
  goDecision: string;
  customerName: string | null;
  marketLeaderIntegrityFailed: boolean;
  seriesAIntegrityFailed: boolean;
  progressLabel: string;
  launchWizardHref: string;
  todayHref: string;
  platformOpsHref: string;
  integrityValidateCommand: string;
  postSeriesAOrchestratorCommand: string;
};

export function buildLaunchWizardMarketLeaderSlice(
  marketLeader: MarketLeaderPositioningUiSlice | null,
): LaunchWizardMarketLeaderSlice | null {
  if (!marketLeader) return null;

  return {
    policyId: LAUNCH_WIZARD_MARKET_LEADER_ERA32_POLICY_ID,
    visible: true,
    goDecision: marketLeader.goDecision,
    customerName: marketLeader.customerName,
    marketLeaderIntegrityFailed: !marketLeader.marketLeaderIntegrityPassed,
    seriesAIntegrityFailed: !marketLeader.seriesAIntegrityPassed,
    progressLabel: `${marketLeader.completedBlockingPhaseCount}/${marketLeader.blockingPhaseCount} pillars`,
    launchWizardHref: marketLeader.launchWizardHref,
    todayHref: marketLeader.todayHref,
    platformOpsHref: marketLeader.platformOpsHref,
    integrityValidateCommand: marketLeader.integrityValidateCommand,
    postSeriesAOrchestratorCommand: marketLeader.postSeriesAOrchestratorCommand,
  };
}

export function launchWizardMarketLeaderHref(): string {
  return `/dashboard/launch-wizard${LAUNCH_WIZARD_MARKET_LEADER_ANCHOR}`;
}
