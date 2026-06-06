/**
 * Era 136 Multi-Location Dashboard 2.0 orchestrator — 100+ scale wiring cert.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  MULTI_LOCATION_DASHBOARD_2_ERA136_CYCLE_RUNBOOK_STEPS,
  MULTI_LOCATION_DASHBOARD_2_ERA136_NPM_SCRIPT,
  MULTI_LOCATION_DASHBOARD_2_ERA136_OPS_DOC,
  MULTI_LOCATION_DASHBOARD_2_ERA136_POLICY_ID,
  MULTI_LOCATION_DASHBOARD_2_ERA136_SUMMARY_ARTIFACT,
} from "../lib/enterprise/multi-location-dashboard-2-era136-policy";
import {
  auditMultiLocationDashboard2SmokeWiring,
  buildMultiLocationDashboard2SmokeEra136Summary,
  formatMultiLocationDashboard2SmokeEra136ReportLines,
} from "../lib/enterprise/multi-location-dashboard-2-smoke-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(
  summary: ReturnType<typeof buildMultiLocationDashboard2SmokeEra136Summary>,
): void {
  const path = join(process.cwd(), MULTI_LOCATION_DASHBOARD_2_ERA136_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nMulti-Location Dashboard 2.0 smoke (${MULTI_LOCATION_DASHBOARD_2_ERA136_POLICY_ID})\n`);
  for (const [index, step] of MULTI_LOCATION_DASHBOARD_2_ERA136_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${MULTI_LOCATION_DASHBOARD_2_ERA136_OPS_DOC}\n`);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 136 Multi-Location Dashboard 2.0 smoke

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
    `\n[${MULTI_LOCATION_DASHBOARD_2_ERA136_NPM_SCRIPT}] ${MULTI_LOCATION_DASHBOARD_2_ERA136_POLICY_ID}\n`,
  );
  console.log("\n→ npm run test:ci:multi-location-dashboard-2-era136:cert\n");
  const certCode = runNpmScript("test:ci:multi-location-dashboard-2-era136:cert");

  const wiring = auditMultiLocationDashboard2SmokeWiring(process.cwd());

  const summary = buildMultiLocationDashboard2SmokeEra136Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatMultiLocationDashboard2SmokeEra136ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${MULTI_LOCATION_DASHBOARD_2_ERA136_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
