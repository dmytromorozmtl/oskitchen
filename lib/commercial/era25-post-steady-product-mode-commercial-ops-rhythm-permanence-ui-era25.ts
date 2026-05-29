/**
 * Era25 post-steady-product-mode commercial ops rhythm permanence UI slice.
 */
import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import type { Era25BandAGovernanceChainCapstoneWitnessIntegritySummary } from "@/lib/commercial/era25-band-a-governance-chain-capstone-witness-integrity-era66";
import { evaluateEra25PostSteadyProductModeCommercialOpsRhythmPermanenceIntegrity } from "@/lib/commercial/era25-post-steady-product-mode-commercial-ops-rhythm-permanence-integrity-era68";
import type { Era25PostBandAGovernanceSteadyProductModeWitnessIntegritySummary } from "@/lib/commercial/era25-post-band-a-governance-steady-product-mode-witness-integrity-era67";
import {
  ERA25_POST_STEADY_PRODUCT_MODE_COMMERCIAL_OPS_RHYTHM_PERMANENCE_DOC,
  ERA25_POST_STEADY_PRODUCT_MODE_COMMERCIAL_OPS_RHYTHM_PERMANENCE_FOREVER_COMMANDS,
  ERA25_POST_STEADY_PRODUCT_MODE_COMMERCIAL_OPS_RHYTHM_PERMANENCE_GUARDRAILS,
  ERA25_POST_STEADY_PRODUCT_MODE_COMMERCIAL_OPS_RHYTHM_PERMANENCE_BACKLOG_ID,
  ERA25_POST_STEADY_PRODUCT_MODE_COMMERCIAL_OPS_RHYTHM_PERMANENCE_PLATFORM_ANCHOR,
  detectEra25PostSteadyProductModeCommercialOpsRhythmPermanenceStarted,
} from "@/lib/commercial/era25-post-steady-product-mode-commercial-ops-rhythm-permanence-phases-era68";
import type { InvestorNarrativeOnepagerSummary } from "@/lib/commercial/investor-narrative-onepager-summary";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { PilotCaseStudyDraftSummary } from "@/lib/commercial/pilot-case-study-draft-summary";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { PilotMetricsBaselineSummary } from "@/lib/commercial/pilot-metrics-baseline-summary";
import type { PilotRollbackDrillSummary } from "@/lib/commercial/pilot-rollback-drill-summary";
import type { Tier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";
import { SERIES_A_PLATFORM_OPS_ROUTE } from "@/lib/commercial/sustained-operational-excellence-phases-era21";
import { LAUNCH_WIZARD_ROUTE } from "@/lib/launch-wizard/launch-wizard-era19-policy";
import { LAUNCH_WIZARD_ERA25_POST_STEADY_PRODUCT_MODE_COMMERCIAL_OPS_RHYTHM_PERMANENCE_ANCHOR } from "@/lib/launch-wizard/launch-wizard-era25-post-steady-product-mode-commercial-ops-rhythm-permanence-era68";

export const ERA25_POST_STEADY_PRODUCT_MODE_COMMERCIAL_OPS_RHYTHM_PERMANENCE_ERA25_UI_POLICY_ID =
  "era25-post-steady-product-mode-commercial-ops-rhythm-permanence-ui-v1" as const;

export type Era25PostSteadyProductModeCommercialOpsRhythmPermanenceEra25UiSlice = {
  policyId: typeof ERA25_POST_STEADY_PRODUCT_MODE_COMMERCIAL_OPS_RHYTHM_PERMANENCE_ERA25_UI_POLICY_ID;
  visible: boolean;
  era25MarketProofGovernanceChainClosed: boolean;
  rhythmPermanenceBlocked: boolean;
  rhythmPermanenceComplete: boolean;
  postSteadyProductModeCommercialOpsRhythmPermanenceActive: boolean;
  postBandAGovernanceSteadyProductModeWitnessActive: boolean;
  era25GovernanceTrainSealed: boolean;
  governanceReopenClaimed: boolean;
  continuousImprovementLoopIntegrityPassed: boolean;
  p0ProofStatus: string | null;
  p0ArtifactProofPassed: boolean;
  goDecision: string | null;
  convergenceDoc: typeof ERA25_POST_STEADY_PRODUCT_MODE_COMMERCIAL_OPS_RHYTHM_PERMANENCE_DOC;
  backlogId: typeof ERA25_POST_STEADY_PRODUCT_MODE_COMMERCIAL_OPS_RHYTHM_PERMANENCE_BACKLOG_ID;
  guardrails: typeof ERA25_POST_STEADY_PRODUCT_MODE_COMMERCIAL_OPS_RHYTHM_PERMANENCE_GUARDRAILS;
  foreverCommands: typeof ERA25_POST_STEADY_PRODUCT_MODE_COMMERCIAL_OPS_RHYTHM_PERMANENCE_FOREVER_COMMANDS;
  integrityValidateCommand: string;
  syncIntegrityBaselineCommand: string;
  validateSteadyProductModeWitnessIntegrityCommand: string;
  validateImprovementLoopIntegrityCommand: string;
  governanceBundlesCertCommand: string;
  commercialPilotRunbookCertCommand: string;
  era25PostSteadyProductModeCommercialOpsRhythmPermanenceIntegrityPassed: boolean;
  era25PostBandAGovernanceSteadyProductModeWitnessIntegrityPassed: boolean;
  launchWizardHref: string;
  platformOpsHref: string;
  improvementLoopHref: string;
  commercialOpsHref: string;
  todayHref: string;
  headline: string;
};

export function buildEra25PostSteadyProductModeCommercialOpsRhythmPermanenceEra25UiSlice(input: {
  era25PostBandAGovernanceSteadyProductModeWitnessVisible: boolean;
  era25MarketProofGovernanceChainClosed: boolean;
  postBandAGovernanceSteadyProductModeWitnessActive: boolean;
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
  steadyProductModeIntegritySummary?: Era25PostBandAGovernanceSteadyProductModeWitnessIntegritySummary | null;
}): Era25PostSteadyProductModeCommercialOpsRhythmPermanenceEra25UiSlice | null {
  const env = input.env ?? process.env;
  const rhythmPermanenceStarted =
    detectEra25PostSteadyProductModeCommercialOpsRhythmPermanenceStarted(env);

  if (
    !input.era25PostBandAGovernanceSteadyProductModeWitnessVisible &&
    !rhythmPermanenceStarted
  ) {
    return null;
  }

  const p0ProofStatus = input.p0ProofStatus ?? input.p0Staging?.p0ProofStatus ?? null;
  const tier2ProofStatus = input.tier2ProofStatus ?? input.tier2Summary?.tier2ProofStatus ?? null;

  const rhythmPermanenceIntegrity = evaluateEra25PostSteadyProductModeCommercialOpsRhythmPermanenceIntegrity(
    process.cwd(),
    {
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
      steadyProductModeIntegrityOverride: input.steadyProductModeIntegritySummary ?? null,
    },
  );

  const rhythmPermanenceComplete =
    rhythmPermanenceIntegrity.era25PostSteadyProductModeCommercialOpsRhythmPermanenceComplete;
  const rhythmPermanenceBlocked = !rhythmPermanenceComplete;

  const headline = rhythmPermanenceComplete
    ? "Commercial ops rhythm permanence active · honest GO/commercial artifacts forever · improvement loop only"
    : input.postBandAGovernanceSteadyProductModeWitnessActive
      ? rhythmPermanenceIntegrity.governanceReopenClaimed
        ? "Rhythm permanence blocked · era25 governance reopen env detected — clear frozen keys"
        : !rhythmPermanenceIntegrity.continuousImprovementLoopIntegrityPassed
          ? "Rhythm permanence blocked · improvement loop integrity FAIL"
          : "Awaiting commercial ops rhythm permanence after steady product mode witness"
      : "Awaiting steady product mode witness before commercial ops rhythm permanence";

  return {
    policyId: ERA25_POST_STEADY_PRODUCT_MODE_COMMERCIAL_OPS_RHYTHM_PERMANENCE_ERA25_UI_POLICY_ID,
    visible: true,
    era25MarketProofGovernanceChainClosed: input.era25MarketProofGovernanceChainClosed,
    rhythmPermanenceBlocked,
    rhythmPermanenceComplete,
    postSteadyProductModeCommercialOpsRhythmPermanenceActive:
      rhythmPermanenceIntegrity.postSteadyProductModeCommercialOpsRhythmPermanenceActive,
    postBandAGovernanceSteadyProductModeWitnessActive:
      rhythmPermanenceIntegrity.postBandAGovernanceSteadyProductModeWitnessActive,
    era25GovernanceTrainSealed: rhythmPermanenceIntegrity.era25GovernanceTrainSealed,
    governanceReopenClaimed: rhythmPermanenceIntegrity.governanceReopenClaimed,
    continuousImprovementLoopIntegrityPassed:
      rhythmPermanenceIntegrity.continuousImprovementLoopIntegrityPassed,
    p0ProofStatus: rhythmPermanenceIntegrity.p0ProofStatus,
    p0ArtifactProofPassed: rhythmPermanenceIntegrity.p0ArtifactProofPassed,
    goDecision: rhythmPermanenceIntegrity.goDecision,
    convergenceDoc: ERA25_POST_STEADY_PRODUCT_MODE_COMMERCIAL_OPS_RHYTHM_PERMANENCE_DOC,
    backlogId: ERA25_POST_STEADY_PRODUCT_MODE_COMMERCIAL_OPS_RHYTHM_PERMANENCE_BACKLOG_ID,
    guardrails: ERA25_POST_STEADY_PRODUCT_MODE_COMMERCIAL_OPS_RHYTHM_PERMANENCE_GUARDRAILS,
    foreverCommands: ERA25_POST_STEADY_PRODUCT_MODE_COMMERCIAL_OPS_RHYTHM_PERMANENCE_FOREVER_COMMANDS,
    integrityValidateCommand:
      "npm run ops:validate-era25-post-steady-product-mode-commercial-ops-rhythm-permanence-integrity -- --json",
    syncIntegrityBaselineCommand:
      "npm run ops:sync-era25-post-steady-product-mode-commercial-ops-rhythm-permanence-integrity-baseline -- --write",
    validateSteadyProductModeWitnessIntegrityCommand:
      "npm run ops:validate-era25-post-band-a-governance-steady-product-mode-witness-integrity -- --json",
    validateImprovementLoopIntegrityCommand:
      "npm run ops:validate-continuous-improvement-loop-integrity -- --json",
    governanceBundlesCertCommand: "npm run test:ci:governance-bundles",
    commercialPilotRunbookCertCommand: "npm run test:ci:commercial-pilot-runbook:cert",
    era25PostSteadyProductModeCommercialOpsRhythmPermanenceIntegrityPassed:
      rhythmPermanenceIntegrity.integrityPassed,
    era25PostBandAGovernanceSteadyProductModeWitnessIntegrityPassed:
      rhythmPermanenceIntegrity.era25PostBandAGovernanceSteadyProductModeWitnessIntegrityPassed,
    launchWizardHref: `${LAUNCH_WIZARD_ROUTE}${LAUNCH_WIZARD_ERA25_POST_STEADY_PRODUCT_MODE_COMMERCIAL_OPS_RHYTHM_PERMANENCE_ANCHOR}`,
    platformOpsHref: `${SERIES_A_PLATFORM_OPS_ROUTE}${ERA25_POST_STEADY_PRODUCT_MODE_COMMERCIAL_OPS_RHYTHM_PERMANENCE_PLATFORM_ANCHOR}`,
    improvementLoopHref: `${SERIES_A_PLATFORM_OPS_ROUTE}#continuous-improvement-loop`,
    commercialOpsHref: `${SERIES_A_PLATFORM_OPS_ROUTE}#commercial-pilot-ops`,
    todayHref: "/dashboard/today",
    headline,
  };
}

export function formatEra25PostSteadyProductModeCommercialOpsRhythmPermanenceEra25Label(
  slice: Era25PostSteadyProductModeCommercialOpsRhythmPermanenceEra25UiSlice,
): string {
  const status = slice.rhythmPermanenceBlocked ? "BLOCKED" : "PERMANENT";
  const rhythm = slice.postSteadyProductModeCommercialOpsRhythmPermanenceActive
    ? "ops rhythm"
    : "pending";
  return `era25 commercial ops rhythm permanence · ${status} · ${rhythm}`;
}
