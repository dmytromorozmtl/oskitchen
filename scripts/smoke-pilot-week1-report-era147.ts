/**
 * Era 147 Pilot Week 1 report orchestrator — LOI checkpoint KPI wiring cert.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  PILOT_WEEK1_REPORT_ERA147_CYCLE_RUNBOOK_STEPS,
  PILOT_WEEK1_REPORT_ERA147_NPM_SCRIPT,
  PILOT_WEEK1_REPORT_ERA147_OPS_DOC,
  PILOT_WEEK1_REPORT_ERA147_POLICY_ID,
  PILOT_WEEK1_REPORT_ERA147_SUMMARY_ARTIFACT,
} from "../lib/commercial/pilot-week1-report-era147-policy";
import {
  auditPilotWeek1ReportEra147Wiring,
  buildPilotWeek1ReportEra147Summary,
  formatPilotWeek1ReportEra147ReportLines,
} from "../lib/commercial/pilot-week1-report-era147-smoke-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(
  summary: ReturnType<typeof buildPilotWeek1ReportEra147Summary>,
): void {
  const path = join(process.cwd(), PILOT_WEEK1_REPORT_ERA147_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nPilot Week 1 report (${PILOT_WEEK1_REPORT_ERA147_POLICY_ID})\n`);
  for (const [index, step] of PILOT_WEEK1_REPORT_ERA147_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${PILOT_WEEK1_REPORT_ERA147_OPS_DOC}\n`);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 147 Pilot Week 1 report smoke

  (default)         Cert chain + wiring audit
  --checklist-only  Print activation runbook steps
`);
    process.exit(0);
  }

  if (process.argv.includes("--checklist-only")) {
    printRunbook();
    process.exit(0);
  }

  console.log(
    `\n[${PILOT_WEEK1_REPORT_ERA147_NPM_SCRIPT}] ${PILOT_WEEK1_REPORT_ERA147_POLICY_ID}\n`,
  );
  console.log("\n→ npm run test:ci:pilot-week1-report-era147:cert\n");
  const certCode = runNpmScript("test:ci:pilot-week1-report-era147:cert");

  const wiring = auditPilotWeek1ReportEra147Wiring(process.cwd());

  const summary = buildPilotWeek1ReportEra147Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatPilotWeek1ReportEra147ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${PILOT_WEEK1_REPORT_ERA147_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
