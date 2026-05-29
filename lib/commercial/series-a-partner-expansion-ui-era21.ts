/**
 * Series A / partner expansion UI slice — Owner Briefing, Launch Wizard, Platform ops.
 */
import {
  resolveSeriesAPartnerExpansionMilestoneFromPhaseStatuses,
  type SeriesAPartnerExpansionMilestone,
} from "@/lib/commercial/series-a-partner-expansion-post-scale-orchestrator-era21";
import { evaluateSeriesAPartnerExpansionIntegrity } from "@/lib/commercial/series-a-partner-expansion-integrity-era31";
import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import type { InvestorNarrativeOnepagerSummary } from "@/lib/commercial/investor-narrative-onepager-summary";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { PilotCaseStudyDraftSummary } from "@/lib/commercial/pilot-case-study-draft-summary";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { PilotMetricsBaselineSummary } from "@/lib/commercial/pilot-metrics-baseline-summary";
import type { PilotRollbackDrillSummary } from "@/lib/commercial/pilot-rollback-drill-summary";
import type { Tier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";
import {
  buildSeriesAPartnerExpansionPhaseStatuses,
  COMPETITOR_FEATURE_GAP_MATRIX_ARTIFACT_PATH,
  detectSeriesAPartnerExpansionStarted,
  formatSeriesAPartnerExpansionPhaseBlockerDetail,
  INVESTOR_NARRATIVE_ONEPAGER_ARTIFACT_PATH,
  PILOT_CASE_STUDY_DRAFT_ARTIFACT_PATH,
  PILOT_GONOGO_SUMMARY_ARTIFACT_PATH,
  PILOT_METRICS_BASELINE_ARTIFACT_PATH,
  P0_STAGING_PROOF_ARTIFACT_PATH,
  resolveNextIncompleteSeriesAPartnerExpansionPhase,
  resolveScaleCompleteForSeriesA,
  resolveSeriesAPartnerExpansionComplete,
  resolveSeriesAPartnerExpansionPrerequisites,
  SERIES_A_COMPETITOR_LEAPFROG_DOC,
  SERIES_A_FEATURE_MATURITY_DOC,
  SERIES_A_FORBIDDEN_CLAIMS_DOC,
  SERIES_A_GHOST_KITCHEN_LANDING_ROUTE,
  SERIES_A_INTEGRATIONS_ROUTE,
  SERIES_A_MEAL_PREP_LANDING_ROUTE,
  SERIES_A_PARTNER_EXPANSION_STEP7_DOC,
  SERIES_A_PLATFORM_OPS_ROUTE,
  TIER2_STAGING_GOLDEN_PATH_ARTIFACT_PATH,
  type SeriesAPartnerExpansionPhaseStatus,
} from "@/lib/commercial/series-a-partner-expansion-phases-era21";
import { LAUNCH_WIZARD_ROUTE } from "@/lib/launch-wizard/launch-wizard-era19-policy";
import { LAUNCH_WIZARD_COMMERCIAL_BLOCKERS_ANCHOR } from "@/lib/launch-wizard/launch-wizard-commercial-setup-era19-policy";

export const SERIES_A_PARTNER_EXPANSION_UI_ERA21_POLICY_ID =
  "era21-series-a-partner-expansion-ui-v1" as const;

export const SERIES_A_PARTNER_EXPANSION_PLATFORM_ANCHOR = "#series-a-partner-expansion" as const;

export type SeriesAPartnerExpansionUiSlice = {
  policyId: typeof SERIES_A_PARTNER_EXPANSION_UI_ERA21_POLICY_ID;
  visible: boolean;
  blocked: boolean;
  goDecision: string;
  customerName: string | null;
  scaleComplete: boolean;
  phases: readonly SeriesAPartnerExpansionPhaseStatus[];
  completedBlockingPhaseCount: number;
  blockingPhaseCount: number;
  seriesAComplete: boolean;
  step7Doc: typeof SERIES_A_PARTNER_EXPANSION_STEP7_DOC;
  featureMaturityDoc: typeof SERIES_A_FEATURE_MATURITY_DOC;
  competitorLeapfrogDoc: typeof SERIES_A_COMPETITOR_LEAPFROG_DOC;
  forbiddenClaimsDoc: typeof SERIES_A_FORBIDDEN_CLAIMS_DOC;
  validateCommand: string;
  exportTemplateCommand: string;
  syncProgressReportCommand: string;
  postScaleOrchestratorCommand: string;
  productionGaExecutionCommand: string;
  productionGaExecutionArtifact: string;
  seriesAExpansionExecutionCommand: string;
  seriesAExpansionExecutionArtifact: string;
  exportReadinessChecklistCommand: string;
  validateScaleCommand: string;
  validateScaleIntegrityCommand: string;
  integrityValidateCommand: string;
  syncIntegrityBaselineCommand: string;
  scaleIntegrityPassed: boolean;
  seriesAIntegrityPassed: boolean;
  seriesAMilestone: SeriesAPartnerExpansionMilestone;
  todayHref: string;
  launchWizardHref: string;
  platformOpsHref: string;
  integrationHealthHref: string;
  implementationHref: string;
  reportsHref: string;
  ghostKitchenLandingHref: typeof SERIES_A_GHOST_KITCHEN_LANDING_ROUTE;
  mealPrepLandingHref: typeof SERIES_A_MEAL_PREP_LANDING_ROUTE;
  integrationsHref: typeof SERIES_A_INTEGRATIONS_ROUTE;
  nextPhase: SeriesAPartnerExpansionPhaseStatus | null;
  nextPhaseDetail: string | null;
  goNoGoArtifact: typeof PILOT_GONOGO_SUMMARY_ARTIFACT_PATH;
  p0Artifact: typeof P0_STAGING_PROOF_ARTIFACT_PATH;
  tier2Artifact: typeof TIER2_STAGING_GOLDEN_PATH_ARTIFACT_PATH;
  metricsBaselineArtifact: typeof PILOT_METRICS_BASELINE_ARTIFACT_PATH;
  investorOnepagerArtifact: typeof INVESTOR_NARRATIVE_ONEPAGER_ARTIFACT_PATH;
  caseStudyDraftArtifact: typeof PILOT_CASE_STUDY_DRAFT_ARTIFACT_PATH;
  competitorMatrixArtifact: typeof COMPETITOR_FEATURE_GAP_MATRIX_ARTIFACT_PATH;
};

export function buildSeriesAPartnerExpansionUiSlice(input: {
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
}): SeriesAPartnerExpansionUiSlice | null {
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

  const seriesAIntegrity = evaluateSeriesAPartnerExpansionIntegrity(process.cwd(), {
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

  const scaleCompleteFromPhases = resolveScaleCompleteForSeriesA({
    goNoGoSummary: input.goNoGoSummary,
    p0Staging: input.p0Staging ?? null,
    tier2Summary: input.tier2Summary ?? null,
    metricsBaseline,
    caseStudyDraft,
    investorOnepager,
    rollbackDrill,
    env,
  });
  const scaleHonest = scaleCompleteFromPhases && seriesAIntegrity.scaleIntegrityPassed;
  const goDecision = input.goNoGoSummary?.decision ?? null;
  const seriesAExecutionStarted = detectSeriesAPartnerExpansionStarted(env, {
    competitorMatrix,
  });

  if (!scaleHonest && !seriesAExecutionStarted) return null;

  const prerequisites = resolveSeriesAPartnerExpansionPrerequisites({
    goDecision: scaleHonest ? "GO" : goDecision,
    scaleComplete: scaleHonest,
  });
  if (!prerequisites.prerequisitesComplete && !seriesAExecutionStarted) {
    return null;
  }

  const phases = scaleHonest
    ? buildSeriesAPartnerExpansionPhaseStatuses({
        prerequisites,
        goNoGoSummary: input.goNoGoSummary,
        p0Staging: input.p0Staging ?? null,
        tier2Summary: input.tier2Summary ?? null,
        metricsBaseline,
        caseStudyDraft,
        investorOnepager,
        competitorMatrix,
        env,
      })
    : [];
  const seriesAComplete = scaleHonest ? resolveSeriesAPartnerExpansionComplete(phases) : false;
  if (seriesAComplete && seriesAIntegrity.integrityPassed) return null;

  const blockingPhases = phases.filter((phase) => !phase.optional);
  const completedBlockingPhaseCount = blockingPhases.filter((phase) => phase.complete).length;
  const nextPhase = resolveNextIncompleteSeriesAPartnerExpansionPhase(phases);
  const nextPhaseDetail = nextPhase
    ? formatSeriesAPartnerExpansionPhaseBlockerDetail(nextPhase)
    : null;
  const seriesAMilestone = resolveSeriesAPartnerExpansionMilestoneFromPhaseStatuses(phases, {
    prerequisitesComplete: scaleHonest,
    scaleComplete: scaleHonest,
    seriesAComplete: false,
  });

  return {
    policyId: SERIES_A_PARTNER_EXPANSION_UI_ERA21_POLICY_ID,
    visible: true,
    blocked: true,
    goDecision: "GO",
    customerName: input.goNoGoSummary?.customerName ?? null,
    scaleComplete: scaleHonest,
    phases,
    completedBlockingPhaseCount,
    blockingPhaseCount: blockingPhases.length,
    seriesAComplete: false,
    step7Doc: SERIES_A_PARTNER_EXPANSION_STEP7_DOC,
    featureMaturityDoc: SERIES_A_FEATURE_MATURITY_DOC,
    competitorLeapfrogDoc: SERIES_A_COMPETITOR_LEAPFROG_DOC,
    forbiddenClaimsDoc: SERIES_A_FORBIDDEN_CLAIMS_DOC,
    validateCommand: "npm run ops:validate-series-a-partner-expansion-env",
    exportTemplateCommand: "npm run ops:export-series-a-partner-expansion-env-template -- --write",
    syncProgressReportCommand:
      "npm run ops:sync-series-a-partner-expansion-progress-report -- --write",
    postScaleOrchestratorCommand:
      "npm run ops:run-series-a-partner-expansion-post-scale-orchestrator -- --write",
    productionGaExecutionCommand: "npm run ops:run-production-ga-execution -- --write",
    productionGaExecutionArtifact: "artifacts/production-ga-execution-summary.json",
    seriesAExpansionExecutionCommand:
      "npm run ops:run-series-a-partner-expansion-execution -- --write",
    seriesAExpansionExecutionArtifact:
      "artifacts/series-a-partner-expansion-execution-summary.json",
    exportReadinessChecklistCommand:
      "npm run ops:export-series-a-partner-expansion-readiness-checklist -- --write",
    validateScaleCommand: "npm run ops:validate-scale-readiness-env -- --json",
    validateScaleIntegrityCommand: "npm run ops:validate-scale-readiness-integrity -- --json",
    integrityValidateCommand:
      "npm run ops:validate-series-a-partner-expansion-integrity -- --json",
    syncIntegrityBaselineCommand:
      "npm run ops:sync-series-a-partner-expansion-integrity-baseline -- --write",
    scaleIntegrityPassed: seriesAIntegrity.scaleIntegrityPassed,
    seriesAIntegrityPassed: seriesAIntegrity.integrityPassed,
    seriesAMilestone,
    todayHref: "/dashboard/today",
    launchWizardHref: `${LAUNCH_WIZARD_ROUTE}${LAUNCH_WIZARD_COMMERCIAL_BLOCKERS_ANCHOR}`,
    platformOpsHref: `${SERIES_A_PLATFORM_OPS_ROUTE}${SERIES_A_PARTNER_EXPANSION_PLATFORM_ANCHOR}`,
    integrationHealthHref: "/dashboard/integration-health",
    implementationHref: "/dashboard/implementation",
    reportsHref: "/dashboard/reports",
    ghostKitchenLandingHref: SERIES_A_GHOST_KITCHEN_LANDING_ROUTE,
    mealPrepLandingHref: SERIES_A_MEAL_PREP_LANDING_ROUTE,
    integrationsHref: SERIES_A_INTEGRATIONS_ROUTE,
    nextPhase,
    nextPhaseDetail,
    goNoGoArtifact: PILOT_GONOGO_SUMMARY_ARTIFACT_PATH,
    p0Artifact: P0_STAGING_PROOF_ARTIFACT_PATH,
    tier2Artifact: TIER2_STAGING_GOLDEN_PATH_ARTIFACT_PATH,
    metricsBaselineArtifact: PILOT_METRICS_BASELINE_ARTIFACT_PATH,
    investorOnepagerArtifact: INVESTOR_NARRATIVE_ONEPAGER_ARTIFACT_PATH,
    caseStudyDraftArtifact: PILOT_CASE_STUDY_DRAFT_ARTIFACT_PATH,
    competitorMatrixArtifact: COMPETITOR_FEATURE_GAP_MATRIX_ARTIFACT_PATH,
  };
}

export function formatSeriesAPartnerExpansionProgressLabel(
  slice: SeriesAPartnerExpansionUiSlice,
): string {
  return `Series A / partners ${slice.completedBlockingPhaseCount}/${slice.blockingPhaseCount} tracks · ${slice.seriesAMilestone.replaceAll("_", " ")} · GO · ${slice.customerName ?? "customer"}`;
}
