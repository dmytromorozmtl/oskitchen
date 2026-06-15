/**
 * Era 149 Uber Eats LIVE integration orchestrator — OAuth webhook KDS wiring cert.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  UBER_EATS_LIVE_SMOKE_ERA149_CYCLE_RUNBOOK_STEPS,
  UBER_EATS_LIVE_SMOKE_ERA149_NPM_SCRIPT,
  UBER_EATS_LIVE_SMOKE_ERA149_OPS_DOC,
  UBER_EATS_LIVE_SMOKE_ERA149_POLICY_ID,
  UBER_EATS_LIVE_SMOKE_ERA149_SUMMARY_ARTIFACT,
} from "../lib/integrations/uber-eats-live-smoke-era149-policy";
import {
  auditUberEatsLiveSmokeEra149Wiring,
  buildUberEatsLiveSmokeEra149Summary,
  formatUberEatsLiveSmokeEra149ReportLines,
} from "../lib/integrations/uber-eats-live-smoke-era149-smoke-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(
  summary: ReturnType<typeof buildUberEatsLiveSmokeEra149Summary>,
): void {
  const path = join(process.cwd(), UBER_EATS_LIVE_SMOKE_ERA149_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nUber Eats LIVE integration (${UBER_EATS_LIVE_SMOKE_ERA149_POLICY_ID})\n`);
  for (const [index, step] of UBER_EATS_LIVE_SMOKE_ERA149_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${UBER_EATS_LIVE_SMOKE_ERA149_OPS_DOC}\n`);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 149 Uber Eats LIVE integration smoke

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
    `\n[${UBER_EATS_LIVE_SMOKE_ERA149_NPM_SCRIPT}] ${UBER_EATS_LIVE_SMOKE_ERA149_POLICY_ID}\n`,
  );
  console.log("\n→ npm run test:ci:uber-eats-live-smoke-era149:cert\n");
  const certCode = runNpmScript("test:ci:uber-eats-live-smoke-era149:cert");

  const wiring = auditUberEatsLiveSmokeEra149Wiring(process.cwd());

  const summary = buildUberEatsLiveSmokeEra149Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatUberEatsLiveSmokeEra149ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${UBER_EATS_LIVE_SMOKE_ERA149_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
