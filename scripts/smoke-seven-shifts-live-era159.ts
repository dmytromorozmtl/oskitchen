/**
 * Era 159 7shifts LIVE integration orchestrator — OAuth schedule labor wiring cert.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  SEVEN_SHIFTS_LIVE_SMOKE_ERA159_CYCLE_RUNBOOK_STEPS,
  SEVEN_SHIFTS_LIVE_SMOKE_ERA159_NPM_SCRIPT,
  SEVEN_SHIFTS_LIVE_SMOKE_ERA159_OPS_DOC,
  SEVEN_SHIFTS_LIVE_SMOKE_ERA159_POLICY_ID,
  SEVEN_SHIFTS_LIVE_SMOKE_ERA159_SUMMARY_ARTIFACT,
} from "../lib/integrations/seven-shifts-live-smoke-era159-policy";
import {
  auditSevenShiftsLiveSmokeEra159Wiring,
  buildSevenShiftsLiveSmokeEra159Summary,
  formatSevenShiftsLiveSmokeEra159ReportLines,
} from "../lib/integrations/seven-shifts-live-smoke-era159-smoke-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(
  summary: ReturnType<typeof buildSevenShiftsLiveSmokeEra159Summary>,
): void {
  const path = join(process.cwd(), SEVEN_SHIFTS_LIVE_SMOKE_ERA159_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\n7shifts LIVE integration (${SEVEN_SHIFTS_LIVE_SMOKE_ERA159_POLICY_ID})\n`);
  for (const [index, step] of SEVEN_SHIFTS_LIVE_SMOKE_ERA159_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${SEVEN_SHIFTS_LIVE_SMOKE_ERA159_OPS_DOC}\n`);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 159 7shifts LIVE integration smoke

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
    `\n[${SEVEN_SHIFTS_LIVE_SMOKE_ERA159_NPM_SCRIPT}] ${SEVEN_SHIFTS_LIVE_SMOKE_ERA159_POLICY_ID}\n`,
  );
  console.log("\n→ npm run test:ci:seven-shifts-live-smoke-era159:cert\n");
  const certCode = runNpmScript("test:ci:seven-shifts-live-smoke-era159:cert");

  const wiring = auditSevenShiftsLiveSmokeEra159Wiring(process.cwd());

  const summary = buildSevenShiftsLiveSmokeEra159Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatSevenShiftsLiveSmokeEra159ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${SEVEN_SHIFTS_LIVE_SMOKE_ERA159_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
