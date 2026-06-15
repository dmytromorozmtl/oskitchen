/**
 * Launch Wizard — commercial GO closure integrity convergence.
 */
import type { CommercialGoClosureUiSlice } from "@/lib/commercial/commercial-go-closure-ui-era21";
import { LAUNCH_WIZARD_COMMERCIAL_BLOCKERS_ANCHOR } from "@/lib/launch-wizard/launch-wizard-commercial-setup-era19-policy";

export const LAUNCH_WIZARD_COMMERCIAL_GO_CLOSURE_ERA28_POLICY_ID =
  "era28-launch-wizard-commercial-go-closure-v1" as const;

export const LAUNCH_WIZARD_COMMERCIAL_GO_CLOSURE_ANCHOR =
  "#launch-wizard-commercial-go-closure" as const;

export type LaunchWizardCommercialGoClosureSlice = {
  policyId: typeof LAUNCH_WIZARD_COMMERCIAL_GO_CLOSURE_ERA28_POLICY_ID;
  visible: boolean;
  decision: string | null;
  goIntegrityFailed: boolean;
  progressLabel: string;
  launchWizardHref: string;
  implementationHref: string;
  integrityValidateCommand: string;
  orchestratorCommand: string;
};

export function buildLaunchWizardCommercialGoClosureSlice(
  goClosure: CommercialGoClosureUiSlice | null,
): LaunchWizardCommercialGoClosureSlice | null {
  if (!goClosure) return null;

  return {
    policyId: LAUNCH_WIZARD_COMMERCIAL_GO_CLOSURE_ERA28_POLICY_ID,
    visible: true,
    decision: goClosure.decision,
    goIntegrityFailed: goClosure.goIntegrityFailed,
    progressLabel: `${goClosure.completedPhaseCount}/${goClosure.phases.length} phases`,
    launchWizardHref: goClosure.launchWizardHref,
    implementationHref: goClosure.implementationHref,
    integrityValidateCommand: goClosure.integrityValidateCommand,
    orchestratorCommand: goClosure.orchestratorCommand,
  };
}

export function launchWizardCommercialGoClosureHref(): string {
  return `/dashboard/launch-wizard${LAUNCH_WIZARD_COMMERCIAL_GO_CLOSURE_ANCHOR}`;
}
