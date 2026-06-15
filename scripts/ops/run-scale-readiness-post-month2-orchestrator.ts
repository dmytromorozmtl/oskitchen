#!/usr/bin/env npx tsx
/**
 * Post-Month 2 Scale readiness orchestrator — validate gates, sync reports, export readiness.
 */
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

import {
  buildScaleReadinessPostMonth2OrchestratorSummary,
  SCALE_READINESS_POST_MONTH2_ORCHESTRATOR_ERA21_POLICY_ID,
} from "@/lib/commercial/scale-readiness-post-month2-orchestrator-era21";
import {
  INVESTOR_NARRATIVE_ONEPAGER_ARTIFACT_PATH,
  PILOT_CASE_STUDY_DRAFT_ARTIFACT_PATH,
  PILOT_GONOGO_SUMMARY_ARTIFACT_PATH,
  PILOT_METRICS_BASELINE_ARTIFACT_PATH,
  PILOT_ROLLBACK_DRILL_ARTIFACT_PATH,
  P0_STAGING_PROOF_ARTIFACT_PATH,
  TIER2_STAGING_GOLDEN_PATH_ARTIFACT_PATH,
} from "@/lib/commercial/scale-readiness-phases-era21";
import { evaluateScaleReadinessEnv } from "@/scripts/ops/validate-scale-readiness-env";

export function runScaleReadinessPostMonth2Orchestrator(options: {
  writeArtifacts?: boolean;
  skipTemplate?: boolean;
} = {}): ReturnType<typeof buildScaleReadinessPostMonth2OrchestratorSummary> {
  const evaluation = evaluateScaleReadinessEnv();

  if (!options.skipTemplate && evaluation.prerequisites.prerequisitesComplete) {
    execSync("npm run ops:export-scale-readiness-env-template -- --write", {
      stdio: "inherit",
    });
  }

  if (options.writeArtifacts && evaluation.prerequisites.prerequisitesComplete) {
    execSync("npm run ops:sync-scale-readiness-progress-report -- --write", {
      stdio: "inherit",
    });
    execSync("npm run ops:export-scale-readiness-readiness-checklist -- --write", {
      stdio: "inherit",
    });
  }

  return buildScaleReadinessPostMonth2OrchestratorSummary({
    evaluation,
    artifacts: {
      goNoGoPresent: existsSync(join(process.cwd(), PILOT_GONOGO_SUMMARY_ARTIFACT_PATH)),
      p0StagingPresent: existsSync(join(process.cwd(), P0_STAGING_PROOF_ARTIFACT_PATH)),
      tier2Present: existsSync(join(process.cwd(), TIER2_STAGING_GOLDEN_PATH_ARTIFACT_PATH)),
      metricsBaselinePresent: existsSync(
        join(process.cwd(), PILOT_METRICS_BASELINE_ARTIFACT_PATH),
      ),
      caseStudyDraftPresent: existsSync(
        join(process.cwd(), PILOT_CASE_STUDY_DRAFT_ARTIFACT_PATH),
      ),
      investorOnepagerPresent: existsSync(
        join(process.cwd(), INVESTOR_NARRATIVE_ONEPAGER_ARTIFACT_PATH),
      ),
      rollbackDrillPresent: existsSync(join(process.cwd(), PILOT_ROLLBACK_DRILL_ARTIFACT_PATH)),
    },
  });
}

function main() {
  const jsonOutput = process.argv.includes("--json");
  const write = process.argv.includes("--write");
  const skipTemplate = process.argv.includes("--skip-template");

  const summary = runScaleReadinessPostMonth2Orchestrator({
    writeArtifacts: write,
    skipTemplate,
  });

  if (jsonOutput) {
    console.log(JSON.stringify(summary, null, 2));
    process.exit(summary.milestone === "month2_blocked" ? 2 : 0);
    return;
  }

  console.log(
    `\nScale readiness post-Month 2 orchestrator (${SCALE_READINESS_POST_MONTH2_ORCHESTRATOR_ERA21_POLICY_ID})\n`,
  );
  console.log(`Milestone: ${summary.milestone}`);
  console.log(`GO decision: ${summary.goDecision ?? "missing"}`);
  console.log(`Month 2 complete: ${summary.month2Complete ? "yes" : "no"}`);
  console.log(`Scale complete: ${summary.scaleComplete ? "yes" : "no"}`);
  console.log(
    `Ready for resilience smokes: ${summary.readyForResilienceSmokes ? "yes" : "no"}`,
  );
  if (summary.nextPhaseLabel) {
    console.log(`Next gate: ${summary.nextPhaseLabel}`);
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
