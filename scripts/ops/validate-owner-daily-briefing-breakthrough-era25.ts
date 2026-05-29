#!/usr/bin/env npx tsx
import {
  resolveOwnerDailyBriefingBreakthroughEra25Milestone,
  type OwnerDailyBriefingBreakthroughEra25Milestone,
} from "@/lib/commercial/owner-daily-briefing-breakthrough-post-gates-orchestrator-era25";
import { OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_POLICY_ID } from "@/lib/commercial/owner-daily-briefing-breakthrough-era25-policy";
import {
  OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_GUARDRAILS,
  OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_HUMAN_STEPS,
  OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_BRIEFING_SCHEME,
} from "@/lib/commercial/owner-daily-briefing-breakthrough-phases-era25";
import { evaluateOwnerDailyBriefingBreakthroughEra25 } from "@/lib/commercial/evaluate-owner-daily-briefing-breakthrough-era25";

export { evaluateOwnerDailyBriefingBreakthroughEra25 };

export function evaluateOwnerDailyBriefingBreakthroughEra25WithMilestones(
  env: NodeJS.ProcessEnv = process.env,
): {
  evaluation: ReturnType<typeof evaluateOwnerDailyBriefingBreakthroughEra25>;
  ownerDailyBriefingBreakthroughEra25Milestone: OwnerDailyBriefingBreakthroughEra25Milestone;
  readyForBlueprintRegressionSmokes: boolean;
  readyForStagingProofSmokes: boolean;
  readyForBriefingGapSmokes: boolean;
} {
  const evaluation = evaluateOwnerDailyBriefingBreakthroughEra25(env);
  const ownerDailyBriefingBreakthroughEra25Milestone =
    resolveOwnerDailyBriefingBreakthroughEra25Milestone({
      era25FirstProductSliceBlueprintMilestone:
        evaluation.blueprint.era25FirstProductSliceBlueprintMilestone,
      allBriefingTilesWired: evaluation.allBriefingTilesWired,
      p0ProofStatus: evaluation.p0ProofStatus,
    });

  const readyForBlueprintRegressionSmokes =
    evaluation.blueprint.era25FirstProductSliceBlueprintMilestone !==
    "era25_first_product_slice_blueprint_ready";
  const readyForStagingProofSmokes = evaluation.p0ProofStatus !== "proof_passed";
  const readyForBriefingGapSmokes = !evaluation.allBriefingTilesWired;

  return {
    evaluation,
    ownerDailyBriefingBreakthroughEra25Milestone,
    readyForBlueprintRegressionSmokes,
    readyForStagingProofSmokes,
    readyForBriefingGapSmokes,
  };
}

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluateOwnerDailyBriefingBreakthroughEra25WithMilestones();

  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          policyId: OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_POLICY_ID,
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
          readyForBlueprintRegressionSmokes: result.readyForBlueprintRegressionSmokes,
          readyForStagingProofSmokes: result.readyForStagingProofSmokes,
          readyForBriefingGapSmokes: result.readyForBriefingGapSmokes,
          briefingScheme: OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_BRIEFING_SCHEME,
          briefingTiles: result.evaluation.briefingTiles,
          humanSteps: OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_HUMAN_STEPS,
          guardrails: OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_GUARDRAILS,
        },
        null,
        2,
      ),
    );
    process.exit(0);
  }

  console.log(
    `\nera25 owner daily briefing breakthrough (${OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_POLICY_ID})\n`,
  );
  console.log(`Milestone: ${result.ownerDailyBriefingBreakthroughEra25Milestone}`);
  console.log(`Slice blocked: ${result.evaluation.sliceBlocked ? "yes" : "no"}`);
  console.log(
    `Briefing tiles: ${result.evaluation.wiredBriefingTileCount}/${result.evaluation.briefingSchemeCount}`,
  );
  console.log(`P0 proof: ${result.evaluation.p0ProofStatus}`);
  console.log("");
  process.exit(0);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}
