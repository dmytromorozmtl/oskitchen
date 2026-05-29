/**
 * era25 Owner Daily Briefing Breakthrough UI slice.
 */
import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import { evaluateOwnerDailyBriefingBreakthroughIntegrity } from "@/lib/commercial/owner-daily-briefing-breakthrough-integrity-era46";
import {
  buildPaidPilotGoConvergenceEra25UiSlice,
  type PaidPilotGoConvergenceEra25UiSlice,
} from "@/lib/commercial/paid-pilot-go-convergence-ui-era25";
import {
  OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_DOC,
  OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_FOREVER_COMMANDS,
  OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_GUARDRAILS,
  OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_HUMAN_STEPS,
  OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_PLATFORM_ANCHOR,
  OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_BACKLOG_ID,
  OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_BRIEFING_SCHEME,
  OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_EXISTING_LINKS,
  detectOwnerDailyBriefingBreakthroughEra25Started,
} from "@/lib/commercial/owner-daily-briefing-breakthrough-phases-era25";
import {
  type OwnerDailyBriefingBreakthroughEra25Milestone,
} from "@/lib/commercial/owner-daily-briefing-breakthrough-post-gates-orchestrator-era25";
import type { OwnerDailyBriefingBreakthroughEra25Tile } from "@/lib/briefing/owner-daily-briefing-breakthrough-era25";
import type { Era25FirstProductSliceBlueprintMilestone } from "@/lib/commercial/era25-first-product-slice-blueprint-post-gates-orchestrator-era24";
import type { InvestorNarrativeOnepagerSummary } from "@/lib/commercial/investor-narrative-onepager-summary";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { PilotCaseStudyDraftSummary } from "@/lib/commercial/pilot-case-study-draft-summary";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { PilotMetricsBaselineSummary } from "@/lib/commercial/pilot-metrics-baseline-summary";
import type { PilotRollbackDrillSummary } from "@/lib/commercial/pilot-rollback-drill-summary";
import { evaluateOwnerDailyBriefingBreakthroughEra25WithMilestones } from "@/scripts/ops/validate-owner-daily-briefing-breakthrough-era25";
import { SERIES_A_PLATFORM_OPS_ROUTE } from "@/lib/commercial/sustained-operational-excellence-phases-era21";
import type { Tier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";
import { LAUNCH_WIZARD_ROUTE } from "@/lib/launch-wizard/launch-wizard-era19-policy";
import { LAUNCH_WIZARD_ERA25_OWNER_DAILY_BRIEFING_BREAKTHROUGH_ANCHOR } from "@/lib/launch-wizard/launch-wizard-era25-owner-daily-briefing-breakthrough-era46";

export const OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_UI_POLICY_ID =
  "era25-owner-daily-briefing-breakthrough-ui-v1" as const;

export type OwnerDailyBriefingBreakthroughEra25UiSlice = {
  policyId: typeof OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_UI_POLICY_ID;
  visible: boolean;
  outsideLinearCatalog: boolean;
  goDecision: string | null;
  ownerDailyBriefingBreakthroughEra25Milestone: OwnerDailyBriefingBreakthroughEra25Milestone;
  era25FirstProductSliceBlueprintMilestone: Era25FirstProductSliceBlueprintMilestone;
  sliceBlocked: boolean;
  p0ProofStatus: string | null;
  wiredBriefingTileCount: number;
  briefingSchemeCount: number;
  allBriefingTilesWired: boolean;
  briefingTiles: readonly OwnerDailyBriefingBreakthroughEra25Tile[];
  briefingScheme: typeof OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_BRIEFING_SCHEME;
  existingLinks: typeof OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_EXISTING_LINKS;
  backlogId: typeof OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_BACKLOG_ID;
  guardrails: readonly string[];
  humanSteps: readonly string[];
  productDoc: typeof OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_DOC;
  foreverCommands: readonly string[];
  validateCommand: string;
  postGatesOrchestratorCommand: string;
  syncReportCommand: string;
  validateBlueprintCommand: string;
  validateBlueprintIntegrityCommand: string;
  integrityValidateCommand: string;
  syncIntegrityBaselineCommand: string;
  ownerDailyBriefingBreakthroughIntegrityPassed: boolean;
  era25FirstProductSliceBlueprintIntegrityPassed: boolean;
  todayHref: string;
  launchWizardHref: string;
  platformOpsHref: string;
  paidPilotGoConvergence: PaidPilotGoConvergenceEra25UiSlice | null;
};

export function buildOwnerDailyBriefingBreakthroughEra25UiSlice(input: {
  blueprintVisible: boolean;
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
}): OwnerDailyBriefingBreakthroughEra25UiSlice | null {
  const env = input.env ?? process.env;
  const breakthroughStarted = detectOwnerDailyBriefingBreakthroughEra25Started(env);

  if (!input.blueprintVisible && !breakthroughStarted) return null;

  const p0ProofStatus = input.p0ProofStatus ?? input.p0Staging?.p0ProofStatus ?? null;
  const tier2ProofStatus = input.tier2ProofStatus ?? input.tier2Summary?.tier2ProofStatus ?? null;

  const ownerDailyBriefingBreakthroughIntegrity = evaluateOwnerDailyBriefingBreakthroughIntegrity(
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

  const result = evaluateOwnerDailyBriefingBreakthroughEra25WithMilestones(env);
  const paidPilotGoConvergence = buildPaidPilotGoConvergenceEra25UiSlice({
    breakthroughVisible: true,
    env,
  });

  return {
    policyId: OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_UI_POLICY_ID,
    visible: true,
    outsideLinearCatalog: true,
    goDecision: ownerDailyBriefingBreakthroughIntegrity.goDecision,
    ownerDailyBriefingBreakthroughEra25Milestone:
      result.ownerDailyBriefingBreakthroughEra25Milestone,
    era25FirstProductSliceBlueprintMilestone:
      result.evaluation.blueprint.era25FirstProductSliceBlueprintMilestone,
    sliceBlocked: result.evaluation.sliceBlocked,
    p0ProofStatus: result.evaluation.p0ProofStatus,
    wiredBriefingTileCount: result.evaluation.wiredBriefingTileCount,
    briefingSchemeCount: result.evaluation.briefingSchemeCount,
    allBriefingTilesWired: result.evaluation.allBriefingTilesWired,
    briefingTiles: result.evaluation.briefingTiles,
    briefingScheme: OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_BRIEFING_SCHEME,
    existingLinks: result.evaluation.existingLinks,
    backlogId: OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_BACKLOG_ID,
    guardrails: OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_GUARDRAILS,
    humanSteps: OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_HUMAN_STEPS,
    productDoc: OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_DOC,
    foreverCommands: OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_FOREVER_COMMANDS,
    validateCommand: "npm run ops:validate-owner-daily-briefing-breakthrough-era25 -- --json",
    postGatesOrchestratorCommand:
      "npm run ops:run-owner-daily-briefing-breakthrough-post-gates-orchestrator-era25 -- --write",
    syncReportCommand:
      "npm run ops:sync-owner-daily-briefing-breakthrough-era25-report -- --write",
    validateBlueprintCommand:
      "npm run ops:validate-era25-first-product-slice-blueprint -- --json",
    validateBlueprintIntegrityCommand:
      "npm run ops:validate-era25-first-product-slice-blueprint-integrity -- --json",
    integrityValidateCommand:
      "npm run ops:validate-owner-daily-briefing-breakthrough-integrity -- --json",
    syncIntegrityBaselineCommand:
      "npm run ops:sync-owner-daily-briefing-breakthrough-integrity-baseline -- --write",
    ownerDailyBriefingBreakthroughIntegrityPassed:
      ownerDailyBriefingBreakthroughIntegrity.integrityPassed,
    era25FirstProductSliceBlueprintIntegrityPassed:
      ownerDailyBriefingBreakthroughIntegrity.era25FirstProductSliceBlueprintIntegrityPassed,
    todayHref: `/dashboard/today${OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_PLATFORM_ANCHOR}`,
    launchWizardHref: `${LAUNCH_WIZARD_ROUTE}${LAUNCH_WIZARD_ERA25_OWNER_DAILY_BRIEFING_BREAKTHROUGH_ANCHOR}`,
    platformOpsHref: `${SERIES_A_PLATFORM_OPS_ROUTE}${OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_PLATFORM_ANCHOR}`,
    paidPilotGoConvergence,
  };
}

export function formatOwnerDailyBriefingBreakthroughEra25Label(
  slice: OwnerDailyBriefingBreakthroughEra25UiSlice,
): string {
  const milestone = slice.ownerDailyBriefingBreakthroughEra25Milestone.replaceAll("_", " ");
  const status = slice.sliceBlocked ? "BLOCKED" : "READY";
  return `era25 owner daily briefing breakthrough · ${status} · ${milestone} · B tiles ${slice.wiredBriefingTileCount}/${slice.briefingSchemeCount}`;
}
