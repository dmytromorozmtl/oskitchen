/**
 * Launch Wizard — era25 first product slice blueprint integrity convergence.
 */
import type { Era25FirstProductSliceBlueprintUiSlice } from "@/lib/commercial/era25-first-product-slice-blueprint-ui-era24";

export const LAUNCH_WIZARD_ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_ERA45_POLICY_ID =
  "era45-launch-wizard-era25-first-product-slice-blueprint-v1" as const;

export const LAUNCH_WIZARD_ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_ANCHOR =
  "#launch-wizard-era25-first-product-slice-blueprint" as const;

export type LaunchWizardEra25FirstProductSliceBlueprintSlice = {
  policyId: typeof LAUNCH_WIZARD_ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_ERA45_POLICY_ID;
  visible: boolean;
  goDecision: string;
  customerName: string | null;
  era25FirstProductSliceBlueprintIntegrityFailed: boolean;
  era25EngineeringGatesIntegrityFailed: boolean;
  blueprintBlocked: boolean;
  canonicalSliceName: string;
  progressLabel: string;
  launchWizardHref: string;
  todayHref: string;
  platformOpsHref: string;
  integrityValidateCommand: string;
  postGatesOrchestratorCommand: string;
};

export function buildLaunchWizardEra25FirstProductSliceBlueprintSlice(
  slice: Era25FirstProductSliceBlueprintUiSlice | null,
  customerName?: string | null,
): LaunchWizardEra25FirstProductSliceBlueprintSlice | null {
  if (!slice) return null;

  const attentionNeeded =
    slice.era25FirstProductSliceBlueprintMilestone !== "era25_first_product_slice_blueprint_ready" ||
    slice.blueprintBlocked;

  return {
    policyId: LAUNCH_WIZARD_ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_ERA45_POLICY_ID,
    visible: true,
    goDecision: slice.goDecision ?? "GO",
    customerName: customerName ?? null,
    era25FirstProductSliceBlueprintIntegrityFailed: !slice.era25FirstProductSliceBlueprintIntegrityPassed,
    era25EngineeringGatesIntegrityFailed: !slice.era25EngineeringGatesIntegrityPassed,
    blueprintBlocked: slice.blueprintBlocked,
    canonicalSliceName: slice.canonicalSliceName,
    progressLabel: attentionNeeded
      ? `${slice.era25FirstProductSliceBlueprintMilestone.replaceAll("_", " ")} · attention needed`
      : `${slice.canonicalSliceName} blueprint ready`,
    launchWizardHref: slice.launchWizardHref,
    todayHref: slice.todayHref,
    platformOpsHref: slice.platformOpsHref,
    integrityValidateCommand: slice.integrityValidateCommand,
    postGatesOrchestratorCommand: slice.postGatesOrchestratorCommand,
  };
}

export function launchWizardEra25FirstProductSliceBlueprintHref(): string {
  return `/dashboard/launch-wizard${LAUNCH_WIZARD_ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_ANCHOR}`;
}
