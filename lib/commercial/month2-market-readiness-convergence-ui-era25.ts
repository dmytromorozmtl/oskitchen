/**
 * era25 Month 2 Market Readiness Convergence UI slice.
 */
import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import { evaluateMonth2MarketReadinessConvergenceIntegrity } from "@/lib/commercial/month2-market-readiness-convergence-integrity-era49";
import {
  MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_CONVERGENCE_TARGETS,
  MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_DOC,
  MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_FOREVER_COMMANDS,
  MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_GUARDRAILS,
  MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_HUMAN_STEPS,
  MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_PLATFORM_ANCHOR,
  MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_BACKLOG_ID,
  MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_ERA21_REFERENCE_DOC,
  detectMonth2MarketReadinessConvergenceEra25Started,
} from "@/lib/commercial/month2-market-readiness-convergence-phases-era25";
import {
  type Month2MarketReadinessConvergenceEra25Milestone,
} from "@/lib/commercial/month2-market-readiness-convergence-post-week1-convergence-orchestrator-era25";
import type { PilotWeek1ExecutionConvergenceEra25Milestone } from "@/lib/commercial/pilot-week1-execution-convergence-post-go-convergence-orchestrator-era25";
import type { Month2MarketReadinessPhaseStatus } from "@/lib/commercial/month2-market-readiness-phases-era21";
import type { LaunchWizardMonth2MarketReadinessConvergenceSlice } from "@/lib/briefing/month2-market-readiness-convergence-briefing-era25";
import type { OwnerDailyBriefingRankedAction } from "@/lib/briefing/owner-daily-briefing-era19";
import type { InvestorNarrativeOnepagerSummary } from "@/lib/commercial/investor-narrative-onepager-summary";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { PilotCaseStudyDraftSummary } from "@/lib/commercial/pilot-case-study-draft-summary";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { PilotMetricsBaselineSummary } from "@/lib/commercial/pilot-metrics-baseline-summary";
import type { PilotRollbackDrillSummary } from "@/lib/commercial/pilot-rollback-drill-summary";
import type { Tier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";
import {
  buildScaleReadinessConvergenceEra25UiSlice,
  type ScaleReadinessConvergenceEra25UiSlice,
} from "@/lib/commercial/scale-readiness-convergence-ui-era25";
import { evaluateMonth2MarketReadinessConvergenceEra25WithMilestones } from "@/scripts/ops/validate-month2-market-readiness-convergence-era25";
import { SERIES_A_PLATFORM_OPS_ROUTE } from "@/lib/commercial/sustained-operational-excellence-phases-era21";
import { LAUNCH_WIZARD_ROUTE } from "@/lib/launch-wizard/launch-wizard-era19-policy";
import { LAUNCH_WIZARD_ERA25_MONTH2_MARKET_READINESS_CONVERGENCE_ANCHOR } from "@/lib/launch-wizard/launch-wizard-era25-month2-market-readiness-convergence-era49";

export const MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_UI_POLICY_ID =
  "era25-month2-market-readiness-convergence-ui-v1" as const;

export type Month2MarketReadinessConvergenceEra25UiSlice = {
  policyId: typeof MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_UI_POLICY_ID;
  visible: boolean;
  outsideLinearCatalog: boolean;
  month2MarketReadinessConvergenceEra25Milestone: Month2MarketReadinessConvergenceEra25Milestone;
  pilotWeek1ExecutionConvergenceEra25Milestone: PilotWeek1ExecutionConvergenceEra25Milestone;
  convergenceBlocked: boolean;
  week1ConvergenceReady: boolean;
  month2Complete: boolean;
  goDecision: string | null;
  completedBlockingCount: number;
  totalBlockingCount: number;
  phases: readonly Month2MarketReadinessPhaseStatus[];
  nextPhaseId: string | null;
  nextPhaseLabel: string | null;
  readyForInvestorOnepagerSmoke: boolean;
  briefingAction: OwnerDailyBriefingRankedAction | null;
  launchWizardSlice: LaunchWizardMonth2MarketReadinessConvergenceSlice;
  convergenceTargets: typeof MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_CONVERGENCE_TARGETS;
  backlogId: typeof MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_BACKLOG_ID;
  guardrails: readonly string[];
  humanSteps: readonly string[];
  convergenceDoc: typeof MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_DOC;
  era21ReferenceDoc: typeof MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_ERA21_REFERENCE_DOC;
  foreverCommands: readonly string[];
  validateCommand: string;
  postWeek1ConvergenceOrchestratorCommand: string;
  syncReportCommand: string;
  validateWeek1ConvergenceCommand: string;
  validateWeek1ConvergenceIntegrityCommand: string;
  validateMonth2EnvCommand: string;
  integrityValidateCommand: string;
  syncIntegrityBaselineCommand: string;
  month2MarketReadinessConvergenceIntegrityPassed: boolean;
  pilotWeek1ExecutionConvergenceIntegrityPassed: boolean;
  launchWizardHref: string;
  platformOpsHref: string;
  reportsHref: string;
  ghostKitchenLandingHref: string;
  scaleReadinessConvergence: ScaleReadinessConvergenceEra25UiSlice | null;
};

export function buildMonth2MarketReadinessConvergenceEra25UiSlice(input: {
  week1ConvergenceVisible: boolean;
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
}): Month2MarketReadinessConvergenceEra25UiSlice | null {
  const env = input.env ?? process.env;
  const month2Started = detectMonth2MarketReadinessConvergenceEra25Started(env);

  if (!input.week1ConvergenceVisible && !month2Started) return null;

  const p0ProofStatus = input.p0ProofStatus ?? input.p0Staging?.p0ProofStatus ?? null;
  const tier2ProofStatus = input.tier2ProofStatus ?? input.tier2Summary?.tier2ProofStatus ?? null;

  const month2MarketReadinessConvergenceIntegrity = evaluateMonth2MarketReadinessConvergenceIntegrity(
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

  const result = evaluateMonth2MarketReadinessConvergenceEra25WithMilestones(env);
  const scaleReadinessConvergence = buildScaleReadinessConvergenceEra25UiSlice({
    month2ConvergenceVisible: true,
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
    policyId: MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_UI_POLICY_ID,
    visible: true,
    outsideLinearCatalog: true,
    month2MarketReadinessConvergenceEra25Milestone:
      result.month2MarketReadinessConvergenceEra25Milestone,
    pilotWeek1ExecutionConvergenceEra25Milestone:
      result.evaluation.week1Convergence.pilotWeek1ExecutionConvergenceEra25Milestone,
    convergenceBlocked: result.evaluation.convergenceBlocked,
    week1ConvergenceReady: result.evaluation.week1ConvergenceReady,
    month2Complete: result.evaluation.month2State.month2Complete,
    goDecision:
      month2MarketReadinessConvergenceIntegrity.goDecision ?? result.evaluation.month2State.goDecision,
    completedBlockingCount: result.evaluation.month2State.completedBlockingCount,
    totalBlockingCount: result.evaluation.month2State.totalBlockingCount,
    phases: result.evaluation.month2State.phases,
    nextPhaseId: result.evaluation.month2State.nextPhaseId,
    nextPhaseLabel: result.evaluation.month2State.nextPhaseLabel,
    readyForInvestorOnepagerSmoke: result.evaluation.month2State.readyForInvestorOnepagerSmoke,
    briefingAction: result.evaluation.briefingAction,
    launchWizardSlice: result.evaluation.launchWizardSlice,
    convergenceTargets: result.evaluation.convergenceTargets,
    backlogId: MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_BACKLOG_ID,
    guardrails: MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_GUARDRAILS,
    humanSteps: MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_HUMAN_STEPS,
    convergenceDoc: MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_DOC,
    era21ReferenceDoc: MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_ERA21_REFERENCE_DOC,
    foreverCommands: MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_FOREVER_COMMANDS,
    validateCommand: "npm run ops:validate-month2-market-readiness-convergence-era25 -- --json",
    postWeek1ConvergenceOrchestratorCommand:
      "npm run ops:run-month2-market-readiness-convergence-post-week1-convergence-orchestrator-era25 -- --write",
    syncReportCommand:
      "npm run ops:sync-month2-market-readiness-convergence-era25-report -- --write",
    validateWeek1ConvergenceCommand:
      "npm run ops:validate-pilot-week1-execution-convergence-era25 -- --json",
    validateWeek1ConvergenceIntegrityCommand:
      "npm run ops:validate-pilot-week1-execution-convergence-integrity -- --json",
    validateMonth2EnvCommand: "npm run ops:validate-month2-market-readiness-env -- --json",
    integrityValidateCommand:
      "npm run ops:validate-month2-market-readiness-convergence-integrity -- --json",
    syncIntegrityBaselineCommand:
      "npm run ops:sync-month2-market-readiness-convergence-integrity-baseline -- --write",
    month2MarketReadinessConvergenceIntegrityPassed:
      month2MarketReadinessConvergenceIntegrity.integrityPassed,
    pilotWeek1ExecutionConvergenceIntegrityPassed:
      month2MarketReadinessConvergenceIntegrity.pilotWeek1ExecutionConvergenceIntegrityPassed,
    launchWizardHref: `${LAUNCH_WIZARD_ROUTE}${LAUNCH_WIZARD_ERA25_MONTH2_MARKET_READINESS_CONVERGENCE_ANCHOR}`,
    platformOpsHref: `${SERIES_A_PLATFORM_OPS_ROUTE}${MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_PLATFORM_ANCHOR}`,
    reportsHref: "/dashboard/reports",
    ghostKitchenLandingHref: "/solutions/ghost-kitchens",
    scaleReadinessConvergence,
  };
}

export function formatMonth2MarketReadinessConvergenceEra25Label(
  slice: Month2MarketReadinessConvergenceEra25UiSlice,
): string {
  const milestone = slice.month2MarketReadinessConvergenceEra25Milestone.replaceAll("_", " ");
  const status = slice.convergenceBlocked ? "BLOCKED" : "READY";
  const progress = `${slice.completedBlockingCount}/${slice.totalBlockingCount} workstreams`;
  return `era25 month 2 market readiness convergence · ${status} · ${progress} · ${milestone}`;
}
