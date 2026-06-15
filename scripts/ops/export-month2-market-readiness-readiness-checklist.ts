#!/usr/bin/env npx tsx
/**
 * Exports Month 2 market readiness checklist (honest Week 1 gate + env + artifacts).
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  buildMonth2MarketReadinessPostWeek1OrchestratorSummary,
  buildMonth2MarketReadinessReadinessChecklistMarkdown,
  MONTH2_MARKET_READINESS_READINESS_CHECKLIST_PATH,
} from "@/lib/commercial/month2-market-readiness-post-week1-orchestrator-era21";
import {
  INVESTOR_NARRATIVE_ONEPAGER_ARTIFACT_PATH,
  PILOT_CASE_STUDY_DRAFT_ARTIFACT_PATH,
  PILOT_GONOGO_SUMMARY_ARTIFACT_PATH,
  PILOT_METRICS_BASELINE_ARTIFACT_PATH,
} from "@/lib/commercial/month2-market-readiness-phases-era21";
import { evaluateMonth2MarketReadinessEnv } from "@/scripts/ops/validate-month2-market-readiness-env";

export { buildMonth2MarketReadinessReadinessChecklistMarkdown };

function main() {
  const write = process.argv.includes("--write");
  const evaluation = evaluateMonth2MarketReadinessEnv();
  const summary = buildMonth2MarketReadinessPostWeek1OrchestratorSummary({
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
  const markdown = buildMonth2MarketReadinessReadinessChecklistMarkdown({ summary, evaluation });

  if (write) {
    const outPath = join(process.cwd(), MONTH2_MARKET_READINESS_READINESS_CHECKLIST_PATH);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, markdown, "utf8");
    console.log(`Wrote ${MONTH2_MARKET_READINESS_READINESS_CHECKLIST_PATH}`);
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
