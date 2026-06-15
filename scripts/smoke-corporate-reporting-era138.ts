/**
 * Era 138 Corporate Reporting orchestrator — CEO P&L trends forecast wiring cert.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  CORPORATE_REPORTING_ERA138_CYCLE_RUNBOOK_STEPS,
  CORPORATE_REPORTING_ERA138_NPM_SCRIPT,
  CORPORATE_REPORTING_ERA138_OPS_DOC,
  CORPORATE_REPORTING_ERA138_POLICY_ID,
  CORPORATE_REPORTING_ERA138_SUMMARY_ARTIFACT,
} from "../lib/enterprise/corporate-reporting-era138-policy";
import {
  auditCorporateReportingSmokeWiring,
  buildCorporateReportingSmokeEra138Summary,
  formatCorporateReportingSmokeEra138ReportLines,
} from "../lib/enterprise/corporate-reporting-smoke-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(
  summary: ReturnType<typeof buildCorporateReportingSmokeEra138Summary>,
): void {
  const path = join(process.cwd(), CORPORATE_REPORTING_ERA138_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nCorporate Reporting smoke (${CORPORATE_REPORTING_ERA138_POLICY_ID})\n`);
  for (const [index, step] of CORPORATE_REPORTING_ERA138_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${CORPORATE_REPORTING_ERA138_OPS_DOC}\n`);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 138 Corporate Reporting smoke

  (default)         Cert chain + wiring audit
  --checklist-only  Print activation runbook steps
`);
    process.exit(0);
  }

  if (process.argv.includes("--checklist-only")) {
    printRunbook();
    process.exit(0);
  }

  console.log(`\n[${CORPORATE_REPORTING_ERA138_NPM_SCRIPT}] ${CORPORATE_REPORTING_ERA138_POLICY_ID}\n`);
  console.log("\n→ npm run test:ci:corporate-reporting-era138:cert\n");
  const certCode = runNpmScript("test:ci:corporate-reporting-era138:cert");

  const wiring = auditCorporateReportingSmokeWiring(process.cwd());

  const summary = buildCorporateReportingSmokeEra138Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatCorporateReportingSmokeEra138ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${CORPORATE_REPORTING_ERA138_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
