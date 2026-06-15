/**
 * Launch Wizard — Sustained operational excellence integrity convergence.
 */
import type { SustainedOperationalExcellenceUiSlice } from "@/lib/commercial/sustained-operational-excellence-ui-era21";

export const LAUNCH_WIZARD_SUSTAINED_OPS_ERA33_POLICY_ID =
  "era33-launch-wizard-sustained-ops-v1" as const;

export const LAUNCH_WIZARD_SUSTAINED_OPS_ANCHOR = "#launch-wizard-sustained-ops" as const;

export type LaunchWizardSustainedOpsSlice = {
  policyId: typeof LAUNCH_WIZARD_SUSTAINED_OPS_ERA33_POLICY_ID;
  visible: boolean;
  goDecision: string;
  customerName: string | null;
  sustainedOpsIntegrityFailed: boolean;
  marketLeaderIntegrityFailed: boolean;
  progressLabel: string;
  launchWizardHref: string;
  todayHref: string;
  platformOpsHref: string;
  integrityValidateCommand: string;
  postMarketLeaderOrchestratorCommand: string;
};

export function buildLaunchWizardSustainedOpsSlice(
  sustainedOps: SustainedOperationalExcellenceUiSlice | null,
): LaunchWizardSustainedOpsSlice | null {
  if (!sustainedOps) return null;

  return {
    policyId: LAUNCH_WIZARD_SUSTAINED_OPS_ERA33_POLICY_ID,
    visible: true,
    goDecision: sustainedOps.goDecision,
    customerName: sustainedOps.customerName,
    sustainedOpsIntegrityFailed: !sustainedOps.sustainedOpsIntegrityPassed,
    marketLeaderIntegrityFailed: !sustainedOps.marketLeaderIntegrityPassed,
    progressLabel: `${sustainedOps.completedBlockingPhaseCount}/${sustainedOps.blockingPhaseCount} cadences`,
    launchWizardHref: sustainedOps.launchWizardHref,
    todayHref: sustainedOps.todayHref,
    platformOpsHref: sustainedOps.platformOpsHref,
    integrityValidateCommand: sustainedOps.integrityValidateCommand,
    postMarketLeaderOrchestratorCommand: sustainedOps.postMarketLeaderOrchestratorCommand,
  };
}

export function launchWizardSustainedOpsHref(): string {
  return `/dashboard/launch-wizard${LAUNCH_WIZARD_SUSTAINED_OPS_ANCHOR}`;
}
