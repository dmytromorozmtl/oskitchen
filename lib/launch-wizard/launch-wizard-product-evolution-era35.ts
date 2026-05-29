/**
 * Launch Wizard — Sustained product evolution integrity convergence.
 */
import type { SustainedProductEvolutionUiSlice } from "@/lib/commercial/sustained-product-evolution-ui-era23";

export const LAUNCH_WIZARD_PRODUCT_EVOLUTION_ERA35_POLICY_ID =
  "era35-launch-wizard-product-evolution-v1" as const;

export const LAUNCH_WIZARD_PRODUCT_EVOLUTION_ANCHOR = "#launch-wizard-product-evolution" as const;

export type LaunchWizardProductEvolutionSlice = {
  policyId: typeof LAUNCH_WIZARD_PRODUCT_EVOLUTION_ERA35_POLICY_ID;
  visible: boolean;
  goDecision: string;
  customerName: string | null;
  productEvolutionIntegrityFailed: boolean;
  improvementLoopIntegrityFailed: boolean;
  progressLabel: string;
  launchWizardHref: string;
  todayHref: string;
  platformOpsHref: string;
  integrityValidateCommand: string;
  postImprovementLoopOrchestratorCommand: string;
};

export function buildLaunchWizardProductEvolutionSlice(
  productEvolution: SustainedProductEvolutionUiSlice | null,
): LaunchWizardProductEvolutionSlice | null {
  if (!productEvolution) return null;

  const trackCount = productEvolution.tracks.length;
  const attentionCount = productEvolution.overdueCount + productEvolution.dueSoonCount;

  return {
    policyId: LAUNCH_WIZARD_PRODUCT_EVOLUTION_ERA35_POLICY_ID,
    visible: true,
    goDecision: productEvolution.goDecision,
    customerName: productEvolution.customerName,
    productEvolutionIntegrityFailed: !productEvolution.productEvolutionIntegrityPassed,
    improvementLoopIntegrityFailed: !productEvolution.improvementLoopIntegrityPassed,
    progressLabel:
      attentionCount > 0
        ? `${attentionCount}/${trackCount} tracks need attention`
        : `${productEvolution.healthyCount}/${trackCount} healthy`,
    launchWizardHref: productEvolution.launchWizardHref,
    todayHref: productEvolution.todayHref,
    platformOpsHref: productEvolution.platformOpsHref,
    integrityValidateCommand: productEvolution.integrityValidateCommand,
    postImprovementLoopOrchestratorCommand: productEvolution.postImprovementLoopOrchestratorCommand,
  };
}

export function launchWizardProductEvolutionHref(): string {
  return `/dashboard/launch-wizard${LAUNCH_WIZARD_PRODUCT_EVOLUTION_ANCHOR}`;
}
