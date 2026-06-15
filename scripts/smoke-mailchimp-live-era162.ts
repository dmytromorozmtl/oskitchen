/**
 * Era 162 Mailchimp LIVE integration orchestrator — OAuth email list campaign wiring cert.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  MAILCHIMP_LIVE_SMOKE_ERA162_CYCLE_RUNBOOK_STEPS,
  MAILCHIMP_LIVE_SMOKE_ERA162_NPM_SCRIPT,
  MAILCHIMP_LIVE_SMOKE_ERA162_OPS_DOC,
  MAILCHIMP_LIVE_SMOKE_ERA162_POLICY_ID,
  MAILCHIMP_LIVE_SMOKE_ERA162_SUMMARY_ARTIFACT,
} from "../lib/integrations/mailchimp-live-smoke-era162-policy";
import {
  auditMailchimpLiveSmokeEra162Wiring,
  buildMailchimpLiveSmokeEra162Summary,
  formatMailchimpLiveSmokeEra162ReportLines,
} from "../lib/integrations/mailchimp-live-smoke-era162-smoke-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(
  summary: ReturnType<typeof buildMailchimpLiveSmokeEra162Summary>,
): void {
  const path = join(process.cwd(), MAILCHIMP_LIVE_SMOKE_ERA162_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nMailchimp LIVE integration (${MAILCHIMP_LIVE_SMOKE_ERA162_POLICY_ID})\n`);
  for (const [index, step] of MAILCHIMP_LIVE_SMOKE_ERA162_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${MAILCHIMP_LIVE_SMOKE_ERA162_OPS_DOC}\n`);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 162 Mailchimp LIVE integration smoke

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
    `\n[${MAILCHIMP_LIVE_SMOKE_ERA162_NPM_SCRIPT}] ${MAILCHIMP_LIVE_SMOKE_ERA162_POLICY_ID}\n`,
  );
  console.log("\n→ npm run test:ci:mailchimp-live-smoke-era162:cert\n");
  const certCode = runNpmScript("test:ci:mailchimp-live-smoke-era162:cert");

  const wiring = auditMailchimpLiveSmokeEra162Wiring(process.cwd());

  const summary = buildMailchimpLiveSmokeEra162Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatMailchimpLiveSmokeEra162ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${MAILCHIMP_LIVE_SMOKE_ERA162_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
