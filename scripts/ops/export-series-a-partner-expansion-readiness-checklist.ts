#!/usr/bin/env npx tsx
/**
 * Exports Series A / partner expansion checklist (honest Scale gate + env + artifacts).
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  buildSeriesAPartnerExpansionPostScaleOrchestratorSummary,
  buildSeriesAPartnerExpansionReadinessChecklistMarkdown,
  SERIES_A_PARTNER_EXPANSION_READINESS_CHECKLIST_PATH,
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

export { buildSeriesAPartnerExpansionReadinessChecklistMarkdown };

function main() {
  const write = process.argv.includes("--write");
  const evaluation = evaluateSeriesAPartnerExpansionEnv();
  const summary = buildSeriesAPartnerExpansionPostScaleOrchestratorSummary({
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
  const markdown = buildSeriesAPartnerExpansionReadinessChecklistMarkdown({ summary, evaluation });

  if (write) {
    const outPath = join(process.cwd(), SERIES_A_PARTNER_EXPANSION_READINESS_CHECKLIST_PATH);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, markdown, "utf8");
    console.log(`Wrote ${SERIES_A_PARTNER_EXPANSION_READINESS_CHECKLIST_PATH}`);
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
