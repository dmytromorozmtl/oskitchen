#!/usr/bin/env npx tsx
/**
 * Validates sustained product evolution tracks (Step 11, informational).
 */
import { readContinuousImprovementLoopArtifacts } from "@/scripts/ops/validate-continuous-improvement-loop";
import {
  buildSustainedProductEvolutionTrackStatuses,
  resolveContinuousImprovementLoopActive,
  resolveSustainedProductEvolutionHealthSummary,
  resolveSustainedProductEvolutionPrerequisites,
} from "@/lib/commercial/sustained-product-evolution-phases-era23";

export function evaluateSustainedProductEvolution(env: NodeJS.ProcessEnv = process.env): {
  prerequisites: ReturnType<typeof resolveSustainedProductEvolutionPrerequisites>;
  continuousImprovementLoopActive: boolean;
  goDecision: string | null;
  productEvolutionReady: boolean;
  tracks: ReturnType<typeof buildSustainedProductEvolutionTrackStatuses>;
  health: ReturnType<typeof resolveSustainedProductEvolutionHealthSummary>;
} {
  const artifacts = readContinuousImprovementLoopArtifacts();
  const goDecision = artifacts.goNoGoSummary?.decision ?? null;
  const continuousImprovementLoopActive = resolveContinuousImprovementLoopActive({
    goNoGoSummary: artifacts.goNoGoSummary,
    p0Staging: artifacts.p0Staging,
    tier2Summary: artifacts.tier2Summary,
    metricsBaseline: artifacts.metricsBaseline,
    caseStudyDraft: artifacts.caseStudyDraft,
    investorOnepager: artifacts.investorOnepager,
    rollbackDrill: artifacts.rollbackDrill,
    competitorMatrix: artifacts.competitorMatrix,
    env,
  });
  const prerequisites = resolveSustainedProductEvolutionPrerequisites({
    goDecision,
    continuousImprovementLoopActive,
  });
  const tracks = buildSustainedProductEvolutionTrackStatuses({
    metricsBaseline: artifacts.metricsBaseline,
    competitorMatrix: artifacts.competitorMatrix,
    customerName: artifacts.goNoGoSummary?.customerName ?? null,
  });
  const health = resolveSustainedProductEvolutionHealthSummary(tracks);

  return {
    prerequisites,
    continuousImprovementLoopActive,
    goDecision,
    productEvolutionReady: prerequisites.productEvolutionReady,
    tracks,
    health,
  };
}

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluateSustainedProductEvolution();

  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          policyId: "era23-sustained-product-evolution-v1",
          productEvolutionReady: result.productEvolutionReady,
          continuousImprovementLoopActive: result.continuousImprovementLoopActive,
          goDecision: result.goDecision,
          health: result.health,
          tracks: result.tracks.map((track) => ({
            id: track.id,
            label: track.label,
            ownerRole: track.ownerRole,
            frequency: track.frequency,
            status: track.status,
            detail: track.detail,
            lastRunAt: track.lastRunAt,
          })),
        },
        null,
        2,
      ),
    );
    process.exit(0);
  }

  console.log(`\nSustained product evolution (era23-sustained-product-evolution-v1)\n`);

  if (!result.productEvolutionReady) {
    console.log("Not in product evolution mode — complete Step 10 improvement loop first.\n");
    console.log(`  continuousImprovementLoopActive: ${result.continuousImprovementLoopActive}`);
    console.log(`  goDecision: ${result.goDecision ?? "missing"}\n`);
    process.exit(0);
  }

  for (const track of result.tracks) {
    console.log(`[${track.status}] ${track.label} (${track.ownerRole})`);
    console.log(`  ${track.detail}\n`);
  }

  process.exit(0);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}
