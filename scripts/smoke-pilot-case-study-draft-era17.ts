/**
 * Era 17 pilot case study draft smoke — cert chain + publish gate artifact.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  PILOT_CASE_STUDY_DRAFT_ERA17_CYCLE_RUNBOOK_STEPS,
  PILOT_CASE_STUDY_DRAFT_ERA17_NPM_SCRIPT,
  PILOT_CASE_STUDY_DRAFT_ERA17_PILOT_METRICS_ARTIFACT,
  PILOT_CASE_STUDY_DRAFT_ERA17_POLICY_ID,
  PILOT_CASE_STUDY_DRAFT_ERA17_SUMMARY_ARTIFACT,
} from "../lib/commercial/pilot-case-study-draft-era17-policy";
import {
  buildPilotCaseStudyDraftSummary,
  formatPilotCaseStudyDraftReportLines,
  type PilotMetricsBaselineArtifactRef,
} from "../lib/commercial/pilot-case-study-draft-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function loadPilotMetricsArtifact(): PilotMetricsBaselineArtifactRef | null {
  const path = join(process.cwd(), PILOT_CASE_STUDY_DRAFT_ERA17_PILOT_METRICS_ARTIFACT);
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf8")) as PilotMetricsBaselineArtifactRef;
  } catch {
    return null;
  }
}

function writeSummary(summary: ReturnType<typeof buildPilotCaseStudyDraftSummary>): void {
  const path = join(process.cwd(), PILOT_CASE_STUDY_DRAFT_ERA17_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nPilot case study draft (${PILOT_CASE_STUDY_DRAFT_ERA17_POLICY_ID})\n`);
  for (const [index, step] of PILOT_CASE_STUDY_DRAFT_ERA17_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log("\nSee docs/pilot-case-study-draft-era17.md\n");
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 17 pilot case study draft smoke

  (default)         Cert chain + publish gate artifact
  --checklist-only  Print runbook steps
`);
    process.exit(0);
  }

  if (process.argv.includes("--checklist-only")) {
    printRunbook();
    process.exit(0);
  }

  console.log(`\n[${PILOT_CASE_STUDY_DRAFT_ERA17_NPM_SCRIPT}] ${PILOT_CASE_STUDY_DRAFT_ERA17_POLICY_ID}\n`);
  console.log("\n→ npm run test:ci:pilot-case-study-draft-era17:cert\n");
  const certCode = runNpmScript("test:ci:pilot-case-study-draft-era17:cert");
  const pilotMetrics = loadPilotMetricsArtifact();
  const summary = buildPilotCaseStudyDraftSummary({
    pilotMetrics,
    certPassed: certCode === 0,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatPilotCaseStudyDraftReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${PILOT_CASE_STUDY_DRAFT_ERA17_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }

  if (summary.publishProofStatus === "proof_skipped_missing_pilot_metrics") {
    console.log(
      "SKIPPED WITH REASON — internal draft only; pilot metrics baseline overall PASSED required before citing KPIs in case study.\n",
    );
  } else if (summary.publishProofStatus === "proof_skipped_awaiting_customer_approval") {
    console.log(
      "SKIPPED WITH REASON — internal draft only; PILOT_CASE_STUDY_CUSTOMER_APPROVAL=signed|anonymized_signed required before publish.\n",
    );
  }
}

main();
