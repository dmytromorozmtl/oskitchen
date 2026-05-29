/**
 * Continuous improvement loop UI slice — pure operational mode surfaces (Step 10).
 */
import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import { evaluateContinuousImprovementLoopIntegrity } from "@/lib/commercial/continuous-improvement-loop-integrity-era34";
import type { InvestorNarrativeOnepagerSummary } from "@/lib/commercial/investor-narrative-onepager-summary";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { PilotCaseStudyDraftSummary } from "@/lib/commercial/pilot-case-study-draft-summary";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { PilotMetricsBaselineSummary } from "@/lib/commercial/pilot-metrics-baseline-summary";
import type { PilotRollbackDrillSummary } from "@/lib/commercial/pilot-rollback-drill-summary";
import type { Tier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";
import {
  resolveContinuousImprovementLoopMilestoneFromTrackStatuses,
  type ContinuousImprovementLoopMilestone,
} from "@/lib/commercial/continuous-improvement-loop-post-sustained-ops-orchestrator-era22";
import {
  buildContinuousImprovementLoopTrackStatuses,
  CONTINUOUS_IMPROVEMENT_LOOP_RELEASE_CHECKLIST_DOC,
  CONTINUOUS_IMPROVEMENT_LOOP_STEP10_DOC,
  detectContinuousImprovementLoopStarted,
  formatContinuousImprovementLoopTrackDetail,
  resolveContinuousImprovementLoopHealthSummary,
  resolveContinuousImprovementLoopPrerequisites,
  resolveNextContinuousImprovementLoopAttentionTrack,
  resolveSustainedOpsCompleteForContinuousImprovement,
  SERIES_A_FEATURE_MATURITY_DOC,
  SERIES_A_FORBIDDEN_CLAIMS_DOC,
  SERIES_A_PLATFORM_OPS_ROUTE,
  type ContinuousImprovementLoopTrackStatus,
} from "@/lib/commercial/continuous-improvement-loop-phases-era22";
import {
  COMPETITOR_FEATURE_GAP_MATRIX_ARTIFACT_PATH,
  PILOT_GONOGO_SUMMARY_ARTIFACT_PATH,
  PILOT_METRICS_BASELINE_ARTIFACT_PATH,
  SERIES_A_COMPETITOR_LEAPFROG_DOC,
} from "@/lib/commercial/market-leader-positioning-phases-era21";
import {
  SUSTAINED_OPS_ORDER_HUB_ROUTE,
  SUSTAINED_OPS_PRODUCTION_CALENDAR_ROUTE,
} from "@/lib/commercial/sustained-operational-excellence-phases-era21";
import { LAUNCH_WIZARD_ROUTE } from "@/lib/launch-wizard/launch-wizard-era19-policy";
import { LAUNCH_WIZARD_COMMERCIAL_BLOCKERS_ANCHOR } from "@/lib/launch-wizard/launch-wizard-commercial-setup-era19-policy";

export const CONTINUOUS_IMPROVEMENT_LOOP_UI_ERA22_POLICY_ID =
  "era22-continuous-improvement-loop-ui-v1" as const;

export const CONTINUOUS_IMPROVEMENT_LOOP_PLATFORM_ANCHOR = "#continuous-improvement-loop" as const;

export type ContinuousImprovementLoopUiSlice = {
  policyId: typeof CONTINUOUS_IMPROVEMENT_LOOP_UI_ERA22_POLICY_ID;
  visible: boolean;
  pureOperationalMode: boolean;
  goDecision: string;
  customerName: string | null;
  sustainedOpsComplete: boolean;
  tracks: readonly ContinuousImprovementLoopTrackStatus[];
  healthyCount: number;
  dueSoonCount: number;
  overdueCount: number;
  guidanceCount: number;
  nextAttentionTrack: ContinuousImprovementLoopTrackStatus | null;
  nextAttentionDetail: string | null;
  step10Doc: typeof CONTINUOUS_IMPROVEMENT_LOOP_STEP10_DOC;
  releaseChecklistDoc: typeof CONTINUOUS_IMPROVEMENT_LOOP_RELEASE_CHECKLIST_DOC;
  featureMaturityDoc: typeof SERIES_A_FEATURE_MATURITY_DOC;
  forbiddenClaimsDoc: typeof SERIES_A_FORBIDDEN_CLAIMS_DOC;
  competitorLeapfrogDoc: typeof SERIES_A_COMPETITOR_LEAPFROG_DOC;
  validateCommand: string;
  syncProgressReportCommand: string;
  exportReleaseChecklistCommand: string;
  postSustainedOpsOrchestratorCommand: string;
  productEvolutionExecutionCommand: string;
  productEvolutionExecutionArtifact: string;
  ciLoopExecutionCommand: string;
  ciLoopExecutionArtifact: string;
  validateSustainedOpsCommand: string;
  validateSustainedOpsIntegrityCommand: string;
  integrityValidateCommand: string;
  syncIntegrityBaselineCommand: string;
  sustainedOpsIntegrityPassed: boolean;
  improvementLoopIntegrityPassed: boolean;
  p0ProofStatus: string | null;
  tier2ProofStatus: string | null;
  improvementLoopMilestone: ContinuousImprovementLoopMilestone;
  todayHref: string;
  platformOpsHref: string;
  integrationHealthHref: string;
  reportsHref: string;
  orderHubHref: typeof SUSTAINED_OPS_ORDER_HUB_ROUTE;
  productionCalendarHref: typeof SUSTAINED_OPS_PRODUCTION_CALENDAR_ROUTE;
  launchWizardHref: string;
  goNoGoArtifact: typeof PILOT_GONOGO_SUMMARY_ARTIFACT_PATH;
  metricsBaselineArtifact: typeof PILOT_METRICS_BASELINE_ARTIFACT_PATH;
  competitorMatrixArtifact: typeof COMPETITOR_FEATURE_GAP_MATRIX_ARTIFACT_PATH;
};

export function buildContinuousImprovementLoopUiSlice(input: {
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
}): ContinuousImprovementLoopUiSlice | null {
  const env = input.env ?? process.env;
  const p0Staging = input.p0Staging ?? null;
  const tier2Summary = input.tier2Summary ?? null;
  const metricsBaseline = input.metricsBaseline ?? null;
  const caseStudyDraft = input.caseStudyDraft ?? null;
  const investorOnepager = input.investorOnepager ?? null;
  const rollbackDrill = input.rollbackDrill ?? null;
  const competitorMatrix = input.competitorMatrix ?? null;
  const p0ProofStatus =
    input.p0ProofStatus ?? input.p0Staging?.p0ProofStatus ?? null;
  const tier2ProofStatus =
    input.tier2ProofStatus ?? input.tier2Summary?.tier2ProofStatus ?? null;

  const improvementLoopIntegrity = evaluateContinuousImprovementLoopIntegrity(process.cwd(), {
    env,
    goNoGoOverride: input.goNoGoSummary,
    p0StagingOverride: p0Staging,
    tier2SummaryOverride: tier2Summary,
    metricsBaselineOverride: metricsBaseline,
    caseStudyDraftOverride: caseStudyDraft,
    investorOnepagerOverride: investorOnepager,
    rollbackDrillOverride: rollbackDrill,
    competitorMatrixOverride: competitorMatrix,
    p0ProofStatusOverride: p0ProofStatus,
    tier2ProofStatusOverride: tier2ProofStatus,
  });

  const sustainedOpsCompleteFromPhases = resolveSustainedOpsCompleteForContinuousImprovement({
    goNoGoSummary: input.goNoGoSummary,
    p0Staging,
    tier2Summary,
    metricsBaseline,
    caseStudyDraft,
    investorOnepager,
    rollbackDrill,
    competitorMatrix,
    env,
  });
  const improvementLoopExecutionStarted = detectContinuousImprovementLoopStarted(env);

  if (!sustainedOpsCompleteFromPhases && !improvementLoopExecutionStarted) return null;

  const goDecision = input.goNoGoSummary?.decision ?? null;
  const prerequisites = resolveContinuousImprovementLoopPrerequisites({
    goDecision: sustainedOpsCompleteFromPhases ? "GO" : goDecision,
    sustainedOpsComplete: sustainedOpsCompleteFromPhases,
  });
  if (!prerequisites.pureOperationalMode && !improvementLoopExecutionStarted) {
    return null;
  }

  const tracks = buildContinuousImprovementLoopTrackStatuses({
    p0Staging,
    tier2Summary,
    metricsBaseline,
    competitorMatrix,
    customerName: input.goNoGoSummary?.customerName ?? null,
  });
  const health = resolveContinuousImprovementLoopHealthSummary(tracks);
  const nextAttentionTrack = resolveNextContinuousImprovementLoopAttentionTrack(tracks);
  const nextAttentionDetail = nextAttentionTrack
    ? formatContinuousImprovementLoopTrackDetail(nextAttentionTrack)
    : null;
  const improvementLoopMilestone = resolveContinuousImprovementLoopMilestoneFromTrackStatuses(
    tracks,
    { pureOperationalMode: sustainedOpsCompleteFromPhases || improvementLoopExecutionStarted },
  );

  return {
    policyId: CONTINUOUS_IMPROVEMENT_LOOP_UI_ERA22_POLICY_ID,
    visible: true,
    pureOperationalMode: sustainedOpsCompleteFromPhases,
    goDecision: "GO",
    customerName: input.goNoGoSummary?.customerName ?? null,
    sustainedOpsComplete: sustainedOpsCompleteFromPhases,
    tracks,
    healthyCount: health.healthyCount,
    dueSoonCount: health.dueSoonCount,
    overdueCount: health.overdueCount,
    guidanceCount: health.guidanceCount,
    nextAttentionTrack,
    nextAttentionDetail,
    step10Doc: CONTINUOUS_IMPROVEMENT_LOOP_STEP10_DOC,
    releaseChecklistDoc: CONTINUOUS_IMPROVEMENT_LOOP_RELEASE_CHECKLIST_DOC,
    featureMaturityDoc: SERIES_A_FEATURE_MATURITY_DOC,
    forbiddenClaimsDoc: SERIES_A_FORBIDDEN_CLAIMS_DOC,
    competitorLeapfrogDoc: SERIES_A_COMPETITOR_LEAPFROG_DOC,
    validateCommand: "npm run ops:validate-continuous-improvement-loop",
    syncProgressReportCommand:
      "npm run ops:sync-continuous-improvement-loop-progress-report -- --write",
    exportReleaseChecklistCommand:
      "npm run ops:export-continuous-improvement-loop-release-checklist -- --write",
    postSustainedOpsOrchestratorCommand:
      "npm run ops:run-continuous-improvement-loop-post-sustained-ops-orchestrator -- --write",
    productEvolutionExecutionCommand:
      "npm run ops:run-sustained-product-evolution-execution -- --write",
    productEvolutionExecutionArtifact:
      "artifacts/sustained-product-evolution-execution-summary.json",
    ciLoopExecutionCommand:
      "npm run ops:run-continuous-improvement-loop-execution -- --write",
    ciLoopExecutionArtifact:
      "artifacts/continuous-improvement-loop-execution-summary.json",
    validateSustainedOpsCommand: "npm run ops:validate-sustained-operational-excellence-env -- --json",
    validateSustainedOpsIntegrityCommand:
      "npm run ops:validate-sustained-operational-excellence-integrity -- --json",
    integrityValidateCommand:
      "npm run ops:validate-continuous-improvement-loop-integrity -- --json",
    syncIntegrityBaselineCommand:
      "npm run ops:sync-continuous-improvement-loop-integrity-baseline -- --write",
    sustainedOpsIntegrityPassed: improvementLoopIntegrity.sustainedOpsIntegrityPassed,
    improvementLoopIntegrityPassed: improvementLoopIntegrity.integrityPassed,
    p0ProofStatus,
    tier2ProofStatus,
    improvementLoopMilestone,
    todayHref: "/dashboard/today",
    platformOpsHref: `${SERIES_A_PLATFORM_OPS_ROUTE}${CONTINUOUS_IMPROVEMENT_LOOP_PLATFORM_ANCHOR}`,
    integrationHealthHref: "/dashboard/integration-health",
    reportsHref: "/dashboard/reports",
    orderHubHref: SUSTAINED_OPS_ORDER_HUB_ROUTE,
    productionCalendarHref: SUSTAINED_OPS_PRODUCTION_CALENDAR_ROUTE,
    launchWizardHref: `${LAUNCH_WIZARD_ROUTE}${LAUNCH_WIZARD_COMMERCIAL_BLOCKERS_ANCHOR}`,
    goNoGoArtifact: PILOT_GONOGO_SUMMARY_ARTIFACT_PATH,
    metricsBaselineArtifact: PILOT_METRICS_BASELINE_ARTIFACT_PATH,
    competitorMatrixArtifact: COMPETITOR_FEATURE_GAP_MATRIX_ARTIFACT_PATH,
  };
}

export function formatContinuousImprovementLoopProgressLabel(
  slice: ContinuousImprovementLoopUiSlice,
): string {
  if (slice.overdueCount > 0) {
    return `Improvement loop · ${slice.overdueCount} overdue · GO · ${slice.customerName ?? "customer"}`;
  }
  if (slice.dueSoonCount > 0) {
    return `Improvement loop · ${slice.dueSoonCount} due soon · GO · ${slice.customerName ?? "customer"}`;
  }
  return `Pure operational mode · ${slice.healthyCount} healthy tracks · GO · ${slice.customerName ?? "customer"}`;
}
