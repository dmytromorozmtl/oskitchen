/**
 * era25 Pilot Week 1 Execution Convergence UI slice.
 */
import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import { evaluatePilotWeek1ExecutionConvergenceIntegrity } from "@/lib/commercial/pilot-week1-execution-convergence-integrity-era48";
import {
  PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_CONVERGENCE_TARGETS,
  PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_DOC,
  PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_FOREVER_COMMANDS,
  PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_GUARDRAILS,
  PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_HUMAN_STEPS,
  PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_PLATFORM_ANCHOR,
  PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_BACKLOG_ID,
  PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_ERA21_REFERENCE_DOC,
  detectPilotWeek1ExecutionConvergenceEra25Started,
} from "@/lib/commercial/pilot-week1-execution-convergence-phases-era25";
import type { InvestorNarrativeOnepagerSummary } from "@/lib/commercial/investor-narrative-onepager-summary";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { PilotCaseStudyDraftSummary } from "@/lib/commercial/pilot-case-study-draft-summary";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { PilotMetricsBaselineSummary } from "@/lib/commercial/pilot-metrics-baseline-summary";
import type { PilotRollbackDrillSummary } from "@/lib/commercial/pilot-rollback-drill-summary";
import type { Tier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";
import {
  type PilotWeek1ExecutionConvergenceEra25Milestone,
} from "@/lib/commercial/pilot-week1-execution-convergence-post-go-convergence-orchestrator-era25";
import type { PaidPilotGoConvergenceEra25Milestone } from "@/lib/commercial/paid-pilot-go-convergence-post-breakthrough-orchestrator-era25";
import type { PilotWeek1ExecutionPhaseStatus } from "@/lib/commercial/pilot-week1-execution-phases-era21";
import type { LaunchWizardPilotWeek1ExecutionConvergenceSlice } from "@/lib/briefing/pilot-week1-execution-convergence-briefing-era25";
import type { OwnerDailyBriefingRankedAction } from "@/lib/briefing/owner-daily-briefing-era19";
import {
  buildMonth2MarketReadinessConvergenceEra25UiSlice,
  type Month2MarketReadinessConvergenceEra25UiSlice,
} from "@/lib/commercial/month2-market-readiness-convergence-ui-era25";
import { evaluatePilotWeek1ExecutionConvergenceEra25WithMilestones } from "@/scripts/ops/validate-pilot-week1-execution-convergence-era25";
import { SERIES_A_PLATFORM_OPS_ROUTE } from "@/lib/commercial/sustained-operational-excellence-phases-era21";
import { LAUNCH_WIZARD_ROUTE } from "@/lib/launch-wizard/launch-wizard-era19-policy";
import { LAUNCH_WIZARD_ERA25_PILOT_WEEK1_EXECUTION_CONVERGENCE_ANCHOR } from "@/lib/launch-wizard/launch-wizard-era25-pilot-week1-execution-convergence-era48";

export const PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_UI_POLICY_ID =
  "era25-pilot-week1-execution-convergence-ui-v1" as const;

export type PilotWeek1ExecutionConvergenceEra25UiSlice = {
  policyId: typeof PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_UI_POLICY_ID;
  visible: boolean;
  outsideLinearCatalog: boolean;
  pilotWeek1ExecutionConvergenceEra25Milestone: PilotWeek1ExecutionConvergenceEra25Milestone;
  paidPilotGoConvergenceEra25Milestone: PaidPilotGoConvergenceEra25Milestone;
  convergenceBlocked: boolean;
  goConvergenceReady: boolean;
  week1Complete: boolean;
  goDecision: string | null;
  completedPhaseCount: number;
  totalPhaseCount: number;
  phases: readonly PilotWeek1ExecutionPhaseStatus[];
  nextPhaseId: string | null;
  nextPhaseLabel: string | null;
  readyForDay5Smokes: boolean;
  briefingAction: OwnerDailyBriefingRankedAction | null;
  launchWizardSlice: LaunchWizardPilotWeek1ExecutionConvergenceSlice;
  convergenceTargets: typeof PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_CONVERGENCE_TARGETS;
  backlogId: typeof PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_BACKLOG_ID;
  guardrails: readonly string[];
  humanSteps: readonly string[];
  convergenceDoc: typeof PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_DOC;
  era21ReferenceDoc: typeof PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_ERA21_REFERENCE_DOC;
  foreverCommands: readonly string[];
  validateCommand: string;
  postGoConvergenceOrchestratorCommand: string;
  syncReportCommand: string;
  validateGoConvergenceCommand: string;
  validateGoConvergenceIntegrityCommand: string;
  validateWeek1EnvCommand: string;
  integrityValidateCommand: string;
  syncIntegrityBaselineCommand: string;
  pilotWeek1ExecutionConvergenceIntegrityPassed: boolean;
  paidPilotGoConvergenceIntegrityPassed: boolean;
  launchWizardHref: string;
  platformOpsHref: string;
  integrationHealthHref: string;
  month2MarketReadinessConvergence: Month2MarketReadinessConvergenceEra25UiSlice | null;
};

export function buildPilotWeek1ExecutionConvergenceEra25UiSlice(input: {
  goConvergenceVisible: boolean;
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
}): PilotWeek1ExecutionConvergenceEra25UiSlice | null {
  const env = input.env ?? process.env;
  const week1Started = detectPilotWeek1ExecutionConvergenceEra25Started(env);

  if (!input.goConvergenceVisible && !week1Started) return null;

  const p0ProofStatus = input.p0ProofStatus ?? input.p0Staging?.p0ProofStatus ?? null;
  const tier2ProofStatus = input.tier2ProofStatus ?? input.tier2Summary?.tier2ProofStatus ?? null;

  const pilotWeek1ExecutionConvergenceIntegrity = evaluatePilotWeek1ExecutionConvergenceIntegrity(
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

  const result = evaluatePilotWeek1ExecutionConvergenceEra25WithMilestones(env);
  const month2MarketReadinessConvergence = buildMonth2MarketReadinessConvergenceEra25UiSlice({
    week1ConvergenceVisible: true,
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
    policyId: PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_UI_POLICY_ID,
    visible: true,
    outsideLinearCatalog: true,
    pilotWeek1ExecutionConvergenceEra25Milestone:
      result.pilotWeek1ExecutionConvergenceEra25Milestone,
    paidPilotGoConvergenceEra25Milestone:
      result.evaluation.goConvergence.paidPilotGoConvergenceEra25Milestone,
    convergenceBlocked: result.evaluation.convergenceBlocked,
    goConvergenceReady: result.evaluation.goConvergenceReady,
    week1Complete: result.evaluation.week1State.week1Complete,
    goDecision: pilotWeek1ExecutionConvergenceIntegrity.goDecision ?? result.evaluation.week1State.goDecision,
    completedPhaseCount: result.evaluation.week1State.completedPhaseCount,
    totalPhaseCount: result.evaluation.week1State.totalPhaseCount,
    phases: result.evaluation.week1State.phases,
    nextPhaseId: result.evaluation.week1State.nextPhaseId,
    nextPhaseLabel: result.evaluation.week1State.nextPhaseLabel,
    readyForDay5Smokes: result.evaluation.week1State.readyForDay5Smokes,
    briefingAction: result.evaluation.briefingAction,
    launchWizardSlice: result.evaluation.launchWizardSlice,
    convergenceTargets: result.evaluation.convergenceTargets,
    backlogId: PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_BACKLOG_ID,
    guardrails: PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_GUARDRAILS,
    humanSteps: PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_HUMAN_STEPS,
    convergenceDoc: PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_DOC,
    era21ReferenceDoc: PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_ERA21_REFERENCE_DOC,
    foreverCommands: PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_FOREVER_COMMANDS,
    validateCommand: "npm run ops:validate-pilot-week1-execution-convergence-era25 -- --json",
    postGoConvergenceOrchestratorCommand:
      "npm run ops:run-pilot-week1-execution-convergence-post-go-convergence-orchestrator-era25 -- --write",
    syncReportCommand:
      "npm run ops:sync-pilot-week1-execution-convergence-era25-report -- --write",
    validateGoConvergenceCommand:
      "npm run ops:validate-paid-pilot-go-convergence-era25 -- --json",
    validateGoConvergenceIntegrityCommand:
      "npm run ops:validate-paid-pilot-go-convergence-integrity -- --json",
    validateWeek1EnvCommand: "npm run ops:validate-pilot-week1-env -- --json",
    integrityValidateCommand:
      "npm run ops:validate-pilot-week1-execution-convergence-integrity -- --json",
    syncIntegrityBaselineCommand:
      "npm run ops:sync-pilot-week1-execution-convergence-integrity-baseline -- --write",
    pilotWeek1ExecutionConvergenceIntegrityPassed:
      pilotWeek1ExecutionConvergenceIntegrity.integrityPassed,
    paidPilotGoConvergenceIntegrityPassed:
      pilotWeek1ExecutionConvergenceIntegrity.paidPilotGoConvergenceIntegrityPassed,
    launchWizardHref: `${LAUNCH_WIZARD_ROUTE}${LAUNCH_WIZARD_ERA25_PILOT_WEEK1_EXECUTION_CONVERGENCE_ANCHOR}`,
    platformOpsHref: `${SERIES_A_PLATFORM_OPS_ROUTE}${PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_PLATFORM_ANCHOR}`,
    integrationHealthHref: "/dashboard/integration-health#integration-health-pilot-week1",
    month2MarketReadinessConvergence,
  };
}

export function formatPilotWeek1ExecutionConvergenceEra25Label(
  slice: PilotWeek1ExecutionConvergenceEra25UiSlice,
): string {
  const milestone = slice.pilotWeek1ExecutionConvergenceEra25Milestone.replaceAll("_", " ");
  const status = slice.convergenceBlocked ? "BLOCKED" : "READY";
  const progress = `${slice.completedPhaseCount}/${slice.totalPhaseCount} days`;
  return `era25 pilot week 1 execution convergence · ${status} · ${progress} · ${milestone}`;
}
