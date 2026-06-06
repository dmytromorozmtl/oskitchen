/**
 * Era 163 Stripe LIVE integration orchestrator — PaymentIntent webhook payout wiring cert.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  STRIPE_LIVE_SMOKE_ERA163_CYCLE_RUNBOOK_STEPS,
  STRIPE_LIVE_SMOKE_ERA163_NPM_SCRIPT,
  STRIPE_LIVE_SMOKE_ERA163_OPS_DOC,
  STRIPE_LIVE_SMOKE_ERA163_POLICY_ID,
  STRIPE_LIVE_SMOKE_ERA163_SUMMARY_ARTIFACT,
} from "../lib/integrations/stripe-live-smoke-era163-policy";
import {
  auditStripeLiveSmokeEra163Wiring,
  buildStripeLiveSmokeEra163Summary,
  formatStripeLiveSmokeEra163ReportLines,
} from "../lib/integrations/stripe-live-smoke-era163-smoke-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(summary: ReturnType<typeof buildStripeLiveSmokeEra163Summary>): void {
  const path = join(process.cwd(), STRIPE_LIVE_SMOKE_ERA163_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nStripe LIVE integration (${STRIPE_LIVE_SMOKE_ERA163_POLICY_ID})\n`);
  for (const [index, step] of STRIPE_LIVE_SMOKE_ERA163_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${STRIPE_LIVE_SMOKE_ERA163_OPS_DOC}\n`);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 163 Stripe LIVE integration smoke

  (default)         Cert chain + wiring audit
  --checklist-only  Print activation runbook steps
`);
    process.exit(0);
  }

  if (process.argv.includes("--checklist-only")) {
    printRunbook();
    process.exit(0);
  }

  console.log(`\n[${STRIPE_LIVE_SMOKE_ERA163_NPM_SCRIPT}] ${STRIPE_LIVE_SMOKE_ERA163_POLICY_ID}\n`);
  console.log("\n→ npm run test:ci:stripe-live-smoke-era163:cert\n");
  const certCode = runNpmScript("test:ci:stripe-live-smoke-era163:cert");

  const wiring = auditStripeLiveSmokeEra163Wiring(process.cwd());

  const summary = buildStripeLiveSmokeEra163Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatStripeLiveSmokeEra163ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${STRIPE_LIVE_SMOKE_ERA163_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
