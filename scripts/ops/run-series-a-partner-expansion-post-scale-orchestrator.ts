#!/usr/bin/env npx tsx
/**
 * Post-Scale Series A / partner expansion orchestrator — validate tracks, sync reports, export readiness.
 */
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

import {
  buildSeriesAPartnerExpansionPostScaleOrchestratorSummary,
  SERIES_A_PARTNER_EXPANSION_POST_SCALE_ORCHESTRATOR_ERA21_POLICY_ID,
} from "@/lib/commercial/series-a-partner-expansion-post-scale-orchestrator-era21";
import {
  COMPETITOR_FEATURE_GAP_MATRIX_ARTIFACT_PATH,
  INVESTOR_NARRATIVE_ONEPAGER_ARTIFACT_PATH,
  PILOT_CASE_STUDY_DRAFT_ARTIFACT_PATH,
  PILOT_GONOGO_SUMMARY_ARTIFACT_PATH,
  PILOT_METRICS_BASELINE_ARTIFACT_PATH,
  P0_STAGING_PROOF_ARTIFACT_PATH,
  TIER2_STAGING_GOLDEN_PATH_ARTIFACT_PATH,
} from "@/lib/commercial/series-a-partner-expansion-phases-era21";
import { evaluateSeriesAPartnerExpansionEnv } from "@/scripts/ops/validate-series-a-partner-expansion-env";

export function runSeriesAPartnerExpansionPostScaleOrchestrator(options: {
  writeArtifacts?: boolean;
  skipTemplate?: boolean;
} = {}): ReturnType<typeof buildSeriesAPartnerExpansionPostScaleOrchestratorSummary> {
  const evaluation = evaluateSeriesAPartnerExpansionEnv();

  if (!options.skipTemplate && evaluation.prerequisites.prerequisitesComplete) {
    execSync("npm run ops:export-series-a-partner-expansion-env-template -- --write", {
      stdio: "inherit",
    });
  }

  if (options.writeArtifacts && evaluation.prerequisites.prerequisitesComplete) {
    execSync("npm run ops:sync-series-a-partner-expansion-progress-report -- --write", {
      stdio: "inherit",
    });
    execSync("npm run ops:export-series-a-partner-expansion-readiness-checklist -- --write", {
      stdio: "inherit",
    });
  }

  return buildSeriesAPartnerExpansionPostScaleOrchestratorSummary({
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

  const summary = runSeriesAPartnerExpansionPostScaleOrchestrator({
    writeArtifacts: write,
    skipTemplate,
  });

  if (jsonOutput) {
    console.log(JSON.stringify(summary, null, 2));
    process.exit(summary.milestone === "scale_blocked" ? 2 : 0);
    return;
  }

  console.log(
    `\nSeries A / partner expansion post-Scale orchestrator (${SERIES_A_PARTNER_EXPANSION_POST_SCALE_ORCHESTRATOR_ERA21_POLICY_ID})\n`,
  );
  console.log(`Milestone: ${summary.milestone}`);
  console.log(`GO decision: ${summary.goDecision ?? "missing"}`);
  console.log(`Scale complete: ${summary.scaleComplete ? "yes" : "no"}`);
  console.log(`Series A complete: ${summary.seriesAComplete ? "yes" : "no"}`);
  console.log(`Ready for data room smokes: ${summary.readyForDataRoomSmokes ? "yes" : "no"}`);
  console.log(`Ready for partner smokes: ${summary.readyForPartnerSmokes ? "yes" : "no"}`);
  if (summary.nextPhaseLabel) {
    console.log(`Next track: ${summary.nextPhaseLabel}`);
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
