/**
 * Era 157 OpenTable LIVE integration orchestrator — OAuth reservation webhook availability wiring cert.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  OPENTABLE_LIVE_SMOKE_ERA157_CYCLE_RUNBOOK_STEPS,
  OPENTABLE_LIVE_SMOKE_ERA157_NPM_SCRIPT,
  OPENTABLE_LIVE_SMOKE_ERA157_OPS_DOC,
  OPENTABLE_LIVE_SMOKE_ERA157_POLICY_ID,
  OPENTABLE_LIVE_SMOKE_ERA157_SUMMARY_ARTIFACT,
} from "../lib/integrations/opentable-live-smoke-era157-policy";
import {
  auditOpenTableLiveSmokeEra157Wiring,
  buildOpenTableLiveSmokeEra157Summary,
  formatOpenTableLiveSmokeEra157ReportLines,
} from "../lib/integrations/opentable-live-smoke-era157-smoke-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(
  summary: ReturnType<typeof buildOpenTableLiveSmokeEra157Summary>,
): void {
  const path = join(process.cwd(), OPENTABLE_LIVE_SMOKE_ERA157_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(
    `\nOpenTable LIVE integration (${OPENTABLE_LIVE_SMOKE_ERA157_POLICY_ID})\n`,
  );
  for (const [index, step] of OPENTABLE_LIVE_SMOKE_ERA157_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${OPENTABLE_LIVE_SMOKE_ERA157_OPS_DOC}\n`);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 157 OpenTable LIVE integration smoke

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
    `\n[${OPENTABLE_LIVE_SMOKE_ERA157_NPM_SCRIPT}] ${OPENTABLE_LIVE_SMOKE_ERA157_POLICY_ID}\n`,
  );
  console.log("\n→ npm run test:ci:opentable-live-smoke-era157:cert\n");
  const certCode = runNpmScript("test:ci:opentable-live-smoke-era157:cert");

  const wiring = auditOpenTableLiveSmokeEra157Wiring(process.cwd());

  const summary = buildOpenTableLiveSmokeEra157Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatOpenTableLiveSmokeEra157ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${OPENTABLE_LIVE_SMOKE_ERA157_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
