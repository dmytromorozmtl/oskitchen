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
import { evaluateEra25FirstProductSliceBlueprintWithMilestones } from "@/scripts/ops/validate-era25-first-product-slice-blueprint";
import { derivePaidPilotGoConvergenceState } from "@/lib/commercial/load-paid-pilot-go-convergence-state-era25";

export function evaluateOwnerDailyBriefingBreakthroughEra25(
  env: NodeJS.ProcessEnv = process.env,
  root: string = process.cwd(),
): {
  blueprint: ReturnType<typeof evaluateEra25FirstProductSliceBlueprintWithMilestones>;
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
  const blueprint = evaluateEra25FirstProductSliceBlueprintWithMilestones(env);
  const p0Artifact = loadP0StagingProofArtifact(root);
  const p0ProofStatus = p0Artifact?.p0ProofStatus ?? "awaiting_ops_credentials";
  const briefingSchemeCount = OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_BRIEFING_SCHEME.length;
  const goState = derivePaidPilotGoConvergenceState(root);

  const briefingTiles = buildOwnerDailyBriefingBreakthroughEra25Tiles({
    blueprintMilestone: blueprint.era25FirstProductSliceBlueprintMilestone,
    gatesMilestone: blueprint.evaluation.gates.era25EngineeringGatesMilestone,
    blueprintBlocked: blueprint.evaluation.blueprintBlocked,
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
