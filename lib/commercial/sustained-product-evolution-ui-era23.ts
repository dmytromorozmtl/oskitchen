/**
 * Sustained product evolution UI slice — product-led growth surfaces (Step 11).
 */
import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import type { InvestorNarrativeOnepagerSummary } from "@/lib/commercial/investor-narrative-onepager-summary";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { PilotCaseStudyDraftSummary } from "@/lib/commercial/pilot-case-study-draft-summary";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { PilotMetricsBaselineSummary } from "@/lib/commercial/pilot-metrics-baseline-summary";
import type { PilotRollbackDrillSummary } from "@/lib/commercial/pilot-rollback-drill-summary";
import type { Tier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";
import {
  CONTINUOUS_IMPROVEMENT_LOOP_RELEASE_CHECKLIST_DOC,
  CONTINUOUS_IMPROVEMENT_LOOP_STEP10_DOC,
} from "@/lib/commercial/continuous-improvement-loop-phases-era22";
import { evaluateSustainedProductEvolutionIntegrity } from "@/lib/commercial/sustained-product-evolution-integrity-era35";
import {
  resolveSustainedProductEvolutionMilestoneFromTrackStatuses,
  type SustainedProductEvolutionMilestone,
} from "@/lib/commercial/sustained-product-evolution-post-improvement-loop-orchestrator-era23";
import {
  buildSustainedProductEvolutionTrackStatuses,
  detectSustainedProductEvolutionStarted,
  formatSustainedProductEvolutionTrackDetail,
  IMPLEMENTATION_BACKLOG_DOC,
  resolveContinuousImprovementLoopActive,
  resolveEra25PureOperationalModeContext,
  resolveNextSustainedProductEvolutionAttentionTrack,
  resolveSustainedProductEvolutionHealthSummary,
  resolveSustainedProductEvolutionPrerequisites,
  SERIES_A_FEATURE_MATURITY_DOC,
  SERIES_A_FORBIDDEN_CLAIMS_DOC,
  SUSTAINED_PRODUCT_EVOLUTION_OWNERSHIP_MATRIX_DOC,
  SUSTAINED_PRODUCT_EVOLUTION_STEP11_DOC,
  type SustainedProductEvolutionTrackStatus,
} from "@/lib/commercial/sustained-product-evolution-phases-era23";
import {
  COMPETITOR_FEATURE_GAP_MATRIX_ARTIFACT_PATH,
  PILOT_GONOGO_SUMMARY_ARTIFACT_PATH,
  SERIES_A_COMPETITOR_LEAPFROG_DOC,
  SERIES_A_GHOST_KITCHEN_LANDING_ROUTE,
  SERIES_A_MEAL_PREP_LANDING_ROUTE,
} from "@/lib/commercial/market-leader-positioning-phases-era21";
import { SERIES_A_PLATFORM_OPS_ROUTE } from "@/lib/commercial/sustained-operational-excellence-phases-era21";
import { LAUNCH_WIZARD_ROUTE } from "@/lib/launch-wizard/launch-wizard-era19-policy";
import { LAUNCH_WIZARD_PRODUCT_EVOLUTION_ANCHOR } from "@/lib/launch-wizard/launch-wizard-product-evolution-era35";

export const SUSTAINED_PRODUCT_EVOLUTION_UI_ERA23_POLICY_ID =
  "era23-sustained-product-evolution-ui-v1" as const;

export const SUSTAINED_PRODUCT_EVOLUTION_PLATFORM_ANCHOR = "#sustained-product-evolution" as const;

export type SustainedProductEvolutionUiSlice = {
  policyId: typeof SUSTAINED_PRODUCT_EVOLUTION_UI_ERA23_POLICY_ID;
  visible: boolean;
  productEvolutionReady: boolean;
  goDecision: string;
  customerName: string | null;
  tracks: readonly SustainedProductEvolutionTrackStatus[];
  healthyCount: number;
  dueSoonCount: number;
  overdueCount: number;
  guidanceCount: number;
  nextAttentionTrack: SustainedProductEvolutionTrackStatus | null;
  nextAttentionDetail: string | null;
  step11Doc: typeof SUSTAINED_PRODUCT_EVOLUTION_STEP11_DOC;
  step10Doc: typeof CONTINUOUS_IMPROVEMENT_LOOP_STEP10_DOC;
  ownershipMatrixDoc: typeof SUSTAINED_PRODUCT_EVOLUTION_OWNERSHIP_MATRIX_DOC;
  implementationBacklogDoc: typeof IMPLEMENTATION_BACKLOG_DOC;
  featureMaturityDoc: typeof SERIES_A_FEATURE_MATURITY_DOC;
  forbiddenClaimsDoc: typeof SERIES_A_FORBIDDEN_CLAIMS_DOC;
  competitorLeapfrogDoc: typeof SERIES_A_COMPETITOR_LEAPFROG_DOC;
  releaseChecklistDoc: typeof CONTINUOUS_IMPROVEMENT_LOOP_RELEASE_CHECKLIST_DOC;
  validateCommand: string;
  syncProgressReportCommand: string;
  exportOwnershipMatrixCommand: string;
  postImprovementLoopOrchestratorCommand: string;
  sustainedOpsExecutionCommand: string;
  sustainedOpsExecutionArtifact: string;
  validateImprovementLoopCommand: string;
  validateImprovementLoopIntegrityCommand: string;
  integrityValidateCommand: string;
  syncIntegrityBaselineCommand: string;
  improvementLoopIntegrityPassed: boolean;
  productEvolutionIntegrityPassed: boolean;
  p0ProofStatus: string | null;
  tier2ProofStatus: string | null;
  productEvolutionMilestone: SustainedProductEvolutionMilestone;
  sustainedOpsConvergenceReady: boolean;
  pureOperationalModeEra25Active: boolean;
  pureOperationalModeTerminusHref: string;
  validateTerminusCommand: string;
  todayHref: string;
  launchWizardHref: string;
  platformOpsHref: string;
  improvementLoopHref: string;
  implementationHref: string;
  reportsHref: string;
  ghostKitchenLandingHref: typeof SERIES_A_GHOST_KITCHEN_LANDING_ROUTE;
  mealPrepLandingHref: typeof SERIES_A_MEAL_PREP_LANDING_ROUTE;
  goNoGoArtifact: typeof PILOT_GONOGO_SUMMARY_ARTIFACT_PATH;
  competitorMatrixArtifact: typeof COMPETITOR_FEATURE_GAP_MATRIX_ARTIFACT_PATH;
};

export function buildSustainedProductEvolutionUiSlice(input: {
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
}): SustainedProductEvolutionUiSlice | null {
  const env = input.env ?? process.env;
  const p0Staging = input.p0Staging ?? null;
  const tier2Summary = input.tier2Summary ?? null;
  const metricsBaseline = input.metricsBaseline ?? null;
  const competitorMatrix = input.competitorMatrix ?? null;
  const p0ProofStatus =
    input.p0ProofStatus ?? input.p0Staging?.p0ProofStatus ?? null;
  const tier2ProofStatus =
    input.tier2ProofStatus ?? input.tier2Summary?.tier2ProofStatus ?? null;

  const productEvolutionIntegrity = evaluateSustainedProductEvolutionIntegrity(process.cwd(), {
    env,
    goNoGoOverride: input.goNoGoSummary,
    p0StagingOverride: p0Staging,
    tier2SummaryOverride: tier2Summary,
    metricsBaselineOverride: metricsBaseline,
    caseStudyDraftOverride: input.caseStudyDraft ?? null,
    investorOnepagerOverride: input.investorOnepager ?? null,
    rollbackDrillOverride: input.rollbackDrill ?? null,
    competitorMatrixOverride: competitorMatrix,
    p0ProofStatusOverride: p0ProofStatus,
    tier2ProofStatusOverride: tier2ProofStatus,
  });

  const continuousImprovementLoopActive = resolveContinuousImprovementLoopActive({
    goNoGoSummary: input.goNoGoSummary,
    p0Staging,
    tier2Summary,
    metricsBaseline,
    caseStudyDraft: input.caseStudyDraft ?? null,
    investorOnepager: input.investorOnepager ?? null,
    rollbackDrill: input.rollbackDrill ?? null,
    competitorMatrix,
    env,
  });
  const goDecision = input.goNoGoSummary?.decision ?? null;
  const era25 = resolveEra25PureOperationalModeContext(env);
  const prerequisites = resolveSustainedProductEvolutionPrerequisites({
    goDecision,
    continuousImprovementLoopActive,
    era25,
  });
  const productEvolutionReadyFromPhases = prerequisites.productEvolutionReady;
  const productEvolutionExecutionStarted = detectSustainedProductEvolutionStarted(env);

  if (!productEvolutionReadyFromPhases && !productEvolutionExecutionStarted) return null;

  const tracks = buildSustainedProductEvolutionTrackStatuses({
    metricsBaseline,
    competitorMatrix,
    customerName: input.goNoGoSummary?.customerName ?? null,
  });
  const health = resolveSustainedProductEvolutionHealthSummary(tracks);
  const nextAttentionTrack = resolveNextSustainedProductEvolutionAttentionTrack(tracks);
  const nextAttentionDetail = nextAttentionTrack
    ? formatSustainedProductEvolutionTrackDetail(nextAttentionTrack)
    : null;
  const productEvolutionMilestone = resolveSustainedProductEvolutionMilestoneFromTrackStatuses(
    tracks,
    {
      productEvolutionReady: productEvolutionReadyFromPhases || productEvolutionExecutionStarted,
      sustainedOpsConvergenceReady: prerequisites.sustainedOpsConvergenceReady,
    },
  );

  return {
    policyId: SUSTAINED_PRODUCT_EVOLUTION_UI_ERA23_POLICY_ID,
    visible: true,
    productEvolutionReady: productEvolutionReadyFromPhases,
    goDecision: "GO",
    customerName: input.goNoGoSummary?.customerName ?? null,
    tracks,
    healthyCount: health.healthyCount,
    dueSoonCount: health.dueSoonCount,
    overdueCount: health.overdueCount,
    guidanceCount: health.guidanceCount,
    nextAttentionTrack,
    nextAttentionDetail,
    step11Doc: SUSTAINED_PRODUCT_EVOLUTION_STEP11_DOC,
    step10Doc: CONTINUOUS_IMPROVEMENT_LOOP_STEP10_DOC,
    ownershipMatrixDoc: SUSTAINED_PRODUCT_EVOLUTION_OWNERSHIP_MATRIX_DOC,
    implementationBacklogDoc: IMPLEMENTATION_BACKLOG_DOC,
    featureMaturityDoc: SERIES_A_FEATURE_MATURITY_DOC,
    forbiddenClaimsDoc: SERIES_A_FORBIDDEN_CLAIMS_DOC,
    competitorLeapfrogDoc: SERIES_A_COMPETITOR_LEAPFROG_DOC,
    releaseChecklistDoc: CONTINUOUS_IMPROVEMENT_LOOP_RELEASE_CHECKLIST_DOC,
    validateCommand: "npm run ops:validate-sustained-product-evolution",
    syncProgressReportCommand: "npm run ops:sync-sustained-product-evolution-progress-report -- --write",
    exportOwnershipMatrixCommand:
      "npm run ops:export-sustained-product-evolution-ownership-matrix -- --write",
    postImprovementLoopOrchestratorCommand:
      "npm run ops:run-sustained-product-evolution-post-improvement-loop-orchestrator -- --write",
    sustainedOpsExecutionCommand:
      "npm run ops:run-sustained-operational-excellence-execution -- --write",
    sustainedOpsExecutionArtifact:
      "artifacts/sustained-operational-excellence-execution-summary.json",
    validateImprovementLoopCommand: "npm run ops:validate-continuous-improvement-loop -- --json",
    validateImprovementLoopIntegrityCommand:
      "npm run ops:validate-continuous-improvement-loop-integrity -- --json",
    integrityValidateCommand:
      "npm run ops:validate-sustained-product-evolution-integrity -- --json",
    syncIntegrityBaselineCommand:
      "npm run ops:sync-sustained-product-evolution-integrity-baseline -- --write",
    improvementLoopIntegrityPassed: productEvolutionIntegrity.improvementLoopIntegrityPassed,
    productEvolutionIntegrityPassed: productEvolutionIntegrity.integrityPassed,
    p0ProofStatus,
    tier2ProofStatus,
    validateTerminusCommand: "npm run ops:validate-pure-operational-mode-terminus-era25 -- --json",
    productEvolutionMilestone,
    sustainedOpsConvergenceReady: prerequisites.sustainedOpsConvergenceReady,
    pureOperationalModeEra25Active: prerequisites.pureOperationalModeEra25Active,
    pureOperationalModeTerminusHref: era25.platformOpsHref,
    todayHref: "/dashboard/today",
    launchWizardHref: `${LAUNCH_WIZARD_ROUTE}${LAUNCH_WIZARD_PRODUCT_EVOLUTION_ANCHOR}`,
    platformOpsHref: `${SERIES_A_PLATFORM_OPS_ROUTE}${SUSTAINED_PRODUCT_EVOLUTION_PLATFORM_ANCHOR}`,
    improvementLoopHref: `${SERIES_A_PLATFORM_OPS_ROUTE}#continuous-improvement-loop`,
    implementationHref: "/dashboard/implementation",
    reportsHref: "/dashboard/reports",
    ghostKitchenLandingHref: SERIES_A_GHOST_KITCHEN_LANDING_ROUTE,
    mealPrepLandingHref: SERIES_A_MEAL_PREP_LANDING_ROUTE,
    goNoGoArtifact: PILOT_GONOGO_SUMMARY_ARTIFACT_PATH,
    competitorMatrixArtifact: COMPETITOR_FEATURE_GAP_MATRIX_ARTIFACT_PATH,
  };
}

export function formatSustainedProductEvolutionProgressLabel(
  slice: SustainedProductEvolutionUiSlice,
): string {
  const milestone = slice.productEvolutionMilestone.replaceAll("_", " ");
  if (slice.overdueCount > 0) {
    return `Product evolution · ${slice.overdueCount} overdue · ${milestone} · GO · ${slice.customerName ?? "customer"}`;
  }
  if (slice.dueSoonCount > 0) {
    return `Product evolution · ${slice.dueSoonCount} due soon · ${milestone} · GO · ${slice.customerName ?? "customer"}`;
  }
  return `Product-led growth · ${slice.healthyCount} healthy tracks · ${milestone} · GO · ${slice.customerName ?? "customer"}`;
}
