/**
 * Era 155 QuickBooks LIVE integration orchestrator — OAuth journal chart wiring cert.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  QUICKBOOKS_LIVE_SMOKE_ERA155_CYCLE_RUNBOOK_STEPS,
  QUICKBOOKS_LIVE_SMOKE_ERA155_NPM_SCRIPT,
  QUICKBOOKS_LIVE_SMOKE_ERA155_OPS_DOC,
  QUICKBOOKS_LIVE_SMOKE_ERA155_POLICY_ID,
  QUICKBOOKS_LIVE_SMOKE_ERA155_SUMMARY_ARTIFACT,
} from "../lib/integrations/quickbooks-live-smoke-era155-policy";
import {
  auditQuickBooksLiveSmokeEra155Wiring,
  buildQuickBooksLiveSmokeEra155Summary,
  formatQuickBooksLiveSmokeEra155ReportLines,
} from "../lib/integrations/quickbooks-live-smoke-era155-smoke-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(
  summary: ReturnType<typeof buildQuickBooksLiveSmokeEra155Summary>,
): void {
  const path = join(process.cwd(), QUICKBOOKS_LIVE_SMOKE_ERA155_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(
    `\nQuickBooks LIVE integration (${QUICKBOOKS_LIVE_SMOKE_ERA155_POLICY_ID})\n`,
  );
  for (const [index, step] of QUICKBOOKS_LIVE_SMOKE_ERA155_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${QUICKBOOKS_LIVE_SMOKE_ERA155_OPS_DOC}\n`);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 155 QuickBooks LIVE integration smoke

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
    `\n[${QUICKBOOKS_LIVE_SMOKE_ERA155_NPM_SCRIPT}] ${QUICKBOOKS_LIVE_SMOKE_ERA155_POLICY_ID}\n`,
  );
  console.log("\n→ npm run test:ci:quickbooks-live-smoke-era155:cert\n");
  const certCode = runNpmScript("test:ci:quickbooks-live-smoke-era155:cert");

  const wiring = auditQuickBooksLiveSmokeEra155Wiring(process.cwd());

  const summary = buildQuickBooksLiveSmokeEra155Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatQuickBooksLiveSmokeEra155ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${QUICKBOOKS_LIVE_SMOKE_ERA155_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
