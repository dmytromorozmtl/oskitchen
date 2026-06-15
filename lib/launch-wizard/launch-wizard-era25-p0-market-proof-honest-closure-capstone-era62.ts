/**
 * Launch Wizard — era25 P0 market proof honest closure capstone integrity.
 */
import type { Era25P0MarketProofHonestClosureCapstoneEra25UiSlice } from "@/lib/commercial/era25-p0-market-proof-honest-closure-capstone-ui-era25";

export const LAUNCH_WIZARD_ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_ERA62_POLICY_ID =
  "era62-launch-wizard-era25-p0-market-proof-honest-closure-capstone-v1" as const;

export const LAUNCH_WIZARD_ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_ANCHOR =
  "#launch-wizard-era25-p0-market-proof-honest-closure-capstone" as const;

export type LaunchWizardEra25P0MarketProofHonestClosureCapstoneSlice = {
  policyId: typeof LAUNCH_WIZARD_ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_ERA62_POLICY_ID;
  visible: boolean;
  goDecision: string;
  customerName: string | null;
  era25P0MarketProofHonestClosureCapstoneIntegrityFailed: boolean;
  era25BandAMarketProofExecutionSolePathIntegrityFailed: boolean;
  closureCapstoneBlocked: boolean;
  era25MarketProofGovernanceChainClosed: boolean;
  p0ArtifactProofPassed: boolean;
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

export function buildLaunchWizardEra25P0MarketProofHonestClosureCapstoneSlice(
  slice: Era25P0MarketProofHonestClosureCapstoneEra25UiSlice | null,
  customerName?: string | null,
): LaunchWizardEra25P0MarketProofHonestClosureCapstoneSlice | null {
  if (!slice) return null;

  const attentionNeeded = slice.closureCapstoneBlocked;

  return {
    policyId: LAUNCH_WIZARD_ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_ERA62_POLICY_ID,
    visible: true,
    goDecision: slice.goDecision ?? "NO-GO",
    customerName: customerName ?? null,
    era25P0MarketProofHonestClosureCapstoneIntegrityFailed:
      !slice.era25P0MarketProofHonestClosureCapstoneIntegrityPassed,
    era25BandAMarketProofExecutionSolePathIntegrityFailed:
      !slice.era25BandAMarketProofExecutionSolePathIntegrityPassed,
    closureCapstoneBlocked: slice.closureCapstoneBlocked,
    era25MarketProofGovernanceChainClosed: slice.era25MarketProofGovernanceChainClosed,
    p0ArtifactProofPassed: slice.p0ArtifactProofPassed,
    frozenEnvMutationDetected: slice.frozenEnvMutationDetected,
    p0ProofStatus: slice.p0ProofStatus,
    progressLabel: attentionNeeded
      ? slice.frozenEnvMutationDetected
        ? "Frozen env mutation · clear era25 governance attest keys"
        : !slice.p0ArtifactProofPassed
          ? "Awaiting P0 artifact proof_passed"
          : `Closure pending · sole-path ${slice.bandAExecutionSolePathLocked ? "locked" : "open"}`
      : "P0 closure capstone complete · era25 Band A governance closed",
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

export function launchWizardEra25P0MarketProofHonestClosureCapstoneHref(): string {
  return `/dashboard/launch-wizard${LAUNCH_WIZARD_ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_ANCHOR}`;
}
