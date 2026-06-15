#!/usr/bin/env npx tsx
/**
 * Exports Sustained operational excellence checklist (honest Market leader gate + env + artifacts).
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  buildSustainedOperationalExcellencePostMarketLeaderOrchestratorSummary,
  buildSustainedOperationalExcellenceReadinessChecklistMarkdown,
  SUSTAINED_OPERATIONAL_EXCELLENCE_READINESS_CHECKLIST_PATH,
} from "@/lib/commercial/sustained-operational-excellence-post-market-leader-orchestrator-era21";
import {
  COMPETITOR_FEATURE_GAP_MATRIX_ARTIFACT_PATH,
  PILOT_GONOGO_SUMMARY_ARTIFACT_PATH,
  PILOT_METRICS_BASELINE_ARTIFACT_PATH,
  P0_STAGING_PROOF_ARTIFACT_PATH,
  TIER2_STAGING_GOLDEN_PATH_ARTIFACT_PATH,
} from "@/lib/commercial/sustained-operational-excellence-phases-era21";
import { evaluateSustainedOperationalExcellenceEnv } from "@/scripts/ops/validate-sustained-operational-excellence-env";

export { buildSustainedOperationalExcellenceReadinessChecklistMarkdown };

function main() {
  const write = process.argv.includes("--write");
  const evaluation = evaluateSustainedOperationalExcellenceEnv();
  const summary = buildSustainedOperationalExcellencePostMarketLeaderOrchestratorSummary({
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
  const markdown = buildSustainedOperationalExcellenceReadinessChecklistMarkdown({
    summary,
    evaluation,
  });

  if (write) {
    const outPath = join(process.cwd(), SUSTAINED_OPERATIONAL_EXCELLENCE_READINESS_CHECKLIST_PATH);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, markdown, "utf8");
    console.log(`Wrote ${SUSTAINED_OPERATIONAL_EXCELLENCE_READINESS_CHECKLIST_PATH}`);
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
