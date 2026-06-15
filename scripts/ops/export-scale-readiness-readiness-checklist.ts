#!/usr/bin/env npx tsx
/**
 * Exports Scale readiness checklist (honest Month 2 gate + env + artifacts).
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  buildScaleReadinessPostMonth2OrchestratorSummary,
  buildScaleReadinessReadinessChecklistMarkdown,
  SCALE_READINESS_READINESS_CHECKLIST_PATH,
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

export { buildScaleReadinessReadinessChecklistMarkdown };

function main() {
  const write = process.argv.includes("--write");
  const evaluation = evaluateScaleReadinessEnv();
  const summary = buildScaleReadinessPostMonth2OrchestratorSummary({
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
  const markdown = buildScaleReadinessReadinessChecklistMarkdown({ summary, evaluation });

  if (write) {
    const outPath = join(process.cwd(), SCALE_READINESS_READINESS_CHECKLIST_PATH);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, markdown, "utf8");
    console.log(`Wrote ${SCALE_READINESS_READINESS_CHECKLIST_PATH}`);
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
