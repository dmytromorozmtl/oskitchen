/**
 * era25 Market Leader Positioning Convergence UI slice.
 */
import {
  MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_CONVERGENCE_TARGETS,
  MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_DOC,
  MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_FOREVER_COMMANDS,
  MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_GUARDRAILS,
  MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_HUMAN_STEPS,
  MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_PLATFORM_ANCHOR,
  MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_BACKLOG_ID,
  MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_ERA21_REFERENCE_DOC,
} from "@/lib/commercial/market-leader-positioning-convergence-phases-era25";
import {
  type MarketLeaderPositioningConvergenceEra25Milestone,
} from "@/lib/commercial/market-leader-positioning-convergence-post-series-a-convergence-orchestrator-era25";
import type { SeriesAPartnerExpansionConvergenceEra25Milestone } from "@/lib/commercial/series-a-partner-expansion-convergence-post-scale-convergence-orchestrator-era25";
import type { MarketLeaderPositioningPhaseStatus } from "@/lib/commercial/market-leader-positioning-phases-era21";
import type { LaunchWizardMarketLeaderPositioningConvergenceSlice } from "@/lib/briefing/market-leader-positioning-convergence-briefing-era25";
import type { OwnerDailyBriefingRankedAction } from "@/lib/briefing/owner-daily-briefing-era19";
import {
  buildSustainedOperationalExcellenceConvergenceEra25UiSlice,
  type SustainedOperationalExcellenceConvergenceEra25UiSlice,
} from "@/lib/commercial/sustained-operational-excellence-convergence-ui-era25";
import { evaluateMarketLeaderPositioningConvergenceEra25WithMilestones } from "@/scripts/ops/validate-market-leader-positioning-convergence-era25";
import { SERIES_A_PLATFORM_OPS_ROUTE } from "@/lib/commercial/sustained-operational-excellence-phases-era21";

export const MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_UI_POLICY_ID =
  "era25-market-leader-positioning-convergence-ui-v1" as const;

export type MarketLeaderPositioningConvergenceEra25UiSlice = {
  policyId: typeof MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_UI_POLICY_ID;
  visible: boolean;
  outsideLinearCatalog: boolean;
  marketLeaderPositioningConvergenceEra25Milestone: MarketLeaderPositioningConvergenceEra25Milestone;
  seriesAPartnerExpansionConvergenceEra25Milestone: SeriesAPartnerExpansionConvergenceEra25Milestone;
  convergenceBlocked: boolean;
  seriesAConvergenceReady: boolean;
  marketLeaderComplete: boolean;
  goDecision: string | null;
  completedBlockingCount: number;
  totalBlockingCount: number;
  phases: readonly MarketLeaderPositioningPhaseStatus[];
  nextPhaseId: string | null;
  nextPhaseLabel: string | null;
  readyForMoatSmokes: boolean;
  readyForAnalystKitSmokes: boolean;
  briefingAction: OwnerDailyBriefingRankedAction | null;
  launchWizardSlice: LaunchWizardMarketLeaderPositioningConvergenceSlice;
  convergenceTargets: typeof MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_CONVERGENCE_TARGETS;
  backlogId: typeof MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_BACKLOG_ID;
  guardrails: readonly string[];
  humanSteps: readonly string[];
  convergenceDoc: typeof MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_DOC;
  era21ReferenceDoc: typeof MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_ERA21_REFERENCE_DOC;
  foreverCommands: readonly string[];
  validateCommand: string;
  postSeriesAConvergenceOrchestratorCommand: string;
  syncReportCommand: string;
  validateSeriesAConvergenceCommand: string;
  validateMarketLeaderEnvCommand: string;
  launchWizardHref: string;
  platformOpsHref: string;
  reportsHref: string;
  integrationHealthHref: string;
  implementationHref: string;
  ghostKitchenLandingHref: string;
  sustainedOperationalExcellenceConvergence: SustainedOperationalExcellenceConvergenceEra25UiSlice | null;
};

export function buildMarketLeaderPositioningConvergenceEra25UiSlice(input: {
  seriesAConvergenceVisible: boolean;
  env?: NodeJS.ProcessEnv;
}): MarketLeaderPositioningConvergenceEra25UiSlice | null {
  if (!input.seriesAConvergenceVisible) return null;

  const result = evaluateMarketLeaderPositioningConvergenceEra25WithMilestones(input.env);
  const sustainedOperationalExcellenceConvergence =
    buildSustainedOperationalExcellenceConvergenceEra25UiSlice({
      marketLeaderConvergenceVisible: true,
      env: input.env,
    });

  return {
    policyId: MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_UI_POLICY_ID,
    visible: true,
    outsideLinearCatalog: true,
    marketLeaderPositioningConvergenceEra25Milestone:
      result.marketLeaderPositioningConvergenceEra25Milestone,
    seriesAPartnerExpansionConvergenceEra25Milestone:
      result.evaluation.seriesAConvergence.seriesAPartnerExpansionConvergenceEra25Milestone,
    convergenceBlocked: result.evaluation.convergenceBlocked,
    seriesAConvergenceReady: result.evaluation.seriesAConvergenceReady,
    marketLeaderComplete: result.evaluation.marketLeaderState.marketLeaderComplete,
    goDecision: result.evaluation.marketLeaderState.goDecision,
    completedBlockingCount: result.evaluation.marketLeaderState.completedBlockingCount,
    totalBlockingCount: result.evaluation.marketLeaderState.totalBlockingCount,
    phases: result.evaluation.marketLeaderState.phases,
    nextPhaseId: result.evaluation.marketLeaderState.nextPhaseId,
    nextPhaseLabel: result.evaluation.marketLeaderState.nextPhaseLabel,
    readyForMoatSmokes: result.evaluation.marketLeaderState.readyForMoatSmokes,
    readyForAnalystKitSmokes: result.evaluation.marketLeaderState.readyForAnalystKitSmokes,
    briefingAction: result.evaluation.briefingAction,
    launchWizardSlice: result.evaluation.launchWizardSlice,
    convergenceTargets: result.evaluation.convergenceTargets,
    backlogId: MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_BACKLOG_ID,
    guardrails: MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_GUARDRAILS,
    humanSteps: MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_HUMAN_STEPS,
    convergenceDoc: MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_DOC,
    era21ReferenceDoc: MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_ERA21_REFERENCE_DOC,
    foreverCommands: MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_FOREVER_COMMANDS,
    validateCommand:
      "npm run ops:validate-market-leader-positioning-convergence-era25 -- --json",
    postSeriesAConvergenceOrchestratorCommand:
      "npm run ops:run-market-leader-positioning-convergence-post-series-a-convergence-orchestrator-era25 -- --write",
    syncReportCommand:
      "npm run ops:sync-market-leader-positioning-convergence-era25-report -- --write",
    validateSeriesAConvergenceCommand:
      "npm run ops:validate-series-a-partner-expansion-convergence-era25 -- --json",
    validateMarketLeaderEnvCommand: "npm run ops:validate-market-leader-positioning-env -- --json",
    launchWizardHref: result.evaluation.launchWizardSlice.href,
    platformOpsHref: `${SERIES_A_PLATFORM_OPS_ROUTE}${MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_PLATFORM_ANCHOR}`,
    reportsHref: "/dashboard/reports",
    integrationHealthHref: "/dashboard/integration-health",
    implementationHref: "/dashboard/implementation",
    ghostKitchenLandingHref: "/solutions/ghost-kitchens",
    sustainedOperationalExcellenceConvergence,
  };
}

export function formatMarketLeaderPositioningConvergenceEra25Label(
  slice: MarketLeaderPositioningConvergenceEra25UiSlice,
): string {
  const milestone = slice.marketLeaderPositioningConvergenceEra25Milestone.replaceAll("_", " ");
  const status = slice.convergenceBlocked ? "BLOCKED" : "READY";
  const progress = `${slice.completedBlockingCount}/${slice.totalBlockingCount} pillars`;
  return `era25 market leader positioning convergence · ${status} · ${progress} · ${milestone}`;
}
