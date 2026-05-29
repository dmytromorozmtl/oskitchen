/**
 * era25 Series A / Partner Expansion Convergence UI slice.
 */
import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import { evaluateSeriesAPartnerExpansionConvergenceIntegrity } from "@/lib/commercial/series-a-partner-expansion-convergence-integrity-era51";
import {
  SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_CONVERGENCE_TARGETS,
  SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_DOC,
  SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_FOREVER_COMMANDS,
  SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_GUARDRAILS,
  SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_HUMAN_STEPS,
  SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_PLATFORM_ANCHOR,
  SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_BACKLOG_ID,
  SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_ERA21_REFERENCE_DOC,
  detectSeriesAPartnerExpansionConvergenceEra25Started,
} from "@/lib/commercial/series-a-partner-expansion-convergence-phases-era25";
import {
  type SeriesAPartnerExpansionConvergenceEra25Milestone,
} from "@/lib/commercial/series-a-partner-expansion-convergence-post-scale-convergence-orchestrator-era25";
import type { ScaleReadinessConvergenceEra25Milestone } from "@/lib/commercial/scale-readiness-convergence-post-month2-convergence-orchestrator-era25";
import type { SeriesAPartnerExpansionPhaseStatus } from "@/lib/commercial/series-a-partner-expansion-phases-era21";
import type { LaunchWizardSeriesAPartnerExpansionConvergenceSlice } from "@/lib/briefing/series-a-partner-expansion-convergence-briefing-era25";
import type { OwnerDailyBriefingRankedAction } from "@/lib/briefing/owner-daily-briefing-era19";
import type { InvestorNarrativeOnepagerSummary } from "@/lib/commercial/investor-narrative-onepager-summary";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { PilotCaseStudyDraftSummary } from "@/lib/commercial/pilot-case-study-draft-summary";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { PilotMetricsBaselineSummary } from "@/lib/commercial/pilot-metrics-baseline-summary";
import type { PilotRollbackDrillSummary } from "@/lib/commercial/pilot-rollback-drill-summary";
import type { Tier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";
import {
  buildMarketLeaderPositioningConvergenceEra25UiSlice,
  type MarketLeaderPositioningConvergenceEra25UiSlice,
} from "@/lib/commercial/market-leader-positioning-convergence-ui-era25";
import { evaluateSeriesAPartnerExpansionConvergenceEra25WithMilestones } from "@/scripts/ops/validate-series-a-partner-expansion-convergence-era25";
import { SERIES_A_PLATFORM_OPS_ROUTE } from "@/lib/commercial/sustained-operational-excellence-phases-era21";
import { LAUNCH_WIZARD_ROUTE } from "@/lib/launch-wizard/launch-wizard-era19-policy";
import { LAUNCH_WIZARD_ERA25_SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ANCHOR } from "@/lib/launch-wizard/launch-wizard-era25-series-a-partner-expansion-convergence-era51";

export const SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_UI_POLICY_ID =
  "era25-series-a-partner-expansion-convergence-ui-v1" as const;

export type SeriesAPartnerExpansionConvergenceEra25UiSlice = {
  policyId: typeof SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_UI_POLICY_ID;
  visible: boolean;
  outsideLinearCatalog: boolean;
  seriesAPartnerExpansionConvergenceEra25Milestone: SeriesAPartnerExpansionConvergenceEra25Milestone;
  scaleReadinessConvergenceEra25Milestone: ScaleReadinessConvergenceEra25Milestone;
  convergenceBlocked: boolean;
  scaleConvergenceReady: boolean;
  seriesAComplete: boolean;
  goDecision: string | null;
  completedBlockingCount: number;
  totalBlockingCount: number;
  phases: readonly SeriesAPartnerExpansionPhaseStatus[];
  nextPhaseId: string | null;
  nextPhaseLabel: string | null;
  readyForDataRoomSmokes: boolean;
  readyForPartnerSmokes: boolean;
  briefingAction: OwnerDailyBriefingRankedAction | null;
  launchWizardSlice: LaunchWizardSeriesAPartnerExpansionConvergenceSlice;
  convergenceTargets: typeof SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_CONVERGENCE_TARGETS;
  backlogId: typeof SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_BACKLOG_ID;
  guardrails: readonly string[];
  humanSteps: readonly string[];
  convergenceDoc: typeof SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_DOC;
  era21ReferenceDoc: typeof SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_ERA21_REFERENCE_DOC;
  foreverCommands: readonly string[];
  validateCommand: string;
  postScaleConvergenceOrchestratorCommand: string;
  syncReportCommand: string;
  validateScaleConvergenceCommand: string;
  validateScaleConvergenceIntegrityCommand: string;
  validateSeriesAEnvCommand: string;
  integrityValidateCommand: string;
  syncIntegrityBaselineCommand: string;
  seriesAPartnerExpansionConvergenceIntegrityPassed: boolean;
  scaleReadinessConvergenceIntegrityPassed: boolean;
  launchWizardHref: string;
  platformOpsHref: string;
  reportsHref: string;
  integrationHealthHref: string;
  implementationHref: string;
  marketLeaderPositioningConvergence: MarketLeaderPositioningConvergenceEra25UiSlice | null;
};

export function buildSeriesAPartnerExpansionConvergenceEra25UiSlice(input: {
  scaleConvergenceVisible: boolean;
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
}): SeriesAPartnerExpansionConvergenceEra25UiSlice | null {
  const env = input.env ?? process.env;
  const seriesAStarted = detectSeriesAPartnerExpansionConvergenceEra25Started(env);

  if (!input.scaleConvergenceVisible && !seriesAStarted) return null;

  const p0ProofStatus = input.p0ProofStatus ?? input.p0Staging?.p0ProofStatus ?? null;
  const tier2ProofStatus = input.tier2ProofStatus ?? input.tier2Summary?.tier2ProofStatus ?? null;

  const seriesAPartnerExpansionConvergenceIntegrity = evaluateSeriesAPartnerExpansionConvergenceIntegrity(
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
    },
  );

  const result = evaluateSeriesAPartnerExpansionConvergenceEra25WithMilestones(env);
  const marketLeaderPositioningConvergence = buildMarketLeaderPositioningConvergenceEra25UiSlice({
    seriesAConvergenceVisible: true,
    env,
    goNoGoSummary: input.goNoGoSummary,
    p0Staging: input.p0Staging,
    tier2Summary: input.tier2Summary,
    metricsBaseline: input.metricsBaseline,
    caseStudyDraft: input.caseStudyDraft,
    investorOnepager: input.investorOnepager,
    rollbackDrill: input.rollbackDrill,
    competitorMatrix: input.competitorMatrix,
    p0ProofStatus,
    tier2ProofStatus,
  });

  return {
    policyId: SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_UI_POLICY_ID,
    visible: true,
    outsideLinearCatalog: true,
    seriesAPartnerExpansionConvergenceEra25Milestone:
      result.seriesAPartnerExpansionConvergenceEra25Milestone,
    scaleReadinessConvergenceEra25Milestone:
      result.evaluation.scaleConvergence.scaleReadinessConvergenceEra25Milestone,
    convergenceBlocked: result.evaluation.convergenceBlocked,
    scaleConvergenceReady: result.evaluation.scaleConvergenceReady,
    seriesAComplete: result.evaluation.seriesAState.seriesAComplete,
    goDecision:
      seriesAPartnerExpansionConvergenceIntegrity.goDecision ?? result.evaluation.seriesAState.goDecision,
    completedBlockingCount: result.evaluation.seriesAState.completedBlockingCount,
    totalBlockingCount: result.evaluation.seriesAState.totalBlockingCount,
    phases: result.evaluation.seriesAState.phases,
    nextPhaseId: result.evaluation.seriesAState.nextPhaseId,
    nextPhaseLabel: result.evaluation.seriesAState.nextPhaseLabel,
    readyForDataRoomSmokes: result.evaluation.seriesAState.readyForDataRoomSmokes,
    readyForPartnerSmokes: result.evaluation.seriesAState.readyForPartnerSmokes,
    briefingAction: result.evaluation.briefingAction,
    launchWizardSlice: result.evaluation.launchWizardSlice,
    convergenceTargets: result.evaluation.convergenceTargets,
    backlogId: SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_BACKLOG_ID,
    guardrails: SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_GUARDRAILS,
    humanSteps: SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_HUMAN_STEPS,
    convergenceDoc: SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_DOC,
    era21ReferenceDoc: SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_ERA21_REFERENCE_DOC,
    foreverCommands: SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_FOREVER_COMMANDS,
    validateCommand:
      "npm run ops:validate-series-a-partner-expansion-convergence-era25 -- --json",
    postScaleConvergenceOrchestratorCommand:
      "npm run ops:run-series-a-partner-expansion-convergence-post-scale-convergence-orchestrator-era25 -- --write",
    syncReportCommand:
      "npm run ops:sync-series-a-partner-expansion-convergence-era25-report -- --write",
    validateScaleConvergenceCommand:
      "npm run ops:validate-scale-readiness-convergence-era25 -- --json",
    validateScaleConvergenceIntegrityCommand:
      "npm run ops:validate-scale-readiness-convergence-integrity -- --json",
    validateSeriesAEnvCommand: "npm run ops:validate-series-a-partner-expansion-env -- --json",
    integrityValidateCommand:
      "npm run ops:validate-series-a-partner-expansion-convergence-integrity -- --json",
    syncIntegrityBaselineCommand:
      "npm run ops:sync-series-a-partner-expansion-convergence-integrity-baseline -- --write",
    seriesAPartnerExpansionConvergenceIntegrityPassed:
      seriesAPartnerExpansionConvergenceIntegrity.integrityPassed,
    scaleReadinessConvergenceIntegrityPassed:
      seriesAPartnerExpansionConvergenceIntegrity.scaleReadinessConvergenceIntegrityPassed,
    launchWizardHref: `${LAUNCH_WIZARD_ROUTE}${LAUNCH_WIZARD_ERA25_SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ANCHOR}`,
    platformOpsHref: `${SERIES_A_PLATFORM_OPS_ROUTE}${SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_PLATFORM_ANCHOR}`,
    reportsHref: "/dashboard/reports",
    integrationHealthHref: "/dashboard/integration-health",
    implementationHref: "/dashboard/implementation",
    marketLeaderPositioningConvergence,
  };
}

export function formatSeriesAPartnerExpansionConvergenceEra25Label(
  slice: SeriesAPartnerExpansionConvergenceEra25UiSlice,
): string {
  const milestone = slice.seriesAPartnerExpansionConvergenceEra25Milestone.replaceAll("_", " ");
  const status = slice.convergenceBlocked ? "BLOCKED" : "READY";
  const progress = `${slice.completedBlockingCount}/${slice.totalBlockingCount} tracks`;
  return `era25 series a partner expansion convergence · ${status} · ${progress} · ${milestone}`;
}
