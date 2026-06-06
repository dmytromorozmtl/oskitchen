/**
 * Era 173 POS Cash Management orchestrator — open/count/close/report Round 2 wiring cert.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  POS_CASH_MANAGEMENT_ERA173_CYCLE_RUNBOOK_STEPS,
  POS_CASH_MANAGEMENT_ERA173_NPM_SCRIPT,
  POS_CASH_MANAGEMENT_ERA173_OPS_DOC,
  POS_CASH_MANAGEMENT_ERA173_POLICY_ID,
  POS_CASH_MANAGEMENT_ERA173_SUMMARY_ARTIFACT,
} from "../lib/pos/pos-cash-management-era173-policy";
import {
  auditPosCashManagementSmokeEra173Wiring,
  buildPosCashManagementSmokeEra173Summary,
  formatPosCashManagementSmokeEra173ReportLines,
} from "../lib/pos/pos-cash-management-era173-smoke-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(
  summary: ReturnType<typeof buildPosCashManagementSmokeEra173Summary>,
): void {
  const path = join(process.cwd(), POS_CASH_MANAGEMENT_ERA173_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nPOS Cash Management (${POS_CASH_MANAGEMENT_ERA173_POLICY_ID})\n`);
  for (const [index, step] of POS_CASH_MANAGEMENT_ERA173_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${POS_CASH_MANAGEMENT_ERA173_OPS_DOC}\n`);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 173 POS Cash Management smoke

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
    `\n[${POS_CASH_MANAGEMENT_ERA173_NPM_SCRIPT}] ${POS_CASH_MANAGEMENT_ERA173_POLICY_ID}\n`,
  );
  console.log("\n→ npm run test:ci:pos-cash-management-era173:cert\n");
  const certCode = runNpmScript("test:ci:pos-cash-management-era173:cert");

  const wiring = auditPosCashManagementSmokeEra173Wiring(process.cwd());

  const summary = buildPosCashManagementSmokeEra173Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatPosCashManagementSmokeEra173ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${POS_CASH_MANAGEMENT_ERA173_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
