/**
 * Era 131 Driver Role UI orchestrator — route KPIs delivery signals wiring cert.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  DRIVER_ROLE_UI_ERA131_CYCLE_RUNBOOK_STEPS,
  DRIVER_ROLE_UI_ERA131_NPM_SCRIPT,
  DRIVER_ROLE_UI_ERA131_OPS_DOC,
  DRIVER_ROLE_UI_ERA131_POLICY_ID,
  DRIVER_ROLE_UI_ERA131_SUMMARY_ARTIFACT,
} from "../lib/roles/driver-role-ui-era131-policy";
import {
  auditDriverRoleUiSmokeWiring,
  buildDriverRoleUiSmokeEra131Summary,
  formatDriverRoleUiSmokeEra131ReportLines,
} from "../lib/roles/driver-role-ui-smoke-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(
  summary: ReturnType<typeof buildDriverRoleUiSmokeEra131Summary>,
): void {
  const path = join(process.cwd(), DRIVER_ROLE_UI_ERA131_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nDriver Role UI smoke (${DRIVER_ROLE_UI_ERA131_POLICY_ID})\n`);
  for (const [index, step] of DRIVER_ROLE_UI_ERA131_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${DRIVER_ROLE_UI_ERA131_OPS_DOC}\n`);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 131 Driver Role UI smoke

  (default)         Cert chain + wiring audit
  --checklist-only  Print activation runbook steps
`);
    process.exit(0);
  }

  if (process.argv.includes("--checklist-only")) {
    printRunbook();
    process.exit(0);
  }

  console.log(`\n[${DRIVER_ROLE_UI_ERA131_NPM_SCRIPT}] ${DRIVER_ROLE_UI_ERA131_POLICY_ID}\n`);
  console.log("\n→ npm run test:ci:driver-role-ui-era131:cert\n");
  const certCode = runNpmScript("test:ci:driver-role-ui-era131:cert");

  const wiring = auditDriverRoleUiSmokeWiring(process.cwd());

  const summary = buildDriverRoleUiSmokeEra131Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatDriverRoleUiSmokeEra131ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${DRIVER_ROLE_UI_ERA131_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
