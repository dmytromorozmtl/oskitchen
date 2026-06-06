/**
 * Era 151 Skip/Just Eat LIVE integration orchestrator — OAuth webhook KDS wiring cert.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  SKIP_LIVE_SMOKE_ERA151_CYCLE_RUNBOOK_STEPS,
  SKIP_LIVE_SMOKE_ERA151_NPM_SCRIPT,
  SKIP_LIVE_SMOKE_ERA151_OPS_DOC,
  SKIP_LIVE_SMOKE_ERA151_POLICY_ID,
  SKIP_LIVE_SMOKE_ERA151_SUMMARY_ARTIFACT,
} from "../lib/integrations/skip-live-smoke-era151-policy";
import {
  auditSkipLiveSmokeEra151Wiring,
  buildSkipLiveSmokeEra151Summary,
  formatSkipLiveSmokeEra151ReportLines,
} from "../lib/integrations/skip-live-smoke-era151-smoke-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(summary: ReturnType<typeof buildSkipLiveSmokeEra151Summary>): void {
  const path = join(process.cwd(), SKIP_LIVE_SMOKE_ERA151_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nSkip/Just Eat LIVE integration (${SKIP_LIVE_SMOKE_ERA151_POLICY_ID})\n`);
  for (const [index, step] of SKIP_LIVE_SMOKE_ERA151_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${SKIP_LIVE_SMOKE_ERA151_OPS_DOC}\n`);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 151 Skip/Just Eat LIVE integration smoke

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
    `\n[${SKIP_LIVE_SMOKE_ERA151_NPM_SCRIPT}] ${SKIP_LIVE_SMOKE_ERA151_POLICY_ID}\n`,
  );
  console.log("\n→ npm run test:ci:skip-live-smoke-era151:cert\n");
  const certCode = runNpmScript("test:ci:skip-live-smoke-era151:cert");

  const wiring = auditSkipLiveSmokeEra151Wiring(process.cwd());

  const summary = buildSkipLiveSmokeEra151Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatSkipLiveSmokeEra151ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${SKIP_LIVE_SMOKE_ERA151_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
