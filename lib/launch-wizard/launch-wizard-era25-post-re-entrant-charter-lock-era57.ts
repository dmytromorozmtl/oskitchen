/**
 * Launch Wizard — era25 post-re-entrant operator charter lock integrity.
 */
import type { Era25PostReentrantCharterLockEra25UiSlice } from "@/lib/commercial/era25-post-re-entrant-charter-lock-ui-era25";

export const LAUNCH_WIZARD_ERA25_POST_REENTRANT_CHARTER_LOCK_ERA57_POLICY_ID =
  "era57-launch-wizard-era25-post-re-entrant-charter-lock-v1" as const;

export const LAUNCH_WIZARD_ERA25_POST_REENTRANT_CHARTER_LOCK_ANCHOR =
  "#launch-wizard-era25-post-re-entrant-charter-lock" as const;

export type LaunchWizardEra25PostReentrantCharterLockSlice = {
  policyId: typeof LAUNCH_WIZARD_ERA25_POST_REENTRANT_CHARTER_LOCK_ERA57_POLICY_ID;
  visible: boolean;
  goDecision: string;
  customerName: string | null;
  era25PostReentrantCharterLockIntegrityFailed: boolean;
  sustainedProductEvolutionReentrantIntegrityFailed: boolean;
  charterLockBlocked: boolean;
  frozenEnvMutationDetected: boolean;
  progressLabel: string;
  launchWizardHref: string;
  platformOpsHref: string;
  improvementLoopHref: string;
  todayHref: string;
  integrityValidateCommand: string;
  governanceBundlesCertCommand: string;
};

export function buildLaunchWizardEra25PostReentrantCharterLockSlice(
  slice: Era25PostReentrantCharterLockEra25UiSlice | null,
  customerName?: string | null,
): LaunchWizardEra25PostReentrantCharterLockSlice | null {
  if (!slice) return null;

  const attentionNeeded = slice.charterLockBlocked;

  return {
    policyId: LAUNCH_WIZARD_ERA25_POST_REENTRANT_CHARTER_LOCK_ERA57_POLICY_ID,
    visible: true,
    goDecision: slice.goDecision ?? "NO-GO",
    customerName: customerName ?? null,
    era25PostReentrantCharterLockIntegrityFailed: !slice.era25PostReentrantCharterLockIntegrityPassed,
    sustainedProductEvolutionReentrantIntegrityFailed:
      !slice.sustainedProductEvolutionReentrantIntegrityPassed,
    charterLockBlocked: slice.charterLockBlocked,
    frozenEnvMutationDetected: slice.frozenEnvMutationDetected,
    progressLabel: attentionNeeded
      ? slice.frozenEnvMutationDetected
        ? "Frozen env mutation detected · clear era25 attest keys"
        : `Charter lock pending · re-entrant ${slice.reentrantComplete ? "closed" : "open"}`
      : `Charter locked · GO ${slice.goDecision ?? "GO"}`,
    launchWizardHref: slice.launchWizardHref,
    platformOpsHref: slice.platformOpsHref,
    improvementLoopHref: slice.improvementLoopHref,
    todayHref: slice.todayHref,
    integrityValidateCommand: slice.integrityValidateCommand,
    governanceBundlesCertCommand: slice.governanceBundlesCertCommand,
  };
}

export function launchWizardEra25PostReentrantCharterLockHref(): string {
  return `/dashboard/launch-wizard${LAUNCH_WIZARD_ERA25_POST_REENTRANT_CHARTER_LOCK_ANCHOR}`;
}
