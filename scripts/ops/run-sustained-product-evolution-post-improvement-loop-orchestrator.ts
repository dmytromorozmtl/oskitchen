#!/usr/bin/env npx tsx
/**
 * Post-improvement-loop Sustained product evolution orchestrator — sync reports, export ownership matrix.
 */
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

import {
  COMPETITOR_FEATURE_GAP_MATRIX_ARTIFACT_PATH,
  PILOT_GONOGO_SUMMARY_ARTIFACT_PATH,
  PILOT_METRICS_BASELINE_ARTIFACT_PATH,
} from "@/lib/commercial/market-leader-positioning-phases-era21";
import {
  buildSustainedProductEvolutionPostImprovementLoopOrchestratorSummary,
  SUSTAINED_PRODUCT_EVOLUTION_POST_IMPROVEMENT_LOOP_ORCHESTRATOR_ERA23_POLICY_ID,
} from "@/lib/commercial/sustained-product-evolution-post-improvement-loop-orchestrator-era23";
import { evaluateSustainedProductEvolution } from "@/scripts/ops/validate-sustained-product-evolution";

export function runSustainedProductEvolutionPostImprovementLoopOrchestrator(options: {
  writeArtifacts?: boolean;
} = {}): ReturnType<typeof buildSustainedProductEvolutionPostImprovementLoopOrchestratorSummary> {
  const evaluation = evaluateSustainedProductEvolution();

  if (options.writeArtifacts && evaluation.productEvolutionReady) {
    execSync("npm run ops:sync-sustained-product-evolution-progress-report -- --write", {
      stdio: "inherit",
    });
    execSync("npm run ops:export-sustained-product-evolution-ownership-matrix -- --write", {
      stdio: "inherit",
    });
  }

  return buildSustainedProductEvolutionPostImprovementLoopOrchestratorSummary({
    evaluation,
    artifacts: {
      goNoGoPresent: existsSync(join(process.cwd(), PILOT_GONOGO_SUMMARY_ARTIFACT_PATH)),
      metricsBaselinePresent: existsSync(
        join(process.cwd(), PILOT_METRICS_BASELINE_ARTIFACT_PATH),
      ),
      competitorMatrixPresent: existsSync(
        join(process.cwd(), COMPETITOR_FEATURE_GAP_MATRIX_ARTIFACT_PATH),
      ),
    },
  });
}

function main() {
  const jsonOutput = process.argv.includes("--json");
  const write = process.argv.includes("--write");

  const summary = runSustainedProductEvolutionPostImprovementLoopOrchestrator({
    writeArtifacts: write,
  });

  if (jsonOutput) {
    console.log(JSON.stringify(summary, null, 2));
    process.exit(
      summary.milestone === "improvement_loop_blocked" ||
        summary.milestone === "era25_sustained_ops_convergence_blocked"
        ? 2
        : 0,
    );
    return;
  }

  console.log(
    `\nSustained product evolution post-improvement-loop orchestrator (${SUSTAINED_PRODUCT_EVOLUTION_POST_IMPROVEMENT_LOOP_ORCHESTRATOR_ERA23_POLICY_ID})\n`,
  );
  console.log(`Milestone: ${summary.milestone}`);
  console.log(`Product evolution ready: ${summary.productEvolutionReady ? "yes" : "no"}`);
  console.log(
    `Improvement loop active: ${summary.continuousImprovementLoopActive ? "yes" : "no"}`,
  );
  console.log(`GO decision: ${summary.goDecision ?? "missing"}`);
  console.log(
    `Track health: ${summary.healthyCount} healthy · ${summary.dueSoonCount} due soon · ${summary.overdueCount} overdue`,
  );
  if (summary.nextAttentionTrackLabel) {
    console.log(`Next attention: ${summary.nextAttentionTrackLabel}`);
  }
  console.log("\nRecommended:");
  for (const command of summary.recommendedCommands) {
    console.log(`  ${command}`);
  }
  console.log("");
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}
