#!/usr/bin/env npx tsx
/**
 * Post-Series A Market leader positioning orchestrator — validate pillars, sync reports, export readiness.
 */
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

import {
  buildMarketLeaderPositioningPostSeriesAOrchestratorSummary,
  MARKET_LEADER_POSITIONING_POST_SERIES_A_ORCHESTRATOR_ERA21_POLICY_ID,
} from "@/lib/commercial/market-leader-positioning-post-series-a-orchestrator-era21";
import {
  COMPETITOR_FEATURE_GAP_MATRIX_ARTIFACT_PATH,
  INVESTOR_NARRATIVE_ONEPAGER_ARTIFACT_PATH,
  PILOT_CASE_STUDY_DRAFT_ARTIFACT_PATH,
  PILOT_GONOGO_SUMMARY_ARTIFACT_PATH,
  PILOT_METRICS_BASELINE_ARTIFACT_PATH,
  PILOT_ROLLBACK_DRILL_ARTIFACT_PATH,
  P0_STAGING_PROOF_ARTIFACT_PATH,
  TIER2_STAGING_GOLDEN_PATH_ARTIFACT_PATH,
} from "@/lib/commercial/market-leader-positioning-phases-era21";
import { evaluateMarketLeaderPositioningEnv } from "@/scripts/ops/validate-market-leader-positioning-env";

export function runMarketLeaderPositioningPostSeriesAOrchestrator(options: {
  writeArtifacts?: boolean;
  skipTemplate?: boolean;
} = {}): ReturnType<typeof buildMarketLeaderPositioningPostSeriesAOrchestratorSummary> {
  const evaluation = evaluateMarketLeaderPositioningEnv();

  if (!options.skipTemplate && evaluation.prerequisites.prerequisitesComplete) {
    execSync("npm run ops:export-market-leader-positioning-env-template -- --write", {
      stdio: "inherit",
    });
  }

  if (options.writeArtifacts && evaluation.prerequisites.prerequisitesComplete) {
    execSync("npm run ops:sync-market-leader-positioning-progress-report -- --write", {
      stdio: "inherit",
    });
    execSync("npm run ops:export-market-leader-positioning-readiness-checklist -- --write", {
      stdio: "inherit",
    });
  }

  return buildMarketLeaderPositioningPostSeriesAOrchestratorSummary({
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
      competitorMatrixPresent: existsSync(
        join(process.cwd(), COMPETITOR_FEATURE_GAP_MATRIX_ARTIFACT_PATH),
      ),
    },
  });
}

function main() {
  const jsonOutput = process.argv.includes("--json");
  const write = process.argv.includes("--write");
  const skipTemplate = process.argv.includes("--skip-template");

  const summary = runMarketLeaderPositioningPostSeriesAOrchestrator({
    writeArtifacts: write,
    skipTemplate,
  });

  if (jsonOutput) {
    console.log(JSON.stringify(summary, null, 2));
    process.exit(summary.milestone === "series_a_blocked" ? 2 : 0);
    return;
  }

  console.log(
    `\nMarket leader positioning post-Series A orchestrator (${MARKET_LEADER_POSITIONING_POST_SERIES_A_ORCHESTRATOR_ERA21_POLICY_ID})\n`,
  );
  console.log(`Milestone: ${summary.milestone}`);
  console.log(`GO decision: ${summary.goDecision ?? "missing"}`);
  console.log(`Series A complete: ${summary.seriesAComplete ? "yes" : "no"}`);
  console.log(`Market leader complete: ${summary.marketLeaderComplete ? "yes" : "no"}`);
  console.log(`Ready for moat smokes: ${summary.readyForMoatSmokes ? "yes" : "no"}`);
  console.log(
    `Ready for analyst kit smokes: ${summary.readyForAnalystKitSmokes ? "yes" : "no"}`,
  );
  if (summary.nextPhaseLabel) {
    console.log(`Next pillar: ${summary.nextPhaseLabel}`);
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
