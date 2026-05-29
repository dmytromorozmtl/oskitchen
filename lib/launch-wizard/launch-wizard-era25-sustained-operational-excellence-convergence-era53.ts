/**
 * Launch Wizard — era25 sustained operational excellence convergence integrity convergence.
 */
import type { SustainedOperationalExcellenceConvergenceEra25UiSlice } from "@/lib/commercial/sustained-operational-excellence-convergence-ui-era25";

export const LAUNCH_WIZARD_ERA25_SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA53_POLICY_ID =
  "era53-launch-wizard-era25-sustained-operational-excellence-convergence-v1" as const;

export const LAUNCH_WIZARD_ERA25_SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ANCHOR =
  "#launch-wizard-era25-sustained-operational-excellence-convergence" as const;

export type LaunchWizardEra25SustainedOperationalExcellenceConvergenceSlice = {
  policyId: typeof LAUNCH_WIZARD_ERA25_SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA53_POLICY_ID;
  visible: boolean;
  goDecision: string;
  customerName: string | null;
  sustainedOperationalExcellenceConvergenceIntegrityFailed: boolean;
  marketLeaderPositioningConvergenceIntegrityFailed: boolean;
  convergenceBlocked: boolean;
  completedBlockingCount: number;
  totalBlockingCount: number;
  progressLabel: string;
  launchWizardHref: string;
  platformOpsHref: string;
  todayHref: string;
  orderHubHref: string;
  productionCalendarHref: string;
  integrityValidateCommand: string;
  postMarketLeaderConvergenceOrchestratorCommand: string;
};

export function buildLaunchWizardEra25SustainedOperationalExcellenceConvergenceSlice(
  slice: SustainedOperationalExcellenceConvergenceEra25UiSlice | null,
  customerName?: string | null,
): LaunchWizardEra25SustainedOperationalExcellenceConvergenceSlice | null {
  if (!slice) return null;

  const attentionNeeded =
    slice.sustainedOperationalExcellenceConvergenceEra25Milestone !==
      "sustained_operational_excellence_convergence_era25_ready" || slice.convergenceBlocked;

  return {
    policyId: LAUNCH_WIZARD_ERA25_SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA53_POLICY_ID,
    visible: true,
    goDecision: slice.goDecision ?? "NO-GO",
    customerName: customerName ?? null,
    sustainedOperationalExcellenceConvergenceIntegrityFailed:
      !slice.sustainedOperationalExcellenceConvergenceIntegrityPassed,
    marketLeaderPositioningConvergenceIntegrityFailed:
      !slice.marketLeaderPositioningConvergenceIntegrityPassed,
    convergenceBlocked: slice.convergenceBlocked,
    completedBlockingCount: slice.completedBlockingCount,
    totalBlockingCount: slice.totalBlockingCount,
    progressLabel: attentionNeeded
      ? `${slice.sustainedOperationalExcellenceConvergenceEra25Milestone.replaceAll("_", " ")} · ${slice.completedBlockingCount}/${slice.totalBlockingCount} cadences`
      : `Sustained ops ready · ${slice.completedBlockingCount}/${slice.totalBlockingCount} cadences · GO ${slice.goDecision ?? "GO"}`,
    launchWizardHref: slice.launchWizardHref,
    platformOpsHref: slice.platformOpsHref,
    todayHref: slice.todayHref,
    orderHubHref: slice.orderHubHref,
    productionCalendarHref: slice.productionCalendarHref,
    integrityValidateCommand: slice.integrityValidateCommand,
    postMarketLeaderConvergenceOrchestratorCommand: slice.postMarketLeaderConvergenceOrchestratorCommand,
  };
}

export function launchWizardEra25SustainedOperationalExcellenceConvergenceHref(): string {
  return `/dashboard/launch-wizard${LAUNCH_WIZARD_ERA25_SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ANCHOR}`;
}
