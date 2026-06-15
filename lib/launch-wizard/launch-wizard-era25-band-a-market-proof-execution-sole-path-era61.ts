/**
 * Launch Wizard — era25 Band A market proof execution sole-path integrity.
 */
import type { Era25BandAMarketProofExecutionSolePathEra25UiSlice } from "@/lib/commercial/era25-band-a-market-proof-execution-sole-path-ui-era25";

export const LAUNCH_WIZARD_ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_ERA61_POLICY_ID =
  "era61-launch-wizard-era25-band-a-market-proof-execution-sole-path-v1" as const;

export const LAUNCH_WIZARD_ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_ANCHOR =
  "#launch-wizard-era25-band-a-market-proof-execution-sole-path" as const;

export type LaunchWizardEra25BandAMarketProofExecutionSolePathSlice = {
  policyId: typeof LAUNCH_WIZARD_ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_ERA61_POLICY_ID;
  visible: boolean;
  goDecision: string;
  customerName: string | null;
  era25BandAMarketProofExecutionSolePathIntegrityFailed: boolean;
  era25ConvergenceGovernanceTerminusFreezeIntegrityFailed: boolean;
  solePathBlocked: boolean;
  bandAExecutionSolePathLocked: boolean;
  frozenEnvMutationDetected: boolean;
  p0ProofStatus: string | null;
  progressLabel: string;
  launchWizardHref: string;
  platformOpsHref: string;
  p0OpsVaultHref: string;
  improvementLoopHref: string;
  todayHref: string;
  integrityValidateCommand: string;
  governanceBundlesCertCommand: string;
  commercialPilotRunbookCertCommand: string;
};

export function buildLaunchWizardEra25BandAMarketProofExecutionSolePathSlice(
  slice: Era25BandAMarketProofExecutionSolePathEra25UiSlice | null,
  customerName?: string | null,
): LaunchWizardEra25BandAMarketProofExecutionSolePathSlice | null {
  if (!slice) return null;

  const attentionNeeded = slice.solePathBlocked;

  return {
    policyId: LAUNCH_WIZARD_ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_ERA61_POLICY_ID,
    visible: true,
    goDecision: slice.goDecision ?? "NO-GO",
    customerName: customerName ?? null,
    era25BandAMarketProofExecutionSolePathIntegrityFailed:
      !slice.era25BandAMarketProofExecutionSolePathIntegrityPassed,
    era25ConvergenceGovernanceTerminusFreezeIntegrityFailed:
      !slice.era25ConvergenceGovernanceTerminusFreezeIntegrityPassed,
    solePathBlocked: slice.solePathBlocked,
    bandAExecutionSolePathLocked: slice.bandAExecutionSolePathLocked,
    frozenEnvMutationDetected: slice.frozenEnvMutationDetected,
    p0ProofStatus: slice.p0ProofStatus,
    progressLabel: attentionNeeded
      ? slice.frozenEnvMutationDetected
        ? "Frozen env mutation · clear era25 governance attest keys"
        : slice.p0ProofReferencedInSolePath && slice.p0ProofStatus !== "proof_passed"
          ? "P0 proof_passed referenced · artifact not honest"
          : `Sole-path pending · terminus ${slice.terminusFreezeComplete ? "frozen" : "open"}`
      : `Band A locked · P0 ${slice.p0ProofStatus ?? "ops vault"}`,
    launchWizardHref: slice.launchWizardHref,
    platformOpsHref: slice.platformOpsHref,
    p0OpsVaultHref: slice.p0OpsVaultHref,
    improvementLoopHref: slice.improvementLoopHref,
    todayHref: slice.todayHref,
    integrityValidateCommand: slice.integrityValidateCommand,
    governanceBundlesCertCommand: slice.governanceBundlesCertCommand,
    commercialPilotRunbookCertCommand: slice.commercialPilotRunbookCertCommand,
  };
}

export function launchWizardEra25BandAMarketProofExecutionSolePathHref(): string {
  return `/dashboard/launch-wizard${LAUNCH_WIZARD_ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_ANCHOR}`;
}
