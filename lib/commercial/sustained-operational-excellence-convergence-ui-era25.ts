/**
 * era25 Sustained Operational Excellence Convergence UI slice.
 */
import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import { evaluateSustainedOperationalExcellenceConvergenceIntegrity } from "@/lib/commercial/sustained-operational-excellence-convergence-integrity-era53";
import {
  SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_CONVERGENCE_TARGETS,
  SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_DOC,
  SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_FOREVER_COMMANDS,
  SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_GUARDRAILS,
  SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_HUMAN_STEPS,
  SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_PLATFORM_ANCHOR,
  SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_BACKLOG_ID,
  SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_ERA21_REFERENCE_DOC,
  detectSustainedOperationalExcellenceConvergenceEra25Started,
} from "@/lib/commercial/sustained-operational-excellence-convergence-phases-era25";
import {
  type SustainedOperationalExcellenceConvergenceEra25Milestone,
} from "@/lib/commercial/sustained-operational-excellence-convergence-post-market-leader-convergence-orchestrator-era25";
import type { MarketLeaderPositioningConvergenceEra25Milestone } from "@/lib/commercial/market-leader-positioning-convergence-post-series-a-convergence-orchestrator-era25";
import type { SustainedOperationalExcellencePhaseStatus } from "@/lib/commercial/sustained-operational-excellence-phases-era21";
import type { LaunchWizardSustainedOperationalExcellenceConvergenceSlice } from "@/lib/briefing/sustained-operational-excellence-convergence-briefing-era25";
import type { OwnerDailyBriefingRankedAction } from "@/lib/briefing/owner-daily-briefing-era19";
import type { InvestorNarrativeOnepagerSummary } from "@/lib/commercial/investor-narrative-onepager-summary";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { PilotCaseStudyDraftSummary } from "@/lib/commercial/pilot-case-study-draft-summary";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { PilotMetricsBaselineSummary } from "@/lib/commercial/pilot-metrics-baseline-summary";
import type { PilotRollbackDrillSummary } from "@/lib/commercial/pilot-rollback-drill-summary";
import type { Tier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";
import {
  buildPureOperationalModeTerminusEra25UiSlice,
  type PureOperationalModeTerminusEra25UiSlice,
} from "@/lib/commercial/pure-operational-mode-terminus-ui-era25";
import { evaluateSustainedOperationalExcellenceConvergenceEra25WithMilestones } from "@/scripts/ops/validate-sustained-operational-excellence-convergence-era25";
import {
  SERIES_A_PLATFORM_OPS_ROUTE,
  SUSTAINED_OPS_ORDER_HUB_ROUTE,
  SUSTAINED_OPS_PRODUCTION_CALENDAR_ROUTE,
} from "@/lib/commercial/sustained-operational-excellence-phases-era21";
import { LAUNCH_WIZARD_ROUTE } from "@/lib/launch-wizard/launch-wizard-era19-policy";
import { LAUNCH_WIZARD_ERA25_SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ANCHOR } from "@/lib/launch-wizard/launch-wizard-era25-sustained-operational-excellence-convergence-era53";

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
  validateMarketLeaderConvergenceIntegrityCommand: string;
  validateSustainedOpsEnvCommand: string;
  integrityValidateCommand: string;
  syncIntegrityBaselineCommand: string;
  sustainedOperationalExcellenceConvergenceIntegrityPassed: boolean;
  marketLeaderPositioningConvergenceIntegrityPassed: boolean;
  launchWizardHref: string;
  platformOpsHref: string;
  todayHref: string;
  orderHubHref: string;
  productionCalendarHref: string;
  integrationHealthHref: string;
  reportsHref: string;
  implementationHref: string;
  pureOperationalModeTerminus: PureOperationalModeTerminusEra25UiSlice | null;
};

export function buildSustainedOperationalExcellenceConvergenceEra25UiSlice(input: {
  marketLeaderConvergenceVisible: boolean;
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
}): SustainedOperationalExcellenceConvergenceEra25UiSlice | null {
  const env = input.env ?? process.env;
  const sustainedOpsStarted = detectSustainedOperationalExcellenceConvergenceEra25Started(env);

  if (!input.marketLeaderConvergenceVisible && !sustainedOpsStarted) return null;

  const p0ProofStatus = input.p0ProofStatus ?? input.p0Staging?.p0ProofStatus ?? null;
  const tier2ProofStatus = input.tier2ProofStatus ?? input.tier2Summary?.tier2ProofStatus ?? null;

  const sustainedOperationalExcellenceConvergenceIntegrity =
    evaluateSustainedOperationalExcellenceConvergenceIntegrity(process.cwd(), {
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
    });

  const result = evaluateSustainedOperationalExcellenceConvergenceEra25WithMilestones(env);
  const pureOperationalModeTerminus = buildPureOperationalModeTerminusEra25UiSlice({
    sustainedOpsConvergenceVisible: true,
    env,
  });

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
    goDecision:
      sustainedOperationalExcellenceConvergenceIntegrity.goDecision ??
      result.evaluation.sustainedOpsState.goDecision,
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
    validateMarketLeaderConvergenceIntegrityCommand:
      "npm run ops:validate-market-leader-positioning-convergence-integrity -- --json",
    validateSustainedOpsEnvCommand:
      "npm run ops:validate-sustained-operational-excellence-env -- --json",
    integrityValidateCommand:
      "npm run ops:validate-sustained-operational-excellence-convergence-integrity -- --json",
    syncIntegrityBaselineCommand:
      "npm run ops:sync-sustained-operational-excellence-convergence-integrity-baseline -- --write",
    sustainedOperationalExcellenceConvergenceIntegrityPassed:
      sustainedOperationalExcellenceConvergenceIntegrity.integrityPassed,
    marketLeaderPositioningConvergenceIntegrityPassed:
      sustainedOperationalExcellenceConvergenceIntegrity.marketLeaderPositioningConvergenceIntegrityPassed,
    launchWizardHref: `${LAUNCH_WIZARD_ROUTE}${LAUNCH_WIZARD_ERA25_SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ANCHOR}`,
    platformOpsHref: `${SERIES_A_PLATFORM_OPS_ROUTE}${SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_PLATFORM_ANCHOR}`,
    todayHref: "/dashboard/today",
    orderHubHref: SUSTAINED_OPS_ORDER_HUB_ROUTE,
    productionCalendarHref: SUSTAINED_OPS_PRODUCTION_CALENDAR_ROUTE,
    integrationHealthHref: "/dashboard/integration-health",
    reportsHref: "/dashboard/reports",
    implementationHref: "/dashboard/implementation",
    pureOperationalModeTerminus,
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
