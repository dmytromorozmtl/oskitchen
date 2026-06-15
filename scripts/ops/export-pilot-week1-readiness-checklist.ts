#!/usr/bin/env npx tsx
/**
 * Exports Pilot Week 1 readiness checklist (honest GO gate + env + artifacts).
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  buildPilotWeek1PostGoOrchestratorSummary,
  buildPilotWeek1ReadinessChecklistMarkdown,
  PILOT_WEEK1_READINESS_CHECKLIST_PATH,
} from "@/lib/commercial/pilot-week1-execution-post-go-orchestrator-era21";
import {
  PILOT_CASE_STUDY_DRAFT_ARTIFACT_PATH,
  PILOT_GONOGO_SUMMARY_ARTIFACT_PATH,
  PILOT_METRICS_BASELINE_ARTIFACT_PATH,
} from "@/lib/commercial/pilot-week1-execution-phases-era21";
import {
  evaluatePilotWeek1Env,
  readPilotWeek1ExecutionArtifacts,
} from "@/scripts/ops/validate-pilot-week1-env";

export { buildPilotWeek1ReadinessChecklistMarkdown };

function main() {
  const write = process.argv.includes("--write");
  const evaluation = evaluatePilotWeek1Env();
  const artifacts = readPilotWeek1ExecutionArtifacts();
  const summary = buildPilotWeek1PostGoOrchestratorSummary({
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
  const markdown = buildPilotWeek1ReadinessChecklistMarkdown({ summary, evaluation });

  if (write) {
    const outPath = join(process.cwd(), PILOT_WEEK1_READINESS_CHECKLIST_PATH);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, markdown, "utf8");
    console.log(`Wrote ${PILOT_WEEK1_READINESS_CHECKLIST_PATH}`);
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
