#!/usr/bin/env npx tsx
/**
 * Validates sustained product evolution tracks (Step 11, informational).
 */
import { resolveSustainedProductEvolutionMilestone } from "@/lib/commercial/sustained-product-evolution-post-improvement-loop-orchestrator-era23";
import { readContinuousImprovementLoopArtifacts } from "@/scripts/ops/validate-continuous-improvement-loop";
import {
  buildSustainedProductEvolutionTrackStatuses,
  resolveContinuousImprovementLoopActive,
  resolveEra25PureOperationalModeContext,
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
  readyForFeedbackSmokes: boolean;
  readyForLeapfrogSmokes: boolean;
  productEvolutionMilestone: ReturnType<typeof resolveSustainedProductEvolutionMilestone>;
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
  const era25 = resolveEra25PureOperationalModeContext(env);
  const prerequisites = resolveSustainedProductEvolutionPrerequisites({
    goDecision,
    continuousImprovementLoopActive,
    era25,
  });
  const tracks = buildSustainedProductEvolutionTrackStatuses({
    metricsBaseline: artifacts.metricsBaseline,
    competitorMatrix: artifacts.competitorMatrix,
    customerName: artifacts.goNoGoSummary?.customerName ?? null,
  });
  const health = resolveSustainedProductEvolutionHealthSummary(tracks);
  const feedback = tracks.find((track) => track.id === "customer_feedback_backlog");
  const leapfrog = tracks.find((track) => track.id === "competitor_leapfrog_roadmap");
  const readyForFeedbackSmokes =
    prerequisites.productEvolutionReady &&
    (feedback?.status === "overdue" || feedback?.status === "due_soon");
  const readyForLeapfrogSmokes =
    prerequisites.productEvolutionReady &&
    (leapfrog?.status === "overdue" || leapfrog?.status === "due_soon");
  const productEvolutionMilestone = resolveSustainedProductEvolutionMilestone({
    productEvolutionReady: prerequisites.productEvolutionReady,
    sustainedOpsConvergenceReady: prerequisites.sustainedOpsConvergenceReady,
    tracks,
  });

  return {
    prerequisites,
    continuousImprovementLoopActive,
    goDecision,
    productEvolutionReady: prerequisites.productEvolutionReady,
    tracks,
    health,
    readyForFeedbackSmokes,
    readyForLeapfrogSmokes,
    productEvolutionMilestone,
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
          sustainedOpsConvergenceReady: result.prerequisites.sustainedOpsConvergenceReady,
          pureOperationalModeEra25Active: result.prerequisites.pureOperationalModeEra25Active,
          goDecision: result.goDecision,
          productEvolutionMilestone: result.productEvolutionMilestone,
          readyForFeedbackSmokes: result.readyForFeedbackSmokes,
          readyForLeapfrogSmokes: result.readyForLeapfrogSmokes,
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

  console.log(`Product evolution milestone: ${result.productEvolutionMilestone}\n`);

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
