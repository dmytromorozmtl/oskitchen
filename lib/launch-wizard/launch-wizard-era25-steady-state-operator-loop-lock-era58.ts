/**
 * Launch Wizard — era25 steady-state operator loop convergence lock integrity.
 */
import type { Era25SteadyStateOperatorLoopLockEra25UiSlice } from "@/lib/commercial/era25-steady-state-operator-loop-lock-ui-era25";

export const LAUNCH_WIZARD_ERA25_STEADY_STATE_OPERATOR_LOOP_LOCK_ERA58_POLICY_ID =
  "era58-launch-wizard-era25-steady-state-operator-loop-lock-v1" as const;

export const LAUNCH_WIZARD_ERA25_STEADY_STATE_OPERATOR_LOOP_LOCK_ANCHOR =
  "#launch-wizard-era25-steady-state-operator-loop-lock" as const;

export type LaunchWizardEra25SteadyStateOperatorLoopLockSlice = {
  policyId: typeof LAUNCH_WIZARD_ERA25_STEADY_STATE_OPERATOR_LOOP_LOCK_ERA58_POLICY_ID;
  visible: boolean;
  goDecision: string;
  customerName: string | null;
  era25SteadyStateOperatorLoopLockIntegrityFailed: boolean;
  era25PostReentrantCharterLockIntegrityFailed: boolean;
  steadyStateLockBlocked: boolean;
  frozenEnvMutationDetected: boolean;
  improvementLoopRhythmMutationDetected: boolean;
  progressLabel: string;
  launchWizardHref: string;
  platformOpsHref: string;
  improvementLoopHref: string;
  todayHref: string;
  integrityValidateCommand: string;
  governanceBundlesCertCommand: string;
  commercialPilotRunbookCertCommand: string;
};

export function buildLaunchWizardEra25SteadyStateOperatorLoopLockSlice(
  slice: Era25SteadyStateOperatorLoopLockEra25UiSlice | null,
  customerName?: string | null,
): LaunchWizardEra25SteadyStateOperatorLoopLockSlice | null {
  if (!slice) return null;

  const attentionNeeded = slice.steadyStateLockBlocked;

  return {
    policyId: LAUNCH_WIZARD_ERA25_STEADY_STATE_OPERATOR_LOOP_LOCK_ERA58_POLICY_ID,
    visible: true,
    goDecision: slice.goDecision ?? "NO-GO",
    customerName: customerName ?? null,
    era25SteadyStateOperatorLoopLockIntegrityFailed: !slice.era25SteadyStateOperatorLoopLockIntegrityPassed,
    era25PostReentrantCharterLockIntegrityFailed: !slice.era25PostReentrantCharterLockIntegrityPassed,
    steadyStateLockBlocked: slice.steadyStateLockBlocked,
    frozenEnvMutationDetected: slice.frozenEnvMutationDetected,
    improvementLoopRhythmMutationDetected: slice.improvementLoopRhythmMutationDetected,
    progressLabel: attentionNeeded
      ? slice.frozenEnvMutationDetected
        ? "Frozen env mutation · clear era25 attest keys"
        : slice.improvementLoopRhythmMutationDetected
          ? "Improvement loop cadence blocked · fix loop integrity"
          : `Steady-state lock pending · charter ${slice.charterLockComplete ? "locked" : "open"}`
      : `Steady-state locked · GO ${slice.goDecision ?? "GO"}`,
    launchWizardHref: slice.launchWizardHref,
    platformOpsHref: slice.platformOpsHref,
    improvementLoopHref: slice.improvementLoopHref,
    todayHref: slice.todayHref,
    integrityValidateCommand: slice.integrityValidateCommand,
    governanceBundlesCertCommand: slice.governanceBundlesCertCommand,
    commercialPilotRunbookCertCommand: slice.commercialPilotRunbookCertCommand,
  };
}

export function launchWizardEra25SteadyStateOperatorLoopLockHref(): string {
  return `/dashboard/launch-wizard${LAUNCH_WIZARD_ERA25_STEADY_STATE_OPERATOR_LOOP_LOCK_ANCHOR}`;
}
