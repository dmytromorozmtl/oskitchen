#!/usr/bin/env npx tsx
/**
 * Post-GO Pilot Week 1 orchestrator — validate gates, sync reports, export readiness.
 */
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

import {
  buildPilotWeek1PostGoOrchestratorSummary,
  PILOT_WEEK1_POST_GO_ORCHESTRATOR_ERA21_POLICY_ID,
} from "@/lib/commercial/pilot-week1-execution-post-go-orchestrator-era21";
import {
  PILOT_CASE_STUDY_DRAFT_ARTIFACT_PATH,
  PILOT_GONOGO_SUMMARY_ARTIFACT_PATH,
  PILOT_METRICS_BASELINE_ARTIFACT_PATH,
} from "@/lib/commercial/pilot-week1-execution-phases-era21";
import { evaluatePilotWeek1Env } from "@/scripts/ops/validate-pilot-week1-env";

export function runPilotWeek1ExecutionPostGoOrchestrator(options: {
  writeArtifacts?: boolean;
  skipTemplate?: boolean;
} = {}): ReturnType<typeof buildPilotWeek1PostGoOrchestratorSummary> {
  const evaluation = evaluatePilotWeek1Env();

  if (!options.skipTemplate && evaluation.prerequisites.prerequisitesComplete) {
    execSync("npm run ops:export-pilot-week1-env-template -- --write", {
      stdio: "inherit",
    });
  }

  if (options.writeArtifacts && evaluation.prerequisites.prerequisitesComplete) {
    execSync("npm run ops:sync-pilot-week1-progress-report -- --write", {
      stdio: "inherit",
    });
    execSync("npm run ops:export-pilot-week1-readiness-checklist -- --write", {
      stdio: "inherit",
    });
  }

  return buildPilotWeek1PostGoOrchestratorSummary({
    evaluation,
    artifacts: {
      goNoGoPresent: existsSync(join(process.cwd(), PILOT_GONOGO_SUMMARY_ARTIFACT_PATH)),
      metricsBaselinePresent: existsSync(
        join(process.cwd(), PILOT_METRICS_BASELINE_ARTIFACT_PATH),
      ),
      caseStudyDraftPresent: existsSync(
        join(process.cwd(), PILOT_CASE_STUDY_DRAFT_ARTIFACT_PATH),
      ),
    },
  });
}

function main() {
  const jsonOutput = process.argv.includes("--json");
  const write = process.argv.includes("--write");
  const skipTemplate = process.argv.includes("--skip-template");

  const summary = runPilotWeek1ExecutionPostGoOrchestrator({
    writeArtifacts: write,
    skipTemplate,
  });

  if (jsonOutput) {
    console.log(JSON.stringify(summary, null, 2));
    process.exit(summary.milestone === "go_blocked" ? 2 : 0);
    return;
  }

  console.log(
    `\nPilot Week 1 post-GO orchestrator (${PILOT_WEEK1_POST_GO_ORCHESTRATOR_ERA21_POLICY_ID})\n`,
  );
  console.log(`Milestone: ${summary.milestone}`);
  console.log(`GO decision: ${summary.goDecision ?? "missing"}`);
  console.log(`Week 1 complete: ${summary.week1Complete ? "yes" : "no"}`);
  console.log(`Ready for Day 5 smokes: ${summary.readyForDay5Smokes ? "yes" : "no"}`);
  if (summary.nextPhaseLabel) {
    console.log(`Next day: ${summary.nextPhaseLabel}`);
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
