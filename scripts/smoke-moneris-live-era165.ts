/**
 * Era 165 Moneris LIVE integration orchestrator — OAuth payment gateway wiring cert.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  MONERIS_LIVE_SMOKE_ERA165_CYCLE_RUNBOOK_STEPS,
  MONERIS_LIVE_SMOKE_ERA165_NPM_SCRIPT,
  MONERIS_LIVE_SMOKE_ERA165_OPS_DOC,
  MONERIS_LIVE_SMOKE_ERA165_POLICY_ID,
  MONERIS_LIVE_SMOKE_ERA165_SUMMARY_ARTIFACT,
} from "../lib/integrations/moneris-live-smoke-era165-policy";
import {
  auditMonerisLiveSmokeEra165Wiring,
  buildMonerisLiveSmokeEra165Summary,
  formatMonerisLiveSmokeEra165ReportLines,
} from "../lib/integrations/moneris-live-smoke-era165-smoke-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(
  summary: ReturnType<typeof buildMonerisLiveSmokeEra165Summary>,
): void {
  const path = join(process.cwd(), MONERIS_LIVE_SMOKE_ERA165_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nMoneris LIVE integration (${MONERIS_LIVE_SMOKE_ERA165_POLICY_ID})\n`);
  for (const [index, step] of MONERIS_LIVE_SMOKE_ERA165_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${MONERIS_LIVE_SMOKE_ERA165_OPS_DOC}\n`);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 165 Moneris LIVE integration smoke

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
    `\n[${MONERIS_LIVE_SMOKE_ERA165_NPM_SCRIPT}] ${MONERIS_LIVE_SMOKE_ERA165_POLICY_ID}\n`,
  );
  console.log("\n→ npm run test:ci:moneris-live-smoke-era165:cert\n");
  const certCode = runNpmScript("test:ci:moneris-live-smoke-era165:cert");

  const wiring = auditMonerisLiveSmokeEra165Wiring(process.cwd());

  const summary = buildMonerisLiveSmokeEra165Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatMonerisLiveSmokeEra165ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${MONERIS_LIVE_SMOKE_ERA165_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
