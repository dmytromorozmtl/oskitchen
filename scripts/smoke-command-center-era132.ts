/**
 * Era 132 Command Center orchestrator — Bloomberg terminal wiring cert.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  COMMAND_CENTER_ERA132_CYCLE_RUNBOOK_STEPS,
  COMMAND_CENTER_ERA132_NPM_SCRIPT,
  COMMAND_CENTER_ERA132_OPS_DOC,
  COMMAND_CENTER_ERA132_POLICY_ID,
  COMMAND_CENTER_ERA132_SUMMARY_ARTIFACT,
} from "../lib/command-center/command-center-era132-policy";
import {
  auditCommandCenterSmokeWiring,
  buildCommandCenterSmokeEra132Summary,
  formatCommandCenterSmokeEra132ReportLines,
} from "../lib/command-center/command-center-smoke-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(
  summary: ReturnType<typeof buildCommandCenterSmokeEra132Summary>,
): void {
  const path = join(process.cwd(), COMMAND_CENTER_ERA132_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nCommand Center smoke (${COMMAND_CENTER_ERA132_POLICY_ID})\n`);
  for (const [index, step] of COMMAND_CENTER_ERA132_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${COMMAND_CENTER_ERA132_OPS_DOC}\n`);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 132 Command Center smoke

  (default)         Cert chain + wiring audit
  --checklist-only  Print activation runbook steps
`);
    process.exit(0);
  }

  if (process.argv.includes("--checklist-only")) {
    printRunbook();
    process.exit(0);
  }

  console.log(`\n[${COMMAND_CENTER_ERA132_NPM_SCRIPT}] ${COMMAND_CENTER_ERA132_POLICY_ID}\n`);
  console.log("\n→ npm run test:ci:command-center-era132:cert\n");
  const certCode = runNpmScript("test:ci:command-center-era132:cert");

  const wiring = auditCommandCenterSmokeWiring(process.cwd());

  const summary = buildCommandCenterSmokeEra132Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatCommandCenterSmokeEra132ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${COMMAND_CENTER_ERA132_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
