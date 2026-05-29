/**
 * era25 Series A / Partner Expansion Convergence UI slice.
 */
import {
  SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_CONVERGENCE_TARGETS,
  SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_DOC,
  SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_FOREVER_COMMANDS,
  SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_GUARDRAILS,
  SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_HUMAN_STEPS,
  SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_PLATFORM_ANCHOR,
  SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_BACKLOG_ID,
  SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_ERA21_REFERENCE_DOC,
} from "@/lib/commercial/series-a-partner-expansion-convergence-phases-era25";
import {
  type SeriesAPartnerExpansionConvergenceEra25Milestone,
} from "@/lib/commercial/series-a-partner-expansion-convergence-post-scale-convergence-orchestrator-era25";
import type { ScaleReadinessConvergenceEra25Milestone } from "@/lib/commercial/scale-readiness-convergence-post-month2-convergence-orchestrator-era25";
import type { SeriesAPartnerExpansionPhaseStatus } from "@/lib/commercial/series-a-partner-expansion-phases-era21";
import type { LaunchWizardSeriesAPartnerExpansionConvergenceSlice } from "@/lib/briefing/series-a-partner-expansion-convergence-briefing-era25";
import type { OwnerDailyBriefingRankedAction } from "@/lib/briefing/owner-daily-briefing-era19";
import { evaluateSeriesAPartnerExpansionConvergenceEra25WithMilestones } from "@/scripts/ops/validate-series-a-partner-expansion-convergence-era25";
import { SERIES_A_PLATFORM_OPS_ROUTE } from "@/lib/commercial/sustained-operational-excellence-phases-era21";

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
  validateSeriesAEnvCommand: string;
  launchWizardHref: string;
  platformOpsHref: string;
  reportsHref: string;
  integrationHealthHref: string;
  implementationHref: string;
};

export function buildSeriesAPartnerExpansionConvergenceEra25UiSlice(input: {
  scaleConvergenceVisible: boolean;
  env?: NodeJS.ProcessEnv;
}): SeriesAPartnerExpansionConvergenceEra25UiSlice | null {
  if (!input.scaleConvergenceVisible) return null;

  const result = evaluateSeriesAPartnerExpansionConvergenceEra25WithMilestones(input.env);

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
    goDecision: result.evaluation.seriesAState.goDecision,
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
    validateSeriesAEnvCommand: "npm run ops:validate-series-a-partner-expansion-env -- --json",
    launchWizardHref: result.evaluation.launchWizardSlice.href,
    platformOpsHref: `${SERIES_A_PLATFORM_OPS_ROUTE}${SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_PLATFORM_ANCHOR}`,
    reportsHref: "/dashboard/reports",
    integrationHealthHref: "/dashboard/integration-health",
    implementationHref: "/dashboard/implementation",
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
