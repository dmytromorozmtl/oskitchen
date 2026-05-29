/**
 * era25 Scale Readiness Convergence UI slice.
 */
import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import { evaluateScaleReadinessConvergenceIntegrity } from "@/lib/commercial/scale-readiness-convergence-integrity-era50";
import {
  SCALE_READINESS_CONVERGENCE_ERA25_CONVERGENCE_TARGETS,
  SCALE_READINESS_CONVERGENCE_ERA25_DOC,
  SCALE_READINESS_CONVERGENCE_ERA25_FOREVER_COMMANDS,
  SCALE_READINESS_CONVERGENCE_ERA25_GUARDRAILS,
  SCALE_READINESS_CONVERGENCE_ERA25_HUMAN_STEPS,
  SCALE_READINESS_CONVERGENCE_ERA25_PLATFORM_ANCHOR,
  SCALE_READINESS_CONVERGENCE_ERA25_BACKLOG_ID,
  SCALE_READINESS_CONVERGENCE_ERA25_ERA21_REFERENCE_DOC,
  detectScaleReadinessConvergenceEra25Started,
} from "@/lib/commercial/scale-readiness-convergence-phases-era25";
import {
  type ScaleReadinessConvergenceEra25Milestone,
} from "@/lib/commercial/scale-readiness-convergence-post-month2-convergence-orchestrator-era25";
import type { Month2MarketReadinessConvergenceEra25Milestone } from "@/lib/commercial/month2-market-readiness-convergence-post-week1-convergence-orchestrator-era25";
import type { ScaleReadinessPhaseStatus } from "@/lib/commercial/scale-readiness-phases-era21";
import type { LaunchWizardScaleReadinessConvergenceSlice } from "@/lib/briefing/scale-readiness-convergence-briefing-era25";
import type { OwnerDailyBriefingRankedAction } from "@/lib/briefing/owner-daily-briefing-era19";
import type { InvestorNarrativeOnepagerSummary } from "@/lib/commercial/investor-narrative-onepager-summary";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { PilotCaseStudyDraftSummary } from "@/lib/commercial/pilot-case-study-draft-summary";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { PilotMetricsBaselineSummary } from "@/lib/commercial/pilot-metrics-baseline-summary";
import type { PilotRollbackDrillSummary } from "@/lib/commercial/pilot-rollback-drill-summary";
import type { Tier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";
import {
  buildSeriesAPartnerExpansionConvergenceEra25UiSlice,
  type SeriesAPartnerExpansionConvergenceEra25UiSlice,
} from "@/lib/commercial/series-a-partner-expansion-convergence-ui-era25";
import { evaluateScaleReadinessConvergenceEra25WithMilestones } from "@/scripts/ops/validate-scale-readiness-convergence-era25";
import { SERIES_A_PLATFORM_OPS_ROUTE } from "@/lib/commercial/sustained-operational-excellence-phases-era21";
import { LAUNCH_WIZARD_ROUTE } from "@/lib/launch-wizard/launch-wizard-era19-policy";
import { LAUNCH_WIZARD_ERA25_SCALE_READINESS_CONVERGENCE_ANCHOR } from "@/lib/launch-wizard/launch-wizard-era25-scale-readiness-convergence-era50";

export const SCALE_READINESS_CONVERGENCE_ERA25_UI_POLICY_ID =
  "era25-scale-readiness-convergence-ui-v1" as const;

export type ScaleReadinessConvergenceEra25UiSlice = {
  policyId: typeof SCALE_READINESS_CONVERGENCE_ERA25_UI_POLICY_ID;
  visible: boolean;
  outsideLinearCatalog: boolean;
  scaleReadinessConvergenceEra25Milestone: ScaleReadinessConvergenceEra25Milestone;
  month2MarketReadinessConvergenceEra25Milestone: Month2MarketReadinessConvergenceEra25Milestone;
  convergenceBlocked: boolean;
  month2ConvergenceReady: boolean;
  scaleComplete: boolean;
  goDecision: string | null;
  completedBlockingCount: number;
  totalBlockingCount: number;
  phases: readonly ScaleReadinessPhaseStatus[];
  nextPhaseId: string | null;
  nextPhaseLabel: string | null;
  readyForResilienceSmokes: boolean;
  briefingAction: OwnerDailyBriefingRankedAction | null;
  launchWizardSlice: LaunchWizardScaleReadinessConvergenceSlice;
  convergenceTargets: typeof SCALE_READINESS_CONVERGENCE_ERA25_CONVERGENCE_TARGETS;
  backlogId: typeof SCALE_READINESS_CONVERGENCE_ERA25_BACKLOG_ID;
  guardrails: readonly string[];
  humanSteps: readonly string[];
  convergenceDoc: typeof SCALE_READINESS_CONVERGENCE_ERA25_DOC;
  era21ReferenceDoc: typeof SCALE_READINESS_CONVERGENCE_ERA25_ERA21_REFERENCE_DOC;
  foreverCommands: readonly string[];
  validateCommand: string;
  postMonth2ConvergenceOrchestratorCommand: string;
  syncReportCommand: string;
  validateMonth2ConvergenceCommand: string;
  validateMonth2ConvergenceIntegrityCommand: string;
  validateScaleEnvCommand: string;
  integrityValidateCommand: string;
  syncIntegrityBaselineCommand: string;
  scaleReadinessConvergenceIntegrityPassed: boolean;
  month2MarketReadinessConvergenceIntegrityPassed: boolean;
  launchWizardHref: string;
  platformOpsHref: string;
  integrationHealthHref: string;
  implementationHref: string;
  seriesAPartnerExpansionConvergence: SeriesAPartnerExpansionConvergenceEra25UiSlice | null;
};

export function buildScaleReadinessConvergenceEra25UiSlice(input: {
  month2ConvergenceVisible: boolean;
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
}): ScaleReadinessConvergenceEra25UiSlice | null {
  const env = input.env ?? process.env;
  const scaleStarted = detectScaleReadinessConvergenceEra25Started(env);

  if (!input.month2ConvergenceVisible && !scaleStarted) return null;

  const p0ProofStatus = input.p0ProofStatus ?? input.p0Staging?.p0ProofStatus ?? null;
  const tier2ProofStatus = input.tier2ProofStatus ?? input.tier2Summary?.tier2ProofStatus ?? null;

  const scaleReadinessConvergenceIntegrity = evaluateScaleReadinessConvergenceIntegrity(
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

  const result = evaluateScaleReadinessConvergenceEra25WithMilestones(env);
  const seriesAPartnerExpansionConvergence = buildSeriesAPartnerExpansionConvergenceEra25UiSlice({
    scaleConvergenceVisible: true,
    env,
  });

  return {
    policyId: SCALE_READINESS_CONVERGENCE_ERA25_UI_POLICY_ID,
    visible: true,
    outsideLinearCatalog: true,
    scaleReadinessConvergenceEra25Milestone: result.scaleReadinessConvergenceEra25Milestone,
    month2MarketReadinessConvergenceEra25Milestone:
      result.evaluation.month2Convergence.month2MarketReadinessConvergenceEra25Milestone,
    convergenceBlocked: result.evaluation.convergenceBlocked,
    month2ConvergenceReady: result.evaluation.month2ConvergenceReady,
    scaleComplete: result.evaluation.scaleState.scaleComplete,
    goDecision:
      scaleReadinessConvergenceIntegrity.goDecision ?? result.evaluation.scaleState.goDecision,
    completedBlockingCount: result.evaluation.scaleState.completedBlockingCount,
    totalBlockingCount: result.evaluation.scaleState.totalBlockingCount,
    phases: result.evaluation.scaleState.phases,
    nextPhaseId: result.evaluation.scaleState.nextPhaseId,
    nextPhaseLabel: result.evaluation.scaleState.nextPhaseLabel,
    readyForResilienceSmokes: result.evaluation.scaleState.readyForResilienceSmokes,
    briefingAction: result.evaluation.briefingAction,
    launchWizardSlice: result.evaluation.launchWizardSlice,
    convergenceTargets: result.evaluation.convergenceTargets,
    backlogId: SCALE_READINESS_CONVERGENCE_ERA25_BACKLOG_ID,
    guardrails: SCALE_READINESS_CONVERGENCE_ERA25_GUARDRAILS,
    humanSteps: SCALE_READINESS_CONVERGENCE_ERA25_HUMAN_STEPS,
    convergenceDoc: SCALE_READINESS_CONVERGENCE_ERA25_DOC,
    era21ReferenceDoc: SCALE_READINESS_CONVERGENCE_ERA25_ERA21_REFERENCE_DOC,
    foreverCommands: SCALE_READINESS_CONVERGENCE_ERA25_FOREVER_COMMANDS,
    validateCommand: "npm run ops:validate-scale-readiness-convergence-era25 -- --json",
    postMonth2ConvergenceOrchestratorCommand:
      "npm run ops:run-scale-readiness-convergence-post-month2-convergence-orchestrator-era25 -- --write",
    syncReportCommand: "npm run ops:sync-scale-readiness-convergence-era25-report -- --write",
    validateMonth2ConvergenceCommand:
      "npm run ops:validate-month2-market-readiness-convergence-era25 -- --json",
    validateMonth2ConvergenceIntegrityCommand:
      "npm run ops:validate-month2-market-readiness-convergence-integrity -- --json",
    validateScaleEnvCommand: "npm run ops:validate-scale-readiness-env -- --json",
    integrityValidateCommand:
      "npm run ops:validate-scale-readiness-convergence-integrity -- --json",
    syncIntegrityBaselineCommand:
      "npm run ops:sync-scale-readiness-convergence-integrity-baseline -- --write",
    scaleReadinessConvergenceIntegrityPassed: scaleReadinessConvergenceIntegrity.integrityPassed,
    month2MarketReadinessConvergenceIntegrityPassed:
      scaleReadinessConvergenceIntegrity.month2MarketReadinessConvergenceIntegrityPassed,
    launchWizardHref: `${LAUNCH_WIZARD_ROUTE}${LAUNCH_WIZARD_ERA25_SCALE_READINESS_CONVERGENCE_ANCHOR}`,
    platformOpsHref: `${SERIES_A_PLATFORM_OPS_ROUTE}${SCALE_READINESS_CONVERGENCE_ERA25_PLATFORM_ANCHOR}`,
    integrationHealthHref: "/dashboard/integration-health",
    implementationHref: "/dashboard/implementation",
    seriesAPartnerExpansionConvergence,
  };
}

export function formatScaleReadinessConvergenceEra25Label(
  slice: ScaleReadinessConvergenceEra25UiSlice,
): string {
  const milestone = slice.scaleReadinessConvergenceEra25Milestone.replaceAll("_", " ");
  const status = slice.convergenceBlocked ? "BLOCKED" : "READY";
  const progress = `${slice.completedBlockingCount}/${slice.totalBlockingCount} gates`;
  return `era25 scale readiness convergence · ${status} · ${progress} · ${milestone}`;
}
