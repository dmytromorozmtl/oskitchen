#!/usr/bin/env npx tsx
/**
 * Exports Market leader positioning checklist (honest Series A gate + env + artifacts).
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  buildMarketLeaderPositioningPostSeriesAOrchestratorSummary,
  buildMarketLeaderPositioningReadinessChecklistMarkdown,
  MARKET_LEADER_POSITIONING_READINESS_CHECKLIST_PATH,
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

export { buildMarketLeaderPositioningReadinessChecklistMarkdown };

function main() {
  const write = process.argv.includes("--write");
  const evaluation = evaluateMarketLeaderPositioningEnv();
  const summary = buildMarketLeaderPositioningPostSeriesAOrchestratorSummary({
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
  const markdown = buildMarketLeaderPositioningReadinessChecklistMarkdown({ summary, evaluation });

  if (write) {
    const outPath = join(process.cwd(), MARKET_LEADER_POSITIONING_READINESS_CHECKLIST_PATH);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, markdown, "utf8");
    console.log(`Wrote ${MARKET_LEADER_POSITIONING_READINESS_CHECKLIST_PATH}`);
    return;
  }

  console.log(markdown);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}
