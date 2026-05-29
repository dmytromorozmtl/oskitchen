/**
 * era25 Owner Daily Briefing Breakthrough UI slice.
 */
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
} from "@/lib/commercial/owner-daily-briefing-breakthrough-phases-era25";
import {
  type OwnerDailyBriefingBreakthroughEra25Milestone,
} from "@/lib/commercial/owner-daily-briefing-breakthrough-post-gates-orchestrator-era25";
import type { OwnerDailyBriefingBreakthroughEra25Tile } from "@/lib/briefing/owner-daily-briefing-breakthrough-era25";
import type { Era25FirstProductSliceBlueprintMilestone } from "@/lib/commercial/era25-first-product-slice-blueprint-post-gates-orchestrator-era24";
import { evaluateOwnerDailyBriefingBreakthroughEra25WithMilestones } from "@/scripts/ops/validate-owner-daily-briefing-breakthrough-era25";
import { SERIES_A_PLATFORM_OPS_ROUTE } from "@/lib/commercial/sustained-operational-excellence-phases-era21";

export const OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_UI_POLICY_ID =
  "era25-owner-daily-briefing-breakthrough-ui-v1" as const;

export type OwnerDailyBriefingBreakthroughEra25UiSlice = {
  policyId: typeof OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_UI_POLICY_ID;
  visible: boolean;
  outsideLinearCatalog: boolean;
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
  todayHref: string;
  platformOpsHref: string;
  paidPilotGoConvergence: PaidPilotGoConvergenceEra25UiSlice | null;
};

export function buildOwnerDailyBriefingBreakthroughEra25UiSlice(input: {
  blueprintVisible: boolean;
  env?: NodeJS.ProcessEnv;
}): OwnerDailyBriefingBreakthroughEra25UiSlice | null {
  if (!input.blueprintVisible) return null;

  const result = evaluateOwnerDailyBriefingBreakthroughEra25WithMilestones(input.env);
  const paidPilotGoConvergence = buildPaidPilotGoConvergenceEra25UiSlice({
    breakthroughVisible: true,
    env: input.env,
  });

  return {
    policyId: OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_UI_POLICY_ID,
    visible: true,
    outsideLinearCatalog: true,
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
    todayHref: `/dashboard/today${OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_PLATFORM_ANCHOR}`,
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
