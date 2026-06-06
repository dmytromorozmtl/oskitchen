/**
 * Era 150 DoorDash LIVE integration orchestrator — Drive API webhook menu sync wiring cert.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  DOORDASH_LIVE_SMOKE_ERA150_CYCLE_RUNBOOK_STEPS,
  DOORDASH_LIVE_SMOKE_ERA150_NPM_SCRIPT,
  DOORDASH_LIVE_SMOKE_ERA150_OPS_DOC,
  DOORDASH_LIVE_SMOKE_ERA150_POLICY_ID,
  DOORDASH_LIVE_SMOKE_ERA150_SUMMARY_ARTIFACT,
} from "../lib/integrations/doordash-live-smoke-era150-policy";
import {
  auditDoorDashLiveSmokeEra150Wiring,
  buildDoorDashLiveSmokeEra150Summary,
  formatDoorDashLiveSmokeEra150ReportLines,
} from "../lib/integrations/doordash-live-smoke-era150-smoke-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(
  summary: ReturnType<typeof buildDoorDashLiveSmokeEra150Summary>,
): void {
  const path = join(process.cwd(), DOORDASH_LIVE_SMOKE_ERA150_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nDoorDash LIVE integration (${DOORDASH_LIVE_SMOKE_ERA150_POLICY_ID})\n`);
  for (const [index, step] of DOORDASH_LIVE_SMOKE_ERA150_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${DOORDASH_LIVE_SMOKE_ERA150_OPS_DOC}\n`);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 150 DoorDash LIVE integration smoke

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
    `\n[${DOORDASH_LIVE_SMOKE_ERA150_NPM_SCRIPT}] ${DOORDASH_LIVE_SMOKE_ERA150_POLICY_ID}\n`,
  );
  console.log("\n→ npm run test:ci:doordash-live-smoke-era150:cert\n");
  const certCode = runNpmScript("test:ci:doordash-live-smoke-era150:cert");

  const wiring = auditDoorDashLiveSmokeEra150Wiring(process.cwd());

  const summary = buildDoorDashLiveSmokeEra150Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatDoorDashLiveSmokeEra150ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${DOORDASH_LIVE_SMOKE_ERA150_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
