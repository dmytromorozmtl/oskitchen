/**
 * Era 148 first case study orchestrator — LOI Week 1 evidence publish gate wiring cert.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  CASE_STUDY_1_ERA148_CYCLE_RUNBOOK_STEPS,
  CASE_STUDY_1_ERA148_NPM_SCRIPT,
  CASE_STUDY_1_ERA148_OPS_DOC,
  CASE_STUDY_1_ERA148_POLICY_ID,
  CASE_STUDY_1_ERA148_SUMMARY_ARTIFACT,
} from "../lib/marketing/case-study-1-era148-policy";
import {
  auditCaseStudy1Era148Wiring,
  buildCaseStudy1Era148Summary,
  formatCaseStudy1Era148ReportLines,
} from "../lib/marketing/case-study-1-era148-smoke-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(summary: ReturnType<typeof buildCaseStudy1Era148Summary>): void {
  const path = join(process.cwd(), CASE_STUDY_1_ERA148_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nFirst case study (${CASE_STUDY_1_ERA148_POLICY_ID})\n`);
  for (const [index, step] of CASE_STUDY_1_ERA148_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${CASE_STUDY_1_ERA148_OPS_DOC}\n`);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 148 first case study smoke

  (default)         Cert chain + wiring audit
  --checklist-only  Print activation runbook steps
`);
    process.exit(0);
  }

  if (process.argv.includes("--checklist-only")) {
    printRunbook();
    process.exit(0);
  }

  console.log(`\n[${CASE_STUDY_1_ERA148_NPM_SCRIPT}] ${CASE_STUDY_1_ERA148_POLICY_ID}\n`);
  console.log("\n→ npm run test:ci:case-study-1-era148:cert\n");
  const certCode = runNpmScript("test:ci:case-study-1-era148:cert");

  const wiring = auditCaseStudy1Era148Wiring(process.cwd());

  const summary = buildCaseStudy1Era148Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatCaseStudy1Era148ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${CASE_STUDY_1_ERA148_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
