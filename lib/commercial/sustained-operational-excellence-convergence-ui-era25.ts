/**
 * era25 Sustained Operational Excellence Convergence UI slice.
 */
import {
  SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_CONVERGENCE_TARGETS,
  SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_DOC,
  SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_FOREVER_COMMANDS,
  SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_GUARDRAILS,
  SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_HUMAN_STEPS,
  SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_PLATFORM_ANCHOR,
  SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_BACKLOG_ID,
  SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_ERA21_REFERENCE_DOC,
} from "@/lib/commercial/sustained-operational-excellence-convergence-phases-era25";
import {
  type SustainedOperationalExcellenceConvergenceEra25Milestone,
} from "@/lib/commercial/sustained-operational-excellence-convergence-post-market-leader-convergence-orchestrator-era25";
import type { MarketLeaderPositioningConvergenceEra25Milestone } from "@/lib/commercial/market-leader-positioning-convergence-post-series-a-convergence-orchestrator-era25";
import type { SustainedOperationalExcellencePhaseStatus } from "@/lib/commercial/sustained-operational-excellence-phases-era21";
import type { LaunchWizardSustainedOperationalExcellenceConvergenceSlice } from "@/lib/briefing/sustained-operational-excellence-convergence-briefing-era25";
import type { OwnerDailyBriefingRankedAction } from "@/lib/briefing/owner-daily-briefing-era19";
import { evaluateSustainedOperationalExcellenceConvergenceEra25WithMilestones } from "@/scripts/ops/validate-sustained-operational-excellence-convergence-era25";
import {
  SERIES_A_PLATFORM_OPS_ROUTE,
  SUSTAINED_OPS_ORDER_HUB_ROUTE,
  SUSTAINED_OPS_PRODUCTION_CALENDAR_ROUTE,
} from "@/lib/commercial/sustained-operational-excellence-phases-era21";

export const SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_UI_POLICY_ID =
  "era25-sustained-operational-excellence-convergence-ui-v1" as const;

export type SustainedOperationalExcellenceConvergenceEra25UiSlice = {
  policyId: typeof SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_UI_POLICY_ID;
  visible: boolean;
  outsideLinearCatalog: boolean;
  sustainedOperationalExcellenceConvergenceEra25Milestone: SustainedOperationalExcellenceConvergenceEra25Milestone;
  marketLeaderPositioningConvergenceEra25Milestone: MarketLeaderPositioningConvergenceEra25Milestone;
  convergenceBlocked: boolean;
  marketLeaderConvergenceReady: boolean;
  sustainedOpsComplete: boolean;
  goDecision: string | null;
  completedBlockingCount: number;
  totalBlockingCount: number;
  phases: readonly SustainedOperationalExcellencePhaseStatus[];
  nextPhaseId: string | null;
  nextPhaseLabel: string | null;
  readyForIntegrationSmokes: boolean;
  readyForMetricsSmokes: boolean;
  briefingAction: OwnerDailyBriefingRankedAction | null;
  launchWizardSlice: LaunchWizardSustainedOperationalExcellenceConvergenceSlice;
  convergenceTargets: typeof SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_CONVERGENCE_TARGETS;
  backlogId: typeof SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_BACKLOG_ID;
  guardrails: readonly string[];
  humanSteps: readonly string[];
  convergenceDoc: typeof SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_DOC;
  era21ReferenceDoc: typeof SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_ERA21_REFERENCE_DOC;
  foreverCommands: readonly string[];
  validateCommand: string;
  postMarketLeaderConvergenceOrchestratorCommand: string;
  syncReportCommand: string;
  validateMarketLeaderConvergenceCommand: string;
  validateSustainedOpsEnvCommand: string;
  launchWizardHref: string;
  platformOpsHref: string;
  todayHref: string;
  orderHubHref: string;
  productionCalendarHref: string;
  integrationHealthHref: string;
  reportsHref: string;
  implementationHref: string;
};

export function buildSustainedOperationalExcellenceConvergenceEra25UiSlice(input: {
  marketLeaderConvergenceVisible: boolean;
  env?: NodeJS.ProcessEnv;
}): SustainedOperationalExcellenceConvergenceEra25UiSlice | null {
  if (!input.marketLeaderConvergenceVisible) return null;

  const result = evaluateSustainedOperationalExcellenceConvergenceEra25WithMilestones(input.env);

  return {
    policyId: SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_UI_POLICY_ID,
    visible: true,
    outsideLinearCatalog: true,
    sustainedOperationalExcellenceConvergenceEra25Milestone:
      result.sustainedOperationalExcellenceConvergenceEra25Milestone,
    marketLeaderPositioningConvergenceEra25Milestone:
      result.evaluation.marketLeaderConvergence.marketLeaderPositioningConvergenceEra25Milestone,
    convergenceBlocked: result.evaluation.convergenceBlocked,
    marketLeaderConvergenceReady: result.evaluation.marketLeaderConvergenceReady,
    sustainedOpsComplete: result.evaluation.sustainedOpsState.sustainedOpsComplete,
    goDecision: result.evaluation.sustainedOpsState.goDecision,
    completedBlockingCount: result.evaluation.sustainedOpsState.completedBlockingCount,
    totalBlockingCount: result.evaluation.sustainedOpsState.totalBlockingCount,
    phases: result.evaluation.sustainedOpsState.phases,
    nextPhaseId: result.evaluation.sustainedOpsState.nextPhaseId,
    nextPhaseLabel: result.evaluation.sustainedOpsState.nextPhaseLabel,
    readyForIntegrationSmokes: result.evaluation.sustainedOpsState.readyForIntegrationSmokes,
    readyForMetricsSmokes: result.evaluation.sustainedOpsState.readyForMetricsSmokes,
    briefingAction: result.evaluation.briefingAction,
    launchWizardSlice: result.evaluation.launchWizardSlice,
    convergenceTargets: result.evaluation.convergenceTargets,
    backlogId: SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_BACKLOG_ID,
    guardrails: SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_GUARDRAILS,
    humanSteps: SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_HUMAN_STEPS,
    convergenceDoc: SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_DOC,
    era21ReferenceDoc: SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_ERA21_REFERENCE_DOC,
    foreverCommands: SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_FOREVER_COMMANDS,
    validateCommand:
      "npm run ops:validate-sustained-operational-excellence-convergence-era25 -- --json",
    postMarketLeaderConvergenceOrchestratorCommand:
      "npm run ops:run-sustained-operational-excellence-convergence-post-market-leader-convergence-orchestrator-era25 -- --write",
    syncReportCommand:
      "npm run ops:sync-sustained-operational-excellence-convergence-era25-report -- --write",
    validateMarketLeaderConvergenceCommand:
      "npm run ops:validate-market-leader-positioning-convergence-era25 -- --json",
    validateSustainedOpsEnvCommand:
      "npm run ops:validate-sustained-operational-excellence-env -- --json",
    launchWizardHref: result.evaluation.launchWizardSlice.href,
    platformOpsHref: `${SERIES_A_PLATFORM_OPS_ROUTE}${SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_PLATFORM_ANCHOR}`,
    todayHref: "/dashboard/today",
    orderHubHref: SUSTAINED_OPS_ORDER_HUB_ROUTE,
    productionCalendarHref: SUSTAINED_OPS_PRODUCTION_CALENDAR_ROUTE,
    integrationHealthHref: "/dashboard/integration-health",
    reportsHref: "/dashboard/reports",
    implementationHref: "/dashboard/implementation",
  };
}

export function formatSustainedOperationalExcellenceConvergenceEra25Label(
  slice: SustainedOperationalExcellenceConvergenceEra25UiSlice,
): string {
  const milestone = slice.sustainedOperationalExcellenceConvergenceEra25Milestone.replaceAll(
    "_",
    " ",
  );
  const status = slice.convergenceBlocked ? "BLOCKED" : "READY";
  const progress = `${slice.completedBlockingCount}/${slice.totalBlockingCount} cadences`;
  return `era25 sustained operational excellence convergence · ${status} · ${progress} · ${milestone}`;
}
