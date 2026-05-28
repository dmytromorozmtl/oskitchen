#!/usr/bin/env npx tsx
/**
 * Validates Pilot Week 1 env + artifact gates (Step 4, post-GO).
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import type { PilotCaseStudyDraftSummary } from "@/lib/commercial/pilot-case-study-draft-summary";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { PilotMetricsBaselineSummary } from "@/lib/commercial/pilot-metrics-baseline-summary";
import {
  buildPilotWeek1ExecutionPhaseStatuses,
  PILOT_CASE_STUDY_DRAFT_ARTIFACT_PATH,
  PILOT_GONOGO_SUMMARY_ARTIFACT_PATH,
  PILOT_METRICS_BASELINE_ARTIFACT_PATH,
  PILOT_WEEK1_TRACKED_ENV_KEYS,
  resolvePilotWeek1ExecutionComplete,
  resolvePilotWeek1ExecutionPrerequisites,
} from "@/lib/commercial/pilot-week1-execution-phases-era21";

function readJson<T>(path: string): T | null {
  const full = join(process.cwd(), path);
  if (!existsSync(full)) return null;
  try {
    return JSON.parse(readFileSync(full, "utf8")) as T;
  } catch {
    return null;
  }
}

export function readPilotWeek1ExecutionArtifacts(): {
  goNoGoSummary: PilotGoNoGoSummary | null;
  metricsBaseline: PilotMetricsBaselineSummary | null;
  caseStudyDraft: PilotCaseStudyDraftSummary | null;
} {
  return {
    goNoGoSummary: readJson<PilotGoNoGoSummary>(PILOT_GONOGO_SUMMARY_ARTIFACT_PATH),
    metricsBaseline: readJson<PilotMetricsBaselineSummary>(PILOT_METRICS_BASELINE_ARTIFACT_PATH),
    caseStudyDraft: readJson<PilotCaseStudyDraftSummary>(PILOT_CASE_STUDY_DRAFT_ARTIFACT_PATH),
  };
}

export function evaluatePilotWeek1Env(env: NodeJS.ProcessEnv = process.env): {
  prerequisites: ReturnType<typeof resolvePilotWeek1ExecutionPrerequisites>;
  present: string[];
  missing: string[];
  phases: ReturnType<typeof buildPilotWeek1ExecutionPhaseStatuses>;
  goDecision: string | null;
  week1Complete: boolean;
  readyForDay5Smokes: boolean;
} {
  const artifacts = readPilotWeek1ExecutionArtifacts();
  const goDecision = artifacts.goNoGoSummary?.decision ?? null;
  const prerequisites = resolvePilotWeek1ExecutionPrerequisites({ goDecision });
  const present = PILOT_WEEK1_TRACKED_ENV_KEYS.filter((key) => Boolean(env[key]?.trim()));
  const missing = PILOT_WEEK1_TRACKED_ENV_KEYS.filter((key) => !env[key]?.trim());
  const phases = buildPilotWeek1ExecutionPhaseStatuses({
    prerequisites,
    goNoGoSummary: artifacts.goNoGoSummary,
    metricsBaseline: artifacts.metricsBaseline,
    caseStudyDraft: artifacts.caseStudyDraft,
    env,
  });
  const week1Complete = resolvePilotWeek1ExecutionComplete(phases);
  const readyForDay5Smokes =
    prerequisites.prerequisitesComplete &&
    phases.filter((phase) => phase.id !== "day5_metrics_narrative").every((phase) => phase.complete);

  return {
    prerequisites,
    present,
    missing,
    phases,
    goDecision,
    week1Complete,
    readyForDay5Smokes,
  };
}

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluatePilotWeek1Env();

  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          policyId: "era21-pilot-week1-execution-v1",
          prerequisitesComplete: result.prerequisites.prerequisitesComplete,
          goDecision: result.goDecision,
          week1Complete: result.week1Complete,
          readyForDay5Smokes: result.readyForDay5Smokes,
          presentCount: result.present.length,
          missing: result.missing,
          phases: result.phases.map((phase) => ({
            id: phase.id,
            label: phase.label,
            complete: phase.complete,
            detail: phase.detail,
          })),
        },
        null,
        2,
      ),
    );
    process.exit(result.prerequisites.prerequisitesComplete ? 0 : 2);
  }

  console.log(`\nPilot Week 1 validation (era21-pilot-week1-execution-v1)\n`);

  if (!result.prerequisites.prerequisitesComplete) {
    console.log("Blocked — decision must be GO in artifacts/pilot-gono-go-summary.json first.\n");
    process.exit(2);
  }

  for (const phase of result.phases) {
    console.log(`${phase.complete ? "✓" : "○"} ${phase.label}`);
    console.log(`  ${phase.detail}\n`);
  }

  console.log(`Week 1 complete: ${result.week1Complete ? "yes" : "no"}`);
  console.log(`Ready for Day 5 smokes: ${result.readyForDay5Smokes ? "yes" : "no"}\n`);
  process.exit(0);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}
