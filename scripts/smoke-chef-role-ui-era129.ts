/**
 * Era 129 Chef Role UI orchestrator — line KPIs kitchen briefing wiring cert.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  CHEF_ROLE_UI_ERA129_CYCLE_RUNBOOK_STEPS,
  CHEF_ROLE_UI_ERA129_NPM_SCRIPT,
  CHEF_ROLE_UI_ERA129_OPS_DOC,
  CHEF_ROLE_UI_ERA129_POLICY_ID,
  CHEF_ROLE_UI_ERA129_SUMMARY_ARTIFACT,
} from "../lib/roles/chef-role-ui-era129-policy";
import {
  auditChefRoleUiSmokeWiring,
  buildChefRoleUiSmokeEra129Summary,
  formatChefRoleUiSmokeEra129ReportLines,
} from "../lib/roles/chef-role-ui-smoke-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(
  summary: ReturnType<typeof buildChefRoleUiSmokeEra129Summary>,
): void {
  const path = join(process.cwd(), CHEF_ROLE_UI_ERA129_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nChef Role UI smoke (${CHEF_ROLE_UI_ERA129_POLICY_ID})\n`);
  for (const [index, step] of CHEF_ROLE_UI_ERA129_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${CHEF_ROLE_UI_ERA129_OPS_DOC}\n`);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 129 Chef Role UI smoke

  (default)         Cert chain + wiring audit
  --checklist-only  Print activation runbook steps
`);
    process.exit(0);
  }

  if (process.argv.includes("--checklist-only")) {
    printRunbook();
    process.exit(0);
  }

  console.log(`\n[${CHEF_ROLE_UI_ERA129_NPM_SCRIPT}] ${CHEF_ROLE_UI_ERA129_POLICY_ID}\n`);
  console.log("\n→ npm run test:ci:chef-role-ui-era129:cert\n");
  const certCode = runNpmScript("test:ci:chef-role-ui-era129:cert");

  const wiring = auditChefRoleUiSmokeWiring(process.cwd());

  const summary = buildChefRoleUiSmokeEra129Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatChefRoleUiSmokeEra129ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${CHEF_ROLE_UI_ERA129_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
