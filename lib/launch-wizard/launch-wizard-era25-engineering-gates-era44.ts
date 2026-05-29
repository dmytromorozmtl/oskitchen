/**
 * Launch Wizard — era25 engineering gates integrity convergence.
 */
import type { Era25EngineeringGatesUiSlice } from "@/lib/commercial/era25-engineering-gates-ui-era24";

export const LAUNCH_WIZARD_ERA25_ENGINEERING_GATES_ERA44_POLICY_ID =
  "era44-launch-wizard-era25-engineering-gates-v1" as const;

export const LAUNCH_WIZARD_ERA25_ENGINEERING_GATES_ANCHOR =
  "#launch-wizard-era25-engineering-gates" as const;

export type LaunchWizardEra25EngineeringGatesSlice = {
  policyId: typeof LAUNCH_WIZARD_ERA25_ENGINEERING_GATES_ERA44_POLICY_ID;
  visible: boolean;
  goDecision: string;
  customerName: string | null;
  era25EngineeringGatesIntegrityFailed: boolean;
  era25FirstCharterSliceIntegrityFailed: boolean;
  gatesBlocked: boolean;
  progressLabel: string;
  launchWizardHref: string;
  todayHref: string;
  platformOpsHref: string;
  integrityValidateCommand: string;
  postReadinessOrchestratorCommand: string;
};

export function buildLaunchWizardEra25EngineeringGatesSlice(
  slice: Era25EngineeringGatesUiSlice | null,
  customerName?: string | null,
): LaunchWizardEra25EngineeringGatesSlice | null {
  if (!slice) return null;

  const attentionNeeded =
    slice.era25EngineeringGatesMilestone !== "era25_engineering_gates_open" || slice.gatesBlocked;

  return {
    policyId: LAUNCH_WIZARD_ERA25_ENGINEERING_GATES_ERA44_POLICY_ID,
    visible: true,
    goDecision: slice.goDecision ?? "GO",
    customerName: customerName ?? null,
    era25EngineeringGatesIntegrityFailed: !slice.era25EngineeringGatesIntegrityPassed,
    era25FirstCharterSliceIntegrityFailed: !slice.era25FirstCharterSliceIntegrityPassed,
    gatesBlocked: slice.gatesBlocked,
    progressLabel: attentionNeeded
      ? `${slice.era25EngineeringGatesMilestone.replaceAll("_", " ")} · attention needed`
      : "engineering gates open · signed charter enforced",
    launchWizardHref: slice.launchWizardHref,
    todayHref: slice.todayHref,
    platformOpsHref: slice.platformOpsHref,
    integrityValidateCommand: slice.integrityValidateCommand,
    postReadinessOrchestratorCommand: slice.postReadinessOrchestratorCommand,
  };
}

export function launchWizardEra25EngineeringGatesHref(): string {
  return `/dashboard/launch-wizard${LAUNCH_WIZARD_ERA25_ENGINEERING_GATES_ANCHOR}`;
}
