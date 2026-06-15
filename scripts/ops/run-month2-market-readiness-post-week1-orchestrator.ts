#!/usr/bin/env npx tsx
/**
 * Post-Week 1 Month 2 market readiness orchestrator — validate gates, sync reports, export readiness.
 */
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

import {
  buildMonth2MarketReadinessPostWeek1OrchestratorSummary,
  MONTH2_MARKET_READINESS_POST_WEEK1_ORCHESTRATOR_ERA21_POLICY_ID,
} from "@/lib/commercial/month2-market-readiness-post-week1-orchestrator-era21";
import {
  INVESTOR_NARRATIVE_ONEPAGER_ARTIFACT_PATH,
  PILOT_CASE_STUDY_DRAFT_ARTIFACT_PATH,
  PILOT_GONOGO_SUMMARY_ARTIFACT_PATH,
  PILOT_METRICS_BASELINE_ARTIFACT_PATH,
} from "@/lib/commercial/month2-market-readiness-phases-era21";
import { evaluateMonth2MarketReadinessEnv } from "@/scripts/ops/validate-month2-market-readiness-env";

export function runMonth2MarketReadinessPostWeek1Orchestrator(options: {
  writeArtifacts?: boolean;
  skipTemplate?: boolean;
} = {}): ReturnType<typeof buildMonth2MarketReadinessPostWeek1OrchestratorSummary> {
  const evaluation = evaluateMonth2MarketReadinessEnv();

  if (!options.skipTemplate && evaluation.prerequisites.prerequisitesComplete) {
    execSync("npm run ops:export-month2-market-readiness-env-template -- --write", {
      stdio: "inherit",
    });
  }

  if (options.writeArtifacts && evaluation.prerequisites.prerequisitesComplete) {
    execSync("npm run ops:sync-month2-market-readiness-progress-report -- --write", {
      stdio: "inherit",
    });
    execSync("npm run ops:export-month2-market-readiness-readiness-checklist -- --write", {
      stdio: "inherit",
    });
  }

  return buildMonth2MarketReadinessPostWeek1OrchestratorSummary({
    evaluation,
    artifacts: {
      goNoGoPresent: existsSync(join(process.cwd(), PILOT_GONOGO_SUMMARY_ARTIFACT_PATH)),
      metricsBaselinePresent: existsSync(
        join(process.cwd(), PILOT_METRICS_BASELINE_ARTIFACT_PATH),
      ),
      caseStudyDraftPresent: existsSync(
        join(process.cwd(), PILOT_CASE_STUDY_DRAFT_ARTIFACT_PATH),
      ),
      investorOnepagerPresent: existsSync(
        join(process.cwd(), INVESTOR_NARRATIVE_ONEPAGER_ARTIFACT_PATH),
      ),
    },
  });
}

function main() {
  const jsonOutput = process.argv.includes("--json");
  const write = process.argv.includes("--write");
  const skipTemplate = process.argv.includes("--skip-template");

  const summary = runMonth2MarketReadinessPostWeek1Orchestrator({
    writeArtifacts: write,
    skipTemplate,
  });

  if (jsonOutput) {
    console.log(JSON.stringify(summary, null, 2));
    process.exit(summary.milestone === "week1_blocked" ? 2 : 0);
    return;
  }

  console.log(
    `\nMonth 2 market readiness post-Week 1 orchestrator (${MONTH2_MARKET_READINESS_POST_WEEK1_ORCHESTRATOR_ERA21_POLICY_ID})\n`,
  );
  console.log(`Milestone: ${summary.milestone}`);
  console.log(`GO decision: ${summary.goDecision ?? "missing"}`);
  console.log(`Week 1 complete: ${summary.week1Complete ? "yes" : "no"}`);
  console.log(`Month 2 complete: ${summary.month2Complete ? "yes" : "no"}`);
  console.log(
    `Ready for investor one-pager smoke: ${summary.readyForInvestorOnepagerSmoke ? "yes" : "no"}`,
  );
  if (summary.nextPhaseLabel) {
    console.log(`Next workstream: ${summary.nextPhaseLabel}`);
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
