/**
 * era25 Market Leader Positioning Convergence UI slice.
 */
import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import { evaluateMarketLeaderPositioningConvergenceIntegrity } from "@/lib/commercial/market-leader-positioning-convergence-integrity-era52";
import {
  MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_CONVERGENCE_TARGETS,
  MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_DOC,
  MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_FOREVER_COMMANDS,
  MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_GUARDRAILS,
  MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_HUMAN_STEPS,
  MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_PLATFORM_ANCHOR,
  MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_BACKLOG_ID,
  MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_ERA21_REFERENCE_DOC,
  detectMarketLeaderPositioningConvergenceEra25Started,
} from "@/lib/commercial/market-leader-positioning-convergence-phases-era25";
import {
  type MarketLeaderPositioningConvergenceEra25Milestone,
} from "@/lib/commercial/market-leader-positioning-convergence-post-series-a-convergence-orchestrator-era25";
import type { SeriesAPartnerExpansionConvergenceEra25Milestone } from "@/lib/commercial/series-a-partner-expansion-convergence-post-scale-convergence-orchestrator-era25";
import type { MarketLeaderPositioningPhaseStatus } from "@/lib/commercial/market-leader-positioning-phases-era21";
import type { LaunchWizardMarketLeaderPositioningConvergenceSlice } from "@/lib/briefing/market-leader-positioning-convergence-briefing-era25";
import type { OwnerDailyBriefingRankedAction } from "@/lib/briefing/owner-daily-briefing-era19";
import type { InvestorNarrativeOnepagerSummary } from "@/lib/commercial/investor-narrative-onepager-summary";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { PilotCaseStudyDraftSummary } from "@/lib/commercial/pilot-case-study-draft-summary";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { PilotMetricsBaselineSummary } from "@/lib/commercial/pilot-metrics-baseline-summary";
import type { PilotRollbackDrillSummary } from "@/lib/commercial/pilot-rollback-drill-summary";
import type { Tier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";
import {
  buildSustainedOperationalExcellenceConvergenceEra25UiSlice,
  type SustainedOperationalExcellenceConvergenceEra25UiSlice,
} from "@/lib/commercial/sustained-operational-excellence-convergence-ui-era25";
import { evaluateMarketLeaderPositioningConvergenceEra25WithMilestones } from "@/scripts/ops/validate-market-leader-positioning-convergence-era25";
import { SERIES_A_PLATFORM_OPS_ROUTE } from "@/lib/commercial/sustained-operational-excellence-phases-era21";
import { LAUNCH_WIZARD_ROUTE } from "@/lib/launch-wizard/launch-wizard-era19-policy";
import { LAUNCH_WIZARD_ERA25_MARKET_LEADER_POSITIONING_CONVERGENCE_ANCHOR } from "@/lib/launch-wizard/launch-wizard-era25-market-leader-positioning-convergence-era52";

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
  validateSeriesAConvergenceIntegrityCommand: string;
  validateMarketLeaderEnvCommand: string;
  integrityValidateCommand: string;
  syncIntegrityBaselineCommand: string;
  marketLeaderPositioningConvergenceIntegrityPassed: boolean;
  seriesAPartnerExpansionConvergenceIntegrityPassed: boolean;
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
}): MarketLeaderPositioningConvergenceEra25UiSlice | null {
  const env = input.env ?? process.env;
  const marketLeaderStarted = detectMarketLeaderPositioningConvergenceEra25Started(env);

  if (!input.seriesAConvergenceVisible && !marketLeaderStarted) return null;

  const p0ProofStatus = input.p0ProofStatus ?? input.p0Staging?.p0ProofStatus ?? null;
  const tier2ProofStatus = input.tier2ProofStatus ?? input.tier2Summary?.tier2ProofStatus ?? null;

  const marketLeaderPositioningConvergenceIntegrity = evaluateMarketLeaderPositioningConvergenceIntegrity(
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

  const result = evaluateMarketLeaderPositioningConvergenceEra25WithMilestones(env);
  const sustainedOperationalExcellenceConvergence =
    buildSustainedOperationalExcellenceConvergenceEra25UiSlice({
      marketLeaderConvergenceVisible: true,
      env,
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
    goDecision:
      marketLeaderPositioningConvergenceIntegrity.goDecision ??
      result.evaluation.marketLeaderState.goDecision,
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
    validateSeriesAConvergenceIntegrityCommand:
      "npm run ops:validate-series-a-partner-expansion-convergence-integrity -- --json",
    validateMarketLeaderEnvCommand: "npm run ops:validate-market-leader-positioning-env -- --json",
    integrityValidateCommand:
      "npm run ops:validate-market-leader-positioning-convergence-integrity -- --json",
    syncIntegrityBaselineCommand:
      "npm run ops:sync-market-leader-positioning-convergence-integrity-baseline -- --write",
    marketLeaderPositioningConvergenceIntegrityPassed:
      marketLeaderPositioningConvergenceIntegrity.integrityPassed,
    seriesAPartnerExpansionConvergenceIntegrityPassed:
      marketLeaderPositioningConvergenceIntegrity.seriesAPartnerExpansionConvergenceIntegrityPassed,
    launchWizardHref: `${LAUNCH_WIZARD_ROUTE}${LAUNCH_WIZARD_ERA25_MARKET_LEADER_POSITIONING_CONVERGENCE_ANCHOR}`,
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
