/**
 * Market leader positioning UI slice — Owner Briefing, Launch Wizard, Platform ops.
 */
import {
  resolveMarketLeaderPositioningMilestoneFromPhaseStatuses,
  type MarketLeaderPositioningMilestone,
} from "@/lib/commercial/market-leader-positioning-post-series-a-orchestrator-era21";
import { evaluateMarketLeaderPositioningIntegrity } from "@/lib/commercial/market-leader-positioning-integrity-era32";
import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import type { InvestorNarrativeOnepagerSummary } from "@/lib/commercial/investor-narrative-onepager-summary";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { PilotCaseStudyDraftSummary } from "@/lib/commercial/pilot-case-study-draft-summary";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { PilotMetricsBaselineSummary } from "@/lib/commercial/pilot-metrics-baseline-summary";
import type { PilotRollbackDrillSummary } from "@/lib/commercial/pilot-rollback-drill-summary";
import type { Tier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";
import {
  buildMarketLeaderPositioningPhaseStatuses,
  COMPETITOR_FEATURE_GAP_MATRIX_ARTIFACT_PATH,
  detectMarketLeaderPositioningStarted,
  formatMarketLeaderPositioningPhaseBlockerDetail,
  INVESTOR_NARRATIVE_ONEPAGER_ARTIFACT_PATH,
  MARKET_LEADER_POSITIONING_STEP8_DOC,
  PILOT_CASE_STUDY_DRAFT_ARTIFACT_PATH,
  PILOT_GONOGO_SUMMARY_ARTIFACT_PATH,
  PILOT_METRICS_BASELINE_ARTIFACT_PATH,
  PILOT_ROLLBACK_DRILL_ARTIFACT_PATH,
  P0_STAGING_PROOF_ARTIFACT_PATH,
  resolveMarketLeaderPositioningComplete,
  resolveMarketLeaderPositioningPrerequisites,
  resolveNextIncompleteMarketLeaderPositioningPhase,
  resolveSeriesACompleteForMarketLeader,
  SERIES_A_COMPETITOR_LEAPFROG_DOC,
  SERIES_A_FEATURE_MATURITY_DOC,
  SERIES_A_FORBIDDEN_CLAIMS_DOC,
  SERIES_A_GHOST_KITCHEN_LANDING_ROUTE,
  SERIES_A_MEAL_PREP_LANDING_ROUTE,
  SERIES_A_PLATFORM_OPS_ROUTE,
  TIER2_STAGING_GOLDEN_PATH_ARTIFACT_PATH,
  type MarketLeaderPositioningPhaseStatus,
} from "@/lib/commercial/market-leader-positioning-phases-era21";
import { LAUNCH_WIZARD_ROUTE } from "@/lib/launch-wizard/launch-wizard-era19-policy";
import { LAUNCH_WIZARD_COMMERCIAL_BLOCKERS_ANCHOR } from "@/lib/launch-wizard/launch-wizard-commercial-setup-era19-policy";

export const MARKET_LEADER_POSITIONING_UI_ERA21_POLICY_ID =
  "era21-market-leader-positioning-ui-v1" as const;

export const MARKET_LEADER_POSITIONING_PLATFORM_ANCHOR = "#market-leader-positioning" as const;

export type MarketLeaderPositioningUiSlice = {
  policyId: typeof MARKET_LEADER_POSITIONING_UI_ERA21_POLICY_ID;
  visible: boolean;
  blocked: boolean;
  goDecision: string;
  customerName: string | null;
  seriesAComplete: boolean;
  phases: readonly MarketLeaderPositioningPhaseStatus[];
  completedBlockingPhaseCount: number;
  blockingPhaseCount: number;
  marketLeaderComplete: boolean;
  step8Doc: typeof MARKET_LEADER_POSITIONING_STEP8_DOC;
  featureMaturityDoc: typeof SERIES_A_FEATURE_MATURITY_DOC;
  competitorLeapfrogDoc: typeof SERIES_A_COMPETITOR_LEAPFROG_DOC;
  forbiddenClaimsDoc: typeof SERIES_A_FORBIDDEN_CLAIMS_DOC;
  validateCommand: string;
  exportTemplateCommand: string;
  syncProgressReportCommand: string;
  postSeriesAOrchestratorCommand: string;
  seriesAExpansionExecutionCommand: string;
  seriesAExpansionExecutionArtifact: string;
  marketLeaderExecutionCommand: string;
  marketLeaderExecutionArtifact: string;
  exportReadinessChecklistCommand: string;
  validateSeriesACommand: string;
  validateSeriesAIntegrityCommand: string;
  integrityValidateCommand: string;
  syncIntegrityBaselineCommand: string;
  seriesAIntegrityPassed: boolean;
  marketLeaderIntegrityPassed: boolean;
  marketLeaderMilestone: MarketLeaderPositioningMilestone;
  todayHref: string;
  launchWizardHref: string;
  platformOpsHref: string;
  integrationHealthHref: string;
  implementationHref: string;
  reportsHref: string;
  ghostKitchenLandingHref: typeof SERIES_A_GHOST_KITCHEN_LANDING_ROUTE;
  mealPrepLandingHref: typeof SERIES_A_MEAL_PREP_LANDING_ROUTE;
  nextPhase: MarketLeaderPositioningPhaseStatus | null;
  nextPhaseDetail: string | null;
  goNoGoArtifact: typeof PILOT_GONOGO_SUMMARY_ARTIFACT_PATH;
  p0Artifact: typeof P0_STAGING_PROOF_ARTIFACT_PATH;
  tier2Artifact: typeof TIER2_STAGING_GOLDEN_PATH_ARTIFACT_PATH;
  metricsBaselineArtifact: typeof PILOT_METRICS_BASELINE_ARTIFACT_PATH;
  investorOnepagerArtifact: typeof INVESTOR_NARRATIVE_ONEPAGER_ARTIFACT_PATH;
  caseStudyDraftArtifact: typeof PILOT_CASE_STUDY_DRAFT_ARTIFACT_PATH;
  rollbackDrillArtifact: typeof PILOT_ROLLBACK_DRILL_ARTIFACT_PATH;
  competitorMatrixArtifact: typeof COMPETITOR_FEATURE_GAP_MATRIX_ARTIFACT_PATH;
};

export function buildMarketLeaderPositioningUiSlice(input: {
  goNoGoSummary: PilotGoNoGoSummary | null;
  p0ProofStatus?: string | null;
  tier2ProofStatus?: string | null;
  p0Staging?: P0StagingProofUnblockSummary | null;
  tier2Summary?: Tier2StagingGoldenPathSummary | null;
  metricsBaseline?: PilotMetricsBaselineSummary | null;
  caseStudyDraft?: PilotCaseStudyDraftSummary | null;
  investorOnepager?: InvestorNarrativeOnepagerSummary | null;
  rollbackDrill?: PilotRollbackDrillSummary | null;
  competitorMatrix?: CompetitorFeatureGapMatrixSummary | null;
  env?: NodeJS.ProcessEnv;
}): MarketLeaderPositioningUiSlice | null {
  const env = input.env ?? process.env;
  const metricsBaseline = input.metricsBaseline ?? null;
  const caseStudyDraft = input.caseStudyDraft ?? null;
  const investorOnepager = input.investorOnepager ?? null;
  const rollbackDrill = input.rollbackDrill ?? null;
  const competitorMatrix = input.competitorMatrix ?? null;
  const p0ProofStatus =
    input.p0ProofStatus ?? input.p0Staging?.p0ProofStatus ?? null;
  const tier2ProofStatus =
    input.tier2ProofStatus ?? input.tier2Summary?.tier2ProofStatus ?? null;

  const marketLeaderIntegrity = evaluateMarketLeaderPositioningIntegrity(process.cwd(), {
    env,
    goNoGoOverride: input.goNoGoSummary,
    p0StagingOverride: input.p0Staging ?? null,
    tier2SummaryOverride: input.tier2Summary ?? null,
    metricsBaselineOverride: metricsBaseline,
    caseStudyDraftOverride: caseStudyDraft,
    investorOnepagerOverride: investorOnepager,
    rollbackDrillOverride: rollbackDrill,
    competitorMatrixOverride: competitorMatrix,
    p0ProofStatusOverride: p0ProofStatus,
    tier2ProofStatusOverride: tier2ProofStatus,
  });

  const seriesACompleteFromPhases = resolveSeriesACompleteForMarketLeader({
    goNoGoSummary: input.goNoGoSummary,
    p0Staging: input.p0Staging ?? null,
    tier2Summary: input.tier2Summary ?? null,
    metricsBaseline,
    caseStudyDraft,
    investorOnepager,
    rollbackDrill,
    competitorMatrix,
    env,
  });
  const seriesAHonest = seriesACompleteFromPhases && marketLeaderIntegrity.seriesAIntegrityPassed;
  const goDecision = input.goNoGoSummary?.decision ?? null;
  const marketLeaderExecutionStarted = detectMarketLeaderPositioningStarted(env);

  if (!seriesACompleteFromPhases && !marketLeaderExecutionStarted) return null;

  const prerequisites = resolveMarketLeaderPositioningPrerequisites({
    goDecision: seriesACompleteFromPhases ? "GO" : goDecision,
    seriesAComplete: seriesACompleteFromPhases,
  });
  if (!prerequisites.prerequisitesComplete && !marketLeaderExecutionStarted) {
    return null;
  }

  const phases = seriesACompleteFromPhases
    ? buildMarketLeaderPositioningPhaseStatuses({
        prerequisites,
        goNoGoSummary: input.goNoGoSummary,
        p0Staging: input.p0Staging ?? null,
        tier2Summary: input.tier2Summary ?? null,
        metricsBaseline,
        caseStudyDraft,
        investorOnepager,
        rollbackDrill,
        competitorMatrix,
        env,
      })
    : [];
  const marketLeaderComplete = seriesACompleteFromPhases
    ? resolveMarketLeaderPositioningComplete(phases)
    : false;
  if (marketLeaderComplete && marketLeaderIntegrity.integrityPassed) return null;

  const blockingPhases = phases.filter((phase) => !phase.optional);
  const completedBlockingPhaseCount = blockingPhases.filter((phase) => phase.complete).length;
  const nextPhase = resolveNextIncompleteMarketLeaderPositioningPhase(phases);
  const nextPhaseDetail = nextPhase
    ? formatMarketLeaderPositioningPhaseBlockerDetail(nextPhase)
    : null;
  const marketLeaderMilestone = resolveMarketLeaderPositioningMilestoneFromPhaseStatuses(phases, {
    prerequisitesComplete: seriesACompleteFromPhases,
    seriesAComplete: seriesACompleteFromPhases,
    marketLeaderComplete: false,
  });

  return {
    policyId: MARKET_LEADER_POSITIONING_UI_ERA21_POLICY_ID,
    visible: true,
    blocked: true,
    goDecision: "GO",
    customerName: input.goNoGoSummary?.customerName ?? null,
    seriesAComplete: seriesACompleteFromPhases,
    phases,
    completedBlockingPhaseCount,
    blockingPhaseCount: blockingPhases.length,
    marketLeaderComplete: false,
    step8Doc: MARKET_LEADER_POSITIONING_STEP8_DOC,
    featureMaturityDoc: SERIES_A_FEATURE_MATURITY_DOC,
    competitorLeapfrogDoc: SERIES_A_COMPETITOR_LEAPFROG_DOC,
    forbiddenClaimsDoc: SERIES_A_FORBIDDEN_CLAIMS_DOC,
    validateCommand: "npm run ops:validate-market-leader-positioning-env",
    exportTemplateCommand: "npm run ops:export-market-leader-positioning-env-template -- --write",
    syncProgressReportCommand:
      "npm run ops:sync-market-leader-positioning-progress-report -- --write",
    postSeriesAOrchestratorCommand:
      "npm run ops:run-market-leader-positioning-post-series-a-orchestrator -- --write",
    seriesAExpansionExecutionCommand:
      "npm run ops:run-series-a-partner-expansion-execution -- --write",
    seriesAExpansionExecutionArtifact:
      "artifacts/series-a-partner-expansion-execution-summary.json",
    marketLeaderExecutionCommand: "npm run ops:run-market-leader-positioning-execution -- --write",
    marketLeaderExecutionArtifact: "artifacts/market-leader-positioning-execution-summary.json",
    exportReadinessChecklistCommand:
      "npm run ops:export-market-leader-positioning-readiness-checklist -- --write",
    validateSeriesACommand: "npm run ops:validate-series-a-partner-expansion-env -- --json",
    validateSeriesAIntegrityCommand:
      "npm run ops:validate-series-a-partner-expansion-integrity -- --json",
    integrityValidateCommand:
      "npm run ops:validate-market-leader-positioning-integrity -- --json",
    syncIntegrityBaselineCommand:
      "npm run ops:sync-market-leader-positioning-integrity-baseline -- --write",
    seriesAIntegrityPassed: marketLeaderIntegrity.seriesAIntegrityPassed,
    marketLeaderIntegrityPassed: marketLeaderIntegrity.integrityPassed,
    marketLeaderMilestone,
    todayHref: "/dashboard/today",
    launchWizardHref: `${LAUNCH_WIZARD_ROUTE}${LAUNCH_WIZARD_COMMERCIAL_BLOCKERS_ANCHOR}`,
    platformOpsHref: `${SERIES_A_PLATFORM_OPS_ROUTE}${MARKET_LEADER_POSITIONING_PLATFORM_ANCHOR}`,
    integrationHealthHref: "/dashboard/integration-health",
    implementationHref: "/dashboard/implementation",
    reportsHref: "/dashboard/reports",
    ghostKitchenLandingHref: SERIES_A_GHOST_KITCHEN_LANDING_ROUTE,
    mealPrepLandingHref: SERIES_A_MEAL_PREP_LANDING_ROUTE,
    nextPhase,
    nextPhaseDetail,
    goNoGoArtifact: PILOT_GONOGO_SUMMARY_ARTIFACT_PATH,
    p0Artifact: P0_STAGING_PROOF_ARTIFACT_PATH,
    tier2Artifact: TIER2_STAGING_GOLDEN_PATH_ARTIFACT_PATH,
    metricsBaselineArtifact: PILOT_METRICS_BASELINE_ARTIFACT_PATH,
    investorOnepagerArtifact: INVESTOR_NARRATIVE_ONEPAGER_ARTIFACT_PATH,
    caseStudyDraftArtifact: PILOT_CASE_STUDY_DRAFT_ARTIFACT_PATH,
    rollbackDrillArtifact: PILOT_ROLLBACK_DRILL_ARTIFACT_PATH,
    competitorMatrixArtifact: COMPETITOR_FEATURE_GAP_MATRIX_ARTIFACT_PATH,
  };
}

export function formatMarketLeaderPositioningProgressLabel(
  slice: MarketLeaderPositioningUiSlice,
): string {
  return `Market leader ${slice.completedBlockingPhaseCount}/${slice.blockingPhaseCount} pillars · ${slice.marketLeaderMilestone.replaceAll("_", " ")} · GO · ${slice.customerName ?? "customer"}`;
}
