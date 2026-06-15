#!/usr/bin/env npx tsx
/**
 * Post-Sustained-ops Continuous improvement loop orchestrator — sync reports, export release checklist.
 */
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

import {
  buildContinuousImprovementLoopPostSustainedOpsOrchestratorSummary,
  CONTINUOUS_IMPROVEMENT_LOOP_POST_SUSTAINED_OPS_ORCHESTRATOR_ERA22_POLICY_ID,
} from "@/lib/commercial/continuous-improvement-loop-post-sustained-ops-orchestrator-era22";
import {
  COMPETITOR_FEATURE_GAP_MATRIX_ARTIFACT_PATH,
  PILOT_GONOGO_SUMMARY_ARTIFACT_PATH,
  PILOT_METRICS_BASELINE_ARTIFACT_PATH,
  P0_STAGING_PROOF_ARTIFACT_PATH,
  TIER2_STAGING_GOLDEN_PATH_ARTIFACT_PATH,
} from "@/lib/commercial/market-leader-positioning-phases-era21";
import { evaluateContinuousImprovementLoop } from "@/scripts/ops/validate-continuous-improvement-loop";

export function runContinuousImprovementLoopPostSustainedOpsOrchestrator(options: {
  writeArtifacts?: boolean;
} = {}): ReturnType<typeof buildContinuousImprovementLoopPostSustainedOpsOrchestratorSummary> {
  const evaluation = evaluateContinuousImprovementLoop();

  if (options.writeArtifacts && evaluation.pureOperationalMode) {
    execSync("npm run ops:sync-continuous-improvement-loop-progress-report -- --write", {
      stdio: "inherit",
    });
    execSync("npm run ops:export-continuous-improvement-loop-release-checklist -- --write", {
      stdio: "inherit",
    });
  }

  return buildContinuousImprovementLoopPostSustainedOpsOrchestratorSummary({
    evaluation,
    artifacts: {
      goNoGoPresent: existsSync(join(process.cwd(), PILOT_GONOGO_SUMMARY_ARTIFACT_PATH)),
      p0StagingPresent: existsSync(join(process.cwd(), P0_STAGING_PROOF_ARTIFACT_PATH)),
      tier2Present: existsSync(join(process.cwd(), TIER2_STAGING_GOLDEN_PATH_ARTIFACT_PATH)),
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

  const summary = runContinuousImprovementLoopPostSustainedOpsOrchestrator({
    writeArtifacts: write,
  });

  if (jsonOutput) {
    console.log(JSON.stringify(summary, null, 2));
    process.exit(summary.milestone === "sustained_ops_blocked" ? 2 : 0);
    return;
  }

  console.log(
    `\nContinuous improvement loop post-Sustained-ops orchestrator (${CONTINUOUS_IMPROVEMENT_LOOP_POST_SUSTAINED_OPS_ORCHESTRATOR_ERA22_POLICY_ID})\n`,
  );
  console.log(`Milestone: ${summary.milestone}`);
  console.log(`Pure operational mode: ${summary.pureOperationalMode ? "yes" : "no"}`);
  console.log(`Sustained ops complete: ${summary.sustainedOpsComplete ? "yes" : "no"}`);
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
