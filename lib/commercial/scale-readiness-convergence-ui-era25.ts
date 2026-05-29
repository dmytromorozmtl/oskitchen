/**
 * era25 Scale Readiness Convergence UI slice.
 */
import {
  SCALE_READINESS_CONVERGENCE_ERA25_CONVERGENCE_TARGETS,
  SCALE_READINESS_CONVERGENCE_ERA25_DOC,
  SCALE_READINESS_CONVERGENCE_ERA25_FOREVER_COMMANDS,
  SCALE_READINESS_CONVERGENCE_ERA25_GUARDRAILS,
  SCALE_READINESS_CONVERGENCE_ERA25_HUMAN_STEPS,
  SCALE_READINESS_CONVERGENCE_ERA25_PLATFORM_ANCHOR,
  SCALE_READINESS_CONVERGENCE_ERA25_BACKLOG_ID,
  SCALE_READINESS_CONVERGENCE_ERA25_ERA21_REFERENCE_DOC,
} from "@/lib/commercial/scale-readiness-convergence-phases-era25";
import {
  type ScaleReadinessConvergenceEra25Milestone,
} from "@/lib/commercial/scale-readiness-convergence-post-month2-convergence-orchestrator-era25";
import type { Month2MarketReadinessConvergenceEra25Milestone } from "@/lib/commercial/month2-market-readiness-convergence-post-week1-convergence-orchestrator-era25";
import type { ScaleReadinessPhaseStatus } from "@/lib/commercial/scale-readiness-phases-era21";
import type { LaunchWizardScaleReadinessConvergenceSlice } from "@/lib/briefing/scale-readiness-convergence-briefing-era25";
import type { OwnerDailyBriefingRankedAction } from "@/lib/briefing/owner-daily-briefing-era19";
import {
  buildSeriesAPartnerExpansionConvergenceEra25UiSlice,
  type SeriesAPartnerExpansionConvergenceEra25UiSlice,
} from "@/lib/commercial/series-a-partner-expansion-convergence-ui-era25";
import { evaluateScaleReadinessConvergenceEra25WithMilestones } from "@/scripts/ops/validate-scale-readiness-convergence-era25";
import { SERIES_A_PLATFORM_OPS_ROUTE } from "@/lib/commercial/sustained-operational-excellence-phases-era21";

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
  validateScaleEnvCommand: string;
  launchWizardHref: string;
  platformOpsHref: string;
  integrationHealthHref: string;
  implementationHref: string;
  seriesAPartnerExpansionConvergence: SeriesAPartnerExpansionConvergenceEra25UiSlice | null;
};

export function buildScaleReadinessConvergenceEra25UiSlice(input: {
  month2ConvergenceVisible: boolean;
  env?: NodeJS.ProcessEnv;
}): ScaleReadinessConvergenceEra25UiSlice | null {
  if (!input.month2ConvergenceVisible) return null;

  const result = evaluateScaleReadinessConvergenceEra25WithMilestones(input.env);
  const seriesAPartnerExpansionConvergence = buildSeriesAPartnerExpansionConvergenceEra25UiSlice({
    scaleConvergenceVisible: true,
    env: input.env,
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
    goDecision: result.evaluation.scaleState.goDecision,
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
    validateScaleEnvCommand: "npm run ops:validate-scale-readiness-env -- --json",
    launchWizardHref: result.evaluation.launchWizardSlice.href,
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
