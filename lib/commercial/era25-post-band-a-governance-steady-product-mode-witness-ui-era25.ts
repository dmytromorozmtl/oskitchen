/**
 * Era25 post-band-a-governance steady product mode witness UI slice.
 */
import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import type { Era25BandAGovernanceChainCapstoneWitnessIntegritySummary } from "@/lib/commercial/era25-band-a-governance-chain-capstone-witness-integrity-era66";
import { evaluateEra25PostBandAGovernanceSteadyProductModeWitnessIntegrity } from "@/lib/commercial/era25-post-band-a-governance-steady-product-mode-witness-integrity-era67";
import {
  ERA25_POST_BAND_A_GOVERNANCE_STEADY_PRODUCT_MODE_WITNESS_DOC,
  ERA25_POST_BAND_A_GOVERNANCE_STEADY_PRODUCT_MODE_WITNESS_FOREVER_COMMANDS,
  ERA25_POST_BAND_A_GOVERNANCE_STEADY_PRODUCT_MODE_WITNESS_GUARDRAILS,
  ERA25_POST_BAND_A_GOVERNANCE_STEADY_PRODUCT_MODE_WITNESS_BACKLOG_ID,
  ERA25_POST_BAND_A_GOVERNANCE_STEADY_PRODUCT_MODE_WITNESS_PLATFORM_ANCHOR,
  detectEra25PostBandAGovernanceSteadyProductModeWitnessStarted,
} from "@/lib/commercial/era25-post-band-a-governance-steady-product-mode-witness-phases-era67";
import type { InvestorNarrativeOnepagerSummary } from "@/lib/commercial/investor-narrative-onepager-summary";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { PilotCaseStudyDraftSummary } from "@/lib/commercial/pilot-case-study-draft-summary";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { PilotMetricsBaselineSummary } from "@/lib/commercial/pilot-metrics-baseline-summary";
import type { PilotRollbackDrillSummary } from "@/lib/commercial/pilot-rollback-drill-summary";
import type { Tier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";
import { SERIES_A_PLATFORM_OPS_ROUTE } from "@/lib/commercial/sustained-operational-excellence-phases-era21";
import { LAUNCH_WIZARD_ROUTE } from "@/lib/launch-wizard/launch-wizard-era19-policy";
import { LAUNCH_WIZARD_ERA25_POST_BAND_A_GOVERNANCE_STEADY_PRODUCT_MODE_WITNESS_ANCHOR } from "@/lib/launch-wizard/launch-wizard-era25-post-band-a-governance-steady-product-mode-witness-era67";

export const ERA25_POST_BAND_A_GOVERNANCE_STEADY_PRODUCT_MODE_WITNESS_ERA25_UI_POLICY_ID =
  "era25-post-band-a-governance-steady-product-mode-witness-ui-v1" as const;

export type Era25PostBandAGovernanceSteadyProductModeWitnessEra25UiSlice = {
  policyId: typeof ERA25_POST_BAND_A_GOVERNANCE_STEADY_PRODUCT_MODE_WITNESS_ERA25_UI_POLICY_ID;
  visible: boolean;
  era25MarketProofGovernanceChainClosed: boolean;
  steadyProductModeWitnessBlocked: boolean;
  steadyProductModeWitnessComplete: boolean;
  postBandAGovernanceSteadyProductModeWitnessActive: boolean;
  bandAGovernanceChainCapstoneWitnessActive: boolean;
  era25GovernanceTrainSealed: boolean;
  governanceReopenClaimed: boolean;
  continuousImprovementLoopIntegrityPassed: boolean;
  p0ProofStatus: string | null;
  p0ArtifactProofPassed: boolean;
  goDecision: string | null;
  convergenceDoc: typeof ERA25_POST_BAND_A_GOVERNANCE_STEADY_PRODUCT_MODE_WITNESS_DOC;
  backlogId: typeof ERA25_POST_BAND_A_GOVERNANCE_STEADY_PRODUCT_MODE_WITNESS_BACKLOG_ID;
  guardrails: typeof ERA25_POST_BAND_A_GOVERNANCE_STEADY_PRODUCT_MODE_WITNESS_GUARDRAILS;
  foreverCommands: typeof ERA25_POST_BAND_A_GOVERNANCE_STEADY_PRODUCT_MODE_WITNESS_FOREVER_COMMANDS;
  integrityValidateCommand: string;
  syncIntegrityBaselineCommand: string;
  validateCapstoneWitnessIntegrityCommand: string;
  validateImprovementLoopIntegrityCommand: string;
  governanceBundlesCertCommand: string;
  commercialPilotRunbookCertCommand: string;
  era25PostBandAGovernanceSteadyProductModeWitnessIntegrityPassed: boolean;
  era25BandAGovernanceChainCapstoneWitnessIntegrityPassed: boolean;
  launchWizardHref: string;
  platformOpsHref: string;
  improvementLoopHref: string;
  commercialOpsHref: string;
  todayHref: string;
  headline: string;
};

export function buildEra25PostBandAGovernanceSteadyProductModeWitnessEra25UiSlice(input: {
  era25BandAGovernanceChainCapstoneWitnessVisible: boolean;
  era25MarketProofGovernanceChainClosed: boolean;
  bandAGovernanceChainCapstoneWitnessActive: boolean;
  era25GovernanceTrainSealed: boolean;
  env?: NodeJS.ProcessEnv;
  goNoGoSummary?: PilotGoNoGoSummary | null;
  p0Staging?: P0StagingProofUnblockSummary | null;
  tier2Summary?: Tier2StagingGoldenPathSummary | null;
  metricsBaseline?: PilotMetricsBaselineSummary | null;
  caseStudyDraft?: PilotCaseStudyDraftSummary | null;
  investorOnepager?: InvestorNarrativeOnepagerSummary | null;
  rollbackDrill?: PilotRollbackDrillSummary | null;
  competitorMatrix?: CompetitorFeatureGapMatrixSummary | null;
  p0ProofStatus?: string | null;
  tier2ProofStatus?: string | null;
  capstoneIntegritySummary?: Era25BandAGovernanceChainCapstoneWitnessIntegritySummary | null;
}): Era25PostBandAGovernanceSteadyProductModeWitnessEra25UiSlice | null {
  const env = input.env ?? process.env;
  const steadyProductModeWitnessStarted =
    detectEra25PostBandAGovernanceSteadyProductModeWitnessStarted(env);

  if (!input.era25BandAGovernanceChainCapstoneWitnessVisible && !steadyProductModeWitnessStarted) {
    return null;
  }

  const p0ProofStatus = input.p0ProofStatus ?? input.p0Staging?.p0ProofStatus ?? null;
  const tier2ProofStatus = input.tier2ProofStatus ?? input.tier2Summary?.tier2ProofStatus ?? null;

  const steadyProductModeWitnessIntegrity =
    evaluateEra25PostBandAGovernanceSteadyProductModeWitnessIntegrity(process.cwd(), {
      env,
      goNoGoOverride: input.goNoGoSummary ?? null,
      p0StagingOverride: input.p0Staging ?? null,
      tier2SummaryOverride: input.tier2Summary ?? null,
      metricsBaselineOverride: input.metricsBaseline ?? null,
      caseStudyDraftOverride: input.caseStudyDraft ?? null,
      investorOnepagerOverride: input.investorOnepager ?? null,
      rollbackDrillOverride: input.rollbackDrill ?? null,
      competitorMatrixOverride: input.competitorMatrix ?? null,
      p0ProofStatusOverride: p0ProofStatus,
      tier2ProofStatusOverride: tier2ProofStatus,
      capstoneIntegrityOverride: input.capstoneIntegritySummary ?? null,
    });

  const steadyProductModeWitnessComplete =
    steadyProductModeWitnessIntegrity.era25PostBandAGovernanceSteadyProductModeWitnessComplete;
  const steadyProductModeWitnessBlocked = !steadyProductModeWitnessComplete;

  const headline = steadyProductModeWitnessComplete
    ? "Post-governance steady product mode witness active · improvement loop + honest commercial artifacts only"
    : input.bandAGovernanceChainCapstoneWitnessActive
      ? steadyProductModeWitnessIntegrity.governanceReopenClaimed
        ? "Steady product mode witness blocked · era25 governance reopen env detected — clear frozen keys"
        : !steadyProductModeWitnessIntegrity.continuousImprovementLoopIntegrityPassed
          ? "Steady product mode witness blocked · improvement loop integrity FAIL"
          : "Awaiting post-governance steady product mode witness after Band A capstone"
      : "Awaiting Band A capstone witness before steady product mode witness";

  return {
    policyId: ERA25_POST_BAND_A_GOVERNANCE_STEADY_PRODUCT_MODE_WITNESS_ERA25_UI_POLICY_ID,
    visible: true,
    era25MarketProofGovernanceChainClosed: input.era25MarketProofGovernanceChainClosed,
    steadyProductModeWitnessBlocked,
    steadyProductModeWitnessComplete,
    postBandAGovernanceSteadyProductModeWitnessActive:
      steadyProductModeWitnessIntegrity.postBandAGovernanceSteadyProductModeWitnessActive,
    bandAGovernanceChainCapstoneWitnessActive:
      steadyProductModeWitnessIntegrity.bandAGovernanceChainCapstoneWitnessActive,
    era25GovernanceTrainSealed: steadyProductModeWitnessIntegrity.era25GovernanceTrainSealed,
    governanceReopenClaimed: steadyProductModeWitnessIntegrity.governanceReopenClaimed,
    continuousImprovementLoopIntegrityPassed:
      steadyProductModeWitnessIntegrity.continuousImprovementLoopIntegrityPassed,
    p0ProofStatus: steadyProductModeWitnessIntegrity.p0ProofStatus,
    p0ArtifactProofPassed: steadyProductModeWitnessIntegrity.p0ArtifactProofPassed,
    goDecision: steadyProductModeWitnessIntegrity.goDecision,
    convergenceDoc: ERA25_POST_BAND_A_GOVERNANCE_STEADY_PRODUCT_MODE_WITNESS_DOC,
    backlogId: ERA25_POST_BAND_A_GOVERNANCE_STEADY_PRODUCT_MODE_WITNESS_BACKLOG_ID,
    guardrails: ERA25_POST_BAND_A_GOVERNANCE_STEADY_PRODUCT_MODE_WITNESS_GUARDRAILS,
    foreverCommands: ERA25_POST_BAND_A_GOVERNANCE_STEADY_PRODUCT_MODE_WITNESS_FOREVER_COMMANDS,
    integrityValidateCommand:
      "npm run ops:validate-era25-post-band-a-governance-steady-product-mode-witness-integrity -- --json",
    syncIntegrityBaselineCommand:
      "npm run ops:sync-era25-post-band-a-governance-steady-product-mode-witness-integrity-baseline -- --write",
    validateCapstoneWitnessIntegrityCommand:
      "npm run ops:validate-era25-band-a-governance-chain-capstone-witness-integrity -- --json",
    validateImprovementLoopIntegrityCommand:
      "npm run ops:validate-continuous-improvement-loop-integrity -- --json",
    governanceBundlesCertCommand: "npm run test:ci:governance-bundles",
    commercialPilotRunbookCertCommand: "npm run test:ci:commercial-pilot-runbook:cert",
    era25PostBandAGovernanceSteadyProductModeWitnessIntegrityPassed:
      steadyProductModeWitnessIntegrity.integrityPassed,
    era25BandAGovernanceChainCapstoneWitnessIntegrityPassed:
      steadyProductModeWitnessIntegrity.era25BandAGovernanceChainCapstoneWitnessIntegrityPassed,
    launchWizardHref: `${LAUNCH_WIZARD_ROUTE}${LAUNCH_WIZARD_ERA25_POST_BAND_A_GOVERNANCE_STEADY_PRODUCT_MODE_WITNESS_ANCHOR}`,
    platformOpsHref: `${SERIES_A_PLATFORM_OPS_ROUTE}${ERA25_POST_BAND_A_GOVERNANCE_STEADY_PRODUCT_MODE_WITNESS_PLATFORM_ANCHOR}`,
    improvementLoopHref: `${SERIES_A_PLATFORM_OPS_ROUTE}#continuous-improvement-loop`,
    commercialOpsHref: `${SERIES_A_PLATFORM_OPS_ROUTE}#commercial-pilot-ops`,
    todayHref: "/dashboard/today",
    headline,
  };
}

export function formatEra25PostBandAGovernanceSteadyProductModeWitnessEra25Label(
  slice: Era25PostBandAGovernanceSteadyProductModeWitnessEra25UiSlice,
): string {
  const status = slice.steadyProductModeWitnessBlocked ? "BLOCKED" : "STEADY";
  const mode = slice.postBandAGovernanceSteadyProductModeWitnessActive
    ? "product mode"
    : "pending";
  return `era25 steady product mode witness · ${status} · ${mode}`;
}
