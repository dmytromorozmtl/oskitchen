/**
 * Launch Wizard — Linear chain terminus guard integrity convergence.
 */
import type { LinearChainTerminusGuardUiSlice } from "@/lib/commercial/linear-chain-terminus-guard-ui-era24";

export const LAUNCH_WIZARD_LINEAR_CHAIN_TERMINUS_GUARD_ERA41_POLICY_ID =
  "era41-launch-wizard-linear-chain-terminus-guard-v1" as const;

export const LAUNCH_WIZARD_LINEAR_CHAIN_TERMINUS_GUARD_ANCHOR =
  "#launch-wizard-linear-chain-terminus-guard" as const;

export type LaunchWizardLinearChainTerminusGuardSlice = {
  policyId: typeof LAUNCH_WIZARD_LINEAR_CHAIN_TERMINUS_GUARD_ERA41_POLICY_ID;
  visible: boolean;
  goDecision: string;
  customerName: string | null;
  linearChainTerminusGuardIntegrityFailed: boolean;
  linearPathPermanentlyClosedIntegrityFailed: boolean;
  progressLabel: string;
  launchWizardHref: string;
  todayHref: string;
  platformOpsHref: string;
  integrityValidateCommand: string;
  postLinearPathClosedOrchestratorCommand: string;
};

export function buildLaunchWizardLinearChainTerminusGuardSlice(
  guard: LinearChainTerminusGuardUiSlice | null,
  customerName?: string | null,
): LaunchWizardLinearChainTerminusGuardSlice | null {
  if (!guard) return null;

  const attentionNeeded = guard.linearChainTerminusGuardMilestone !== "step17_forbidden_healthy";

  return {
    policyId: LAUNCH_WIZARD_LINEAR_CHAIN_TERMINUS_GUARD_ERA41_POLICY_ID,
    visible: true,
    goDecision: guard.goDecision ?? "GO",
    customerName: customerName ?? null,
    linearChainTerminusGuardIntegrityFailed: !guard.linearChainTerminusGuardIntegrityPassed,
    linearPathPermanentlyClosedIntegrityFailed: !guard.linearPathPermanentlyClosedIntegrityPassed,
    progressLabel: attentionNeeded
      ? `max step ${guard.maxLinearStep} · guard ${guard.guardPassed ? "PASS" : "FAIL"} · attention needed`
      : `max step ${guard.maxLinearStep} · Step 17+ forbidden`,
    launchWizardHref: guard.launchWizardHref,
    todayHref: guard.todayHref,
    platformOpsHref: guard.platformOpsHref,
    integrityValidateCommand: guard.integrityValidateCommand,
    postLinearPathClosedOrchestratorCommand: guard.postLinearPathClosedOrchestratorCommand,
  };
}

export function launchWizardLinearChainTerminusGuardHref(): string {
  return `/dashboard/launch-wizard${LAUNCH_WIZARD_LINEAR_CHAIN_TERMINUS_GUARD_ANCHOR}`;
}
