/**
 * Era 152 Grubhub LIVE integration orchestrator — OAuth webhook menu sync wiring cert.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  GRUBHUB_LIVE_SMOKE_ERA152_CYCLE_RUNBOOK_STEPS,
  GRUBHUB_LIVE_SMOKE_ERA152_NPM_SCRIPT,
  GRUBHUB_LIVE_SMOKE_ERA152_OPS_DOC,
  GRUBHUB_LIVE_SMOKE_ERA152_POLICY_ID,
  GRUBHUB_LIVE_SMOKE_ERA152_SUMMARY_ARTIFACT,
} from "../lib/integrations/grubhub-live-smoke-era152-policy";
import {
  auditGrubhubLiveSmokeEra152Wiring,
  buildGrubhubLiveSmokeEra152Summary,
  formatGrubhubLiveSmokeEra152ReportLines,
} from "../lib/integrations/grubhub-live-smoke-era152-smoke-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(
  summary: ReturnType<typeof buildGrubhubLiveSmokeEra152Summary>,
): void {
  const path = join(process.cwd(), GRUBHUB_LIVE_SMOKE_ERA152_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nGrubhub LIVE integration (${GRUBHUB_LIVE_SMOKE_ERA152_POLICY_ID})\n`);
  for (const [index, step] of GRUBHUB_LIVE_SMOKE_ERA152_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${GRUBHUB_LIVE_SMOKE_ERA152_OPS_DOC}\n`);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 152 Grubhub LIVE integration smoke

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
    `\n[${GRUBHUB_LIVE_SMOKE_ERA152_NPM_SCRIPT}] ${GRUBHUB_LIVE_SMOKE_ERA152_POLICY_ID}\n`,
  );
  console.log("\n→ npm run test:ci:grubhub-live-smoke-era152:cert\n");
  const certCode = runNpmScript("test:ci:grubhub-live-smoke-era152:cert");

  const wiring = auditGrubhubLiveSmokeEra152Wiring(process.cwd());

  const summary = buildGrubhubLiveSmokeEra152Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatGrubhubLiveSmokeEra152ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${GRUBHUB_LIVE_SMOKE_ERA152_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
