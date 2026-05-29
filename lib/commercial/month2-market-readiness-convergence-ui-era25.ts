/**
 * era25 Month 2 Market Readiness Convergence UI slice.
 */
import {
  MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_CONVERGENCE_TARGETS,
  MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_DOC,
  MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_FOREVER_COMMANDS,
  MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_GUARDRAILS,
  MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_HUMAN_STEPS,
  MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_PLATFORM_ANCHOR,
  MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_BACKLOG_ID,
  MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_ERA21_REFERENCE_DOC,
} from "@/lib/commercial/month2-market-readiness-convergence-phases-era25";
import {
  type Month2MarketReadinessConvergenceEra25Milestone,
} from "@/lib/commercial/month2-market-readiness-convergence-post-week1-convergence-orchestrator-era25";
import type { PilotWeek1ExecutionConvergenceEra25Milestone } from "@/lib/commercial/pilot-week1-execution-convergence-post-go-convergence-orchestrator-era25";
import type { Month2MarketReadinessPhaseStatus } from "@/lib/commercial/month2-market-readiness-phases-era21";
import type { LaunchWizardMonth2MarketReadinessConvergenceSlice } from "@/lib/briefing/month2-market-readiness-convergence-briefing-era25";
import type { OwnerDailyBriefingRankedAction } from "@/lib/briefing/owner-daily-briefing-era19";
import { evaluateMonth2MarketReadinessConvergenceEra25WithMilestones } from "@/scripts/ops/validate-month2-market-readiness-convergence-era25";
import { SERIES_A_PLATFORM_OPS_ROUTE } from "@/lib/commercial/sustained-operational-excellence-phases-era21";

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
  validateMonth2EnvCommand: string;
  launchWizardHref: string;
  platformOpsHref: string;
  reportsHref: string;
  ghostKitchenLandingHref: string;
};

export function buildMonth2MarketReadinessConvergenceEra25UiSlice(input: {
  week1ConvergenceVisible: boolean;
  env?: NodeJS.ProcessEnv;
}): Month2MarketReadinessConvergenceEra25UiSlice | null {
  if (!input.week1ConvergenceVisible) return null;

  const result = evaluateMonth2MarketReadinessConvergenceEra25WithMilestones(input.env);

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
    goDecision: result.evaluation.month2State.goDecision,
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
    validateMonth2EnvCommand: "npm run ops:validate-month2-market-readiness-env -- --json",
    launchWizardHref: result.evaluation.launchWizardSlice.href,
    platformOpsHref: `${SERIES_A_PLATFORM_OPS_ROUTE}${MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_PLATFORM_ANCHOR}`,
    reportsHref: "/dashboard/reports",
    ghostKitchenLandingHref: "/solutions/ghost-kitchens",
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
