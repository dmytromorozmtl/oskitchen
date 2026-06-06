/**
 * Era 164 Square Payments LIVE integration orchestrator — OAuth payment refund wiring cert.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  SQUARE_PAYMENTS_LIVE_SMOKE_ERA164_CYCLE_RUNBOOK_STEPS,
  SQUARE_PAYMENTS_LIVE_SMOKE_ERA164_NPM_SCRIPT,
  SQUARE_PAYMENTS_LIVE_SMOKE_ERA164_OPS_DOC,
  SQUARE_PAYMENTS_LIVE_SMOKE_ERA164_POLICY_ID,
  SQUARE_PAYMENTS_LIVE_SMOKE_ERA164_SUMMARY_ARTIFACT,
} from "../lib/integrations/square-payments-live-smoke-era164-policy";
import {
  auditSquarePaymentsLiveSmokeEra164Wiring,
  buildSquarePaymentsLiveSmokeEra164Summary,
  formatSquarePaymentsLiveSmokeEra164ReportLines,
} from "../lib/integrations/square-payments-live-smoke-era164-smoke-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(
  summary: ReturnType<typeof buildSquarePaymentsLiveSmokeEra164Summary>,
): void {
  const path = join(process.cwd(), SQUARE_PAYMENTS_LIVE_SMOKE_ERA164_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(
    `\nSquare Payments LIVE integration (${SQUARE_PAYMENTS_LIVE_SMOKE_ERA164_POLICY_ID})\n`,
  );
  for (const [index, step] of SQUARE_PAYMENTS_LIVE_SMOKE_ERA164_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${SQUARE_PAYMENTS_LIVE_SMOKE_ERA164_OPS_DOC}\n`);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 164 Square Payments LIVE integration smoke

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
    `\n[${SQUARE_PAYMENTS_LIVE_SMOKE_ERA164_NPM_SCRIPT}] ${SQUARE_PAYMENTS_LIVE_SMOKE_ERA164_POLICY_ID}\n`,
  );
  console.log("\n→ npm run test:ci:square-payments-live-smoke-era164:cert\n");
  const certCode = runNpmScript("test:ci:square-payments-live-smoke-era164:cert");

  const wiring = auditSquarePaymentsLiveSmokeEra164Wiring(process.cwd());

  const summary = buildSquarePaymentsLiveSmokeEra164Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatSquarePaymentsLiveSmokeEra164ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${SQUARE_PAYMENTS_LIVE_SMOKE_ERA164_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
