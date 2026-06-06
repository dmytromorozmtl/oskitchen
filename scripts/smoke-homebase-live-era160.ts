/**
 * Era 160 Homebase LIVE integration orchestrator — OAuth time clock schedule wiring cert.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  HOMEBASE_LIVE_SMOKE_ERA160_CYCLE_RUNBOOK_STEPS,
  HOMEBASE_LIVE_SMOKE_ERA160_NPM_SCRIPT,
  HOMEBASE_LIVE_SMOKE_ERA160_OPS_DOC,
  HOMEBASE_LIVE_SMOKE_ERA160_POLICY_ID,
  HOMEBASE_LIVE_SMOKE_ERA160_SUMMARY_ARTIFACT,
} from "../lib/integrations/homebase-live-smoke-era160-policy";
import {
  auditHomebaseLiveSmokeEra160Wiring,
  buildHomebaseLiveSmokeEra160Summary,
  formatHomebaseLiveSmokeEra160ReportLines,
} from "../lib/integrations/homebase-live-smoke-era160-smoke-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(
  summary: ReturnType<typeof buildHomebaseLiveSmokeEra160Summary>,
): void {
  const path = join(process.cwd(), HOMEBASE_LIVE_SMOKE_ERA160_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nHomebase LIVE integration (${HOMEBASE_LIVE_SMOKE_ERA160_POLICY_ID})\n`);
  for (const [index, step] of HOMEBASE_LIVE_SMOKE_ERA160_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${HOMEBASE_LIVE_SMOKE_ERA160_OPS_DOC}\n`);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 160 Homebase LIVE integration smoke

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
    `\n[${HOMEBASE_LIVE_SMOKE_ERA160_NPM_SCRIPT}] ${HOMEBASE_LIVE_SMOKE_ERA160_POLICY_ID}\n`,
  );
  console.log("\n→ npm run test:ci:homebase-live-smoke-era160:cert\n");
  const certCode = runNpmScript("test:ci:homebase-live-smoke-era160:cert");

  const wiring = auditHomebaseLiveSmokeEra160Wiring(process.cwd());

  const summary = buildHomebaseLiveSmokeEra160Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatHomebaseLiveSmokeEra160ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${HOMEBASE_LIVE_SMOKE_ERA160_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
