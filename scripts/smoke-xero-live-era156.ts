/**
 * Era 156 Xero LIVE integration orchestrator — OAuth invoice bank reconciliation wiring cert.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  XERO_LIVE_SMOKE_ERA156_CYCLE_RUNBOOK_STEPS,
  XERO_LIVE_SMOKE_ERA156_NPM_SCRIPT,
  XERO_LIVE_SMOKE_ERA156_OPS_DOC,
  XERO_LIVE_SMOKE_ERA156_POLICY_ID,
  XERO_LIVE_SMOKE_ERA156_SUMMARY_ARTIFACT,
} from "../lib/integrations/xero-live-smoke-era156-policy";
import {
  auditXeroLiveSmokeEra156Wiring,
  buildXeroLiveSmokeEra156Summary,
  formatXeroLiveSmokeEra156ReportLines,
} from "../lib/integrations/xero-live-smoke-era156-smoke-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(summary: ReturnType<typeof buildXeroLiveSmokeEra156Summary>): void {
  const path = join(process.cwd(), XERO_LIVE_SMOKE_ERA156_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nXero LIVE integration (${XERO_LIVE_SMOKE_ERA156_POLICY_ID})\n`);
  for (const [index, step] of XERO_LIVE_SMOKE_ERA156_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${XERO_LIVE_SMOKE_ERA156_OPS_DOC}\n`);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 156 Xero LIVE integration smoke

  (default)         Cert chain + wiring audit
  --checklist-only  Print activation runbook steps
`);
    process.exit(0);
  }

  if (process.argv.includes("--checklist-only")) {
    printRunbook();
    process.exit(0);
  }

  console.log(`\n[${XERO_LIVE_SMOKE_ERA156_NPM_SCRIPT}] ${XERO_LIVE_SMOKE_ERA156_POLICY_ID}\n`);
  console.log("\n→ npm run test:ci:xero-live-smoke-era156:cert\n");
  const certCode = runNpmScript("test:ci:xero-live-smoke-era156:cert");

  const wiring = auditXeroLiveSmokeEra156Wiring(process.cwd());

  const summary = buildXeroLiveSmokeEra156Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatXeroLiveSmokeEra156ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${XERO_LIVE_SMOKE_ERA156_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
