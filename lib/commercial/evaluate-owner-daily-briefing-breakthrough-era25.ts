/**
 * era25 Owner Daily Briefing Breakthrough evaluation.
 */
import { loadP0StagingProofArtifact } from "@/lib/commercial/p0-ops-vault-day0-orchestrator-era21";
import {
  OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_BRIEFING_SCHEME,
  OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_DOC,
  OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_GUARDRAILS,
  OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_HUMAN_STEPS,
  OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_EXISTING_LINKS,
} from "@/lib/commercial/owner-daily-briefing-breakthrough-phases-era25";
import {
  allBreakthroughBriefingTilesWired,
  buildOwnerDailyBriefingBreakthroughEra25Tiles,
  countWiredBreakthroughBriefingTiles,
} from "@/lib/briefing/owner-daily-briefing-breakthrough-era25";
import { resolveEra25FirstProductSliceBlueprintMilestoneFromEnv } from "@/lib/commercial/era25-convergence-milestones-from-env-era25";
import { evaluateEra25FirstProductSliceBlueprint } from "@/lib/commercial/evaluate-era25-first-product-slice-blueprint";
import { derivePaidPilotGoConvergenceState } from "@/lib/commercial/load-paid-pilot-go-convergence-state-era25";

export function evaluateOwnerDailyBriefingBreakthroughEra25(
  env: NodeJS.ProcessEnv = process.env,
  root: string = process.cwd(),
): {
  blueprint: ReturnType<typeof evaluateEra25FirstProductSliceBlueprint> & {
    era25FirstProductSliceBlueprintMilestone: ReturnType<
      typeof resolveEra25FirstProductSliceBlueprintMilestoneFromEnv
    >;
  };
  p0ProofStatus: string | null;
  briefingTiles: ReturnType<typeof buildOwnerDailyBriefingBreakthroughEra25Tiles>;
  wiredBriefingTileCount: number;
  allBriefingTilesWired: boolean;
  briefingSchemeCount: number;
  sliceBlocked: boolean;
  guardrails: typeof OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_GUARDRAILS;
  humanSteps: typeof OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_HUMAN_STEPS;
  productDoc: typeof OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_DOC;
  existingLinks: typeof OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_EXISTING_LINKS;
} {
  const blueprintEvaluation = evaluateEra25FirstProductSliceBlueprint(env, root);
  const blueprint = {
    ...blueprintEvaluation,
    era25FirstProductSliceBlueprintMilestone: resolveEra25FirstProductSliceBlueprintMilestoneFromEnv(
      env,
      root,
    ),
  };
  const p0Artifact = loadP0StagingProofArtifact(root);
  const p0ProofStatus = p0Artifact?.p0ProofStatus ?? "awaiting_ops_credentials";
  const briefingSchemeCount = OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_BRIEFING_SCHEME.length;
  const goState = derivePaidPilotGoConvergenceState(root);

  const briefingTiles = buildOwnerDailyBriefingBreakthroughEra25Tiles({
    blueprintMilestone: blueprint.era25FirstProductSliceBlueprintMilestone,
    gatesMilestone: blueprint.gates.era25EngineeringGatesMilestone,
    blueprintBlocked: blueprint.blueprintBlocked,
    p0ProofStatus,
    briefingSchemeCount,
    goState,
  });

  const wiredBriefingTileCount = countWiredBreakthroughBriefingTiles(briefingTiles);
  const allBriefingTilesWired = allBreakthroughBriefingTilesWired(briefingTiles);

  const blueprintReady =
    blueprint.era25FirstProductSliceBlueprintMilestone ===
    "era25_first_product_slice_blueprint_ready";

  const sliceBlocked =
    !blueprintReady ||
    !allBriefingTilesWired ||
    p0ProofStatus !== "proof_passed";

  return {
    blueprint,
    p0ProofStatus,
    briefingTiles,
    wiredBriefingTileCount,
    allBriefingTilesWired,
    briefingSchemeCount,
    sliceBlocked,
    guardrails: OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_GUARDRAILS,
    humanSteps: OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_HUMAN_STEPS,
    productDoc: OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_DOC,
    existingLinks: OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_EXISTING_LINKS,
  };
}
