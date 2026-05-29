/**
 * Launch Wizard — era25 sustained product evolution re-entrant integrity.
 */
import type { SustainedProductEvolutionReentrantEra25UiSlice } from "@/lib/commercial/sustained-product-evolution-re-entrant-ui-era25";

export const LAUNCH_WIZARD_ERA25_SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_ERA56_POLICY_ID =
  "era56-launch-wizard-era25-sustained-product-evolution-re-entrant-v1" as const;

export const LAUNCH_WIZARD_ERA25_SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_ANCHOR =
  "#launch-wizard-era25-sustained-product-evolution-re-entrant" as const;

export type LaunchWizardEra25SustainedProductEvolutionReentrantSlice = {
  policyId: typeof LAUNCH_WIZARD_ERA25_SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_ERA56_POLICY_ID;
  visible: boolean;
  goDecision: string;
  customerName: string | null;
  sustainedProductEvolutionReentrantIntegrityFailed: boolean;
  era25CommercialPilotConvergenceTrainClosureIntegrityFailed: boolean;
  reentrantBlocked: boolean;
  linearConvergenceSurfaceReopened: boolean;
  progressLabel: string;
  launchWizardHref: string;
  platformOpsHref: string;
  productEvolutionHref: string;
  improvementLoopHref: string;
  todayHref: string;
  integrityValidateCommand: string;
  postImprovementLoopOrchestratorCommand: string;
};

export function buildLaunchWizardEra25SustainedProductEvolutionReentrantSlice(
  slice: SustainedProductEvolutionReentrantEra25UiSlice | null,
  customerName?: string | null,
): LaunchWizardEra25SustainedProductEvolutionReentrantSlice | null {
  if (!slice) return null;

  const attentionNeeded = slice.reentrantBlocked;

  return {
    policyId: LAUNCH_WIZARD_ERA25_SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_ERA56_POLICY_ID,
    visible: true,
    goDecision: slice.goDecision ?? "NO-GO",
    customerName: customerName ?? null,
    sustainedProductEvolutionReentrantIntegrityFailed:
      !slice.sustainedProductEvolutionReentrantIntegrityPassed,
    era25CommercialPilotConvergenceTrainClosureIntegrityFailed:
      !slice.era25CommercialPilotConvergenceTrainClosureIntegrityPassed,
    reentrantBlocked: slice.reentrantBlocked,
    linearConvergenceSurfaceReopened: slice.linearConvergenceSurfaceReopened,
    progressLabel: attentionNeeded
      ? slice.linearConvergenceSurfaceReopened
        ? "Linear convergence env reopened · clear era25 attest keys"
        : `Re-entrant pending · train closure ${slice.trainClosureComplete ? "closed" : "open"} · loop ${slice.improvementLoopActive ? "active" : "inactive"}`
      : `Re-entrant honest · improvement loop active · GO ${slice.goDecision ?? "GO"}`,
    launchWizardHref: slice.launchWizardHref,
    platformOpsHref: slice.platformOpsHref,
    productEvolutionHref: slice.productEvolutionHref,
    improvementLoopHref: slice.improvementLoopHref,
    todayHref: slice.todayHref,
    integrityValidateCommand: slice.integrityValidateCommand,
    postImprovementLoopOrchestratorCommand: slice.postImprovementLoopOrchestratorCommand,
  };
}

export function launchWizardEra25SustainedProductEvolutionReentrantHref(): string {
  return `/dashboard/launch-wizard${LAUNCH_WIZARD_ERA25_SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_ANCHOR}`;
}
