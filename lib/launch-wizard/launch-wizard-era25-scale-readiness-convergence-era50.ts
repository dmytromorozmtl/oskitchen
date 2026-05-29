/**
 * Launch Wizard — era25 scale readiness convergence integrity convergence.
 */
import type { ScaleReadinessConvergenceEra25UiSlice } from "@/lib/commercial/scale-readiness-convergence-ui-era25";

export const LAUNCH_WIZARD_ERA25_SCALE_READINESS_CONVERGENCE_ERA50_POLICY_ID =
  "era50-launch-wizard-era25-scale-readiness-convergence-v1" as const;

export const LAUNCH_WIZARD_ERA25_SCALE_READINESS_CONVERGENCE_ANCHOR =
  "#launch-wizard-era25-scale-readiness-convergence" as const;

export type LaunchWizardEra25ScaleReadinessConvergenceSlice = {
  policyId: typeof LAUNCH_WIZARD_ERA25_SCALE_READINESS_CONVERGENCE_ERA50_POLICY_ID;
  visible: boolean;
  goDecision: string;
  customerName: string | null;
  scaleReadinessConvergenceIntegrityFailed: boolean;
  month2MarketReadinessConvergenceIntegrityFailed: boolean;
  convergenceBlocked: boolean;
  completedBlockingCount: number;
  totalBlockingCount: number;
  progressLabel: string;
  launchWizardHref: string;
  platformOpsHref: string;
  integrationHealthHref: string;
  integrityValidateCommand: string;
  postMonth2ConvergenceOrchestratorCommand: string;
};

export function buildLaunchWizardEra25ScaleReadinessConvergenceSlice(
  slice: ScaleReadinessConvergenceEra25UiSlice | null,
  customerName?: string | null,
): LaunchWizardEra25ScaleReadinessConvergenceSlice | null {
  if (!slice) return null;

  const attentionNeeded =
    slice.scaleReadinessConvergenceEra25Milestone !== "scale_readiness_convergence_era25_ready" ||
    slice.convergenceBlocked;

  return {
    policyId: LAUNCH_WIZARD_ERA25_SCALE_READINESS_CONVERGENCE_ERA50_POLICY_ID,
    visible: true,
    goDecision: slice.goDecision ?? "NO-GO",
    customerName: customerName ?? null,
    scaleReadinessConvergenceIntegrityFailed: !slice.scaleReadinessConvergenceIntegrityPassed,
    month2MarketReadinessConvergenceIntegrityFailed:
      !slice.month2MarketReadinessConvergenceIntegrityPassed,
    convergenceBlocked: slice.convergenceBlocked,
    completedBlockingCount: slice.completedBlockingCount,
    totalBlockingCount: slice.totalBlockingCount,
    progressLabel: attentionNeeded
      ? `${slice.scaleReadinessConvergenceEra25Milestone.replaceAll("_", " ")} · ${slice.completedBlockingCount}/${slice.totalBlockingCount} gates`
      : `Scale ready · ${slice.completedBlockingCount}/${slice.totalBlockingCount} gates · GO ${slice.goDecision ?? "GO"}`,
    launchWizardHref: slice.launchWizardHref,
    platformOpsHref: slice.platformOpsHref,
    integrationHealthHref: slice.integrationHealthHref,
    integrityValidateCommand: slice.integrityValidateCommand,
    postMonth2ConvergenceOrchestratorCommand: slice.postMonth2ConvergenceOrchestratorCommand,
  };
}

export function launchWizardEra25ScaleReadinessConvergenceHref(): string {
  return `/dashboard/launch-wizard${LAUNCH_WIZARD_ERA25_SCALE_READINESS_CONVERGENCE_ANCHOR}`;
}
