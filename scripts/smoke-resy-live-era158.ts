/**
 * Era 158 Resy LIVE integration orchestrator — OAuth reservation sync waitlist wiring cert.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  RESY_LIVE_SMOKE_ERA158_CYCLE_RUNBOOK_STEPS,
  RESY_LIVE_SMOKE_ERA158_NPM_SCRIPT,
  RESY_LIVE_SMOKE_ERA158_OPS_DOC,
  RESY_LIVE_SMOKE_ERA158_POLICY_ID,
  RESY_LIVE_SMOKE_ERA158_SUMMARY_ARTIFACT,
} from "../lib/integrations/resy-live-smoke-era158-policy";
import {
  auditResyLiveSmokeEra158Wiring,
  buildResyLiveSmokeEra158Summary,
  formatResyLiveSmokeEra158ReportLines,
} from "../lib/integrations/resy-live-smoke-era158-smoke-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(summary: ReturnType<typeof buildResyLiveSmokeEra158Summary>): void {
  const path = join(process.cwd(), RESY_LIVE_SMOKE_ERA158_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nResy LIVE integration (${RESY_LIVE_SMOKE_ERA158_POLICY_ID})\n`);
  for (const [index, step] of RESY_LIVE_SMOKE_ERA158_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${RESY_LIVE_SMOKE_ERA158_OPS_DOC}\n`);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 158 Resy LIVE integration smoke

  (default)         Cert chain + wiring audit
  --checklist-only  Print activation runbook steps
`);
    process.exit(0);
  }

  if (process.argv.includes("--checklist-only")) {
    printRunbook();
    process.exit(0);
  }

  console.log(`\n[${RESY_LIVE_SMOKE_ERA158_NPM_SCRIPT}] ${RESY_LIVE_SMOKE_ERA158_POLICY_ID}\n`);
  console.log("\n→ npm run test:ci:resy-live-smoke-era158:cert\n");
  const certCode = runNpmScript("test:ci:resy-live-smoke-era158:cert");

  const wiring = auditResyLiveSmokeEra158Wiring(process.cwd());

  const summary = buildResyLiveSmokeEra158Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatResyLiveSmokeEra158ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${RESY_LIVE_SMOKE_ERA158_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
