/**
 * Era 161 Klaviyo LIVE integration orchestrator — API key campaign segment wiring cert.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  KLAVIYO_LIVE_SMOKE_ERA161_CYCLE_RUNBOOK_STEPS,
  KLAVIYO_LIVE_SMOKE_ERA161_NPM_SCRIPT,
  KLAVIYO_LIVE_SMOKE_ERA161_OPS_DOC,
  KLAVIYO_LIVE_SMOKE_ERA161_POLICY_ID,
  KLAVIYO_LIVE_SMOKE_ERA161_SUMMARY_ARTIFACT,
} from "../lib/integrations/klaviyo-live-smoke-era161-policy";
import {
  auditKlaviyoLiveSmokeEra161Wiring,
  buildKlaviyoLiveSmokeEra161Summary,
  formatKlaviyoLiveSmokeEra161ReportLines,
} from "../lib/integrations/klaviyo-live-smoke-era161-smoke-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(summary: ReturnType<typeof buildKlaviyoLiveSmokeEra161Summary>): void {
  const path = join(process.cwd(), KLAVIYO_LIVE_SMOKE_ERA161_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nKlaviyo LIVE integration (${KLAVIYO_LIVE_SMOKE_ERA161_POLICY_ID})\n`);
  for (const [index, step] of KLAVIYO_LIVE_SMOKE_ERA161_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${KLAVIYO_LIVE_SMOKE_ERA161_OPS_DOC}\n`);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 161 Klaviyo LIVE integration smoke

  (default)         Cert chain + wiring audit
  --checklist-only  Print activation runbook steps
`);
    process.exit(0);
  }

  if (process.argv.includes("--checklist-only")) {
    printRunbook();
    process.exit(0);
  }

  console.log(`\n[${KLAVIYO_LIVE_SMOKE_ERA161_NPM_SCRIPT}] ${KLAVIYO_LIVE_SMOKE_ERA161_POLICY_ID}\n`);
  console.log("\n→ npm run test:ci:klaviyo-live-smoke-era161:cert\n");
  const certCode = runNpmScript("test:ci:klaviyo-live-smoke-era161:cert");

  const wiring = auditKlaviyoLiveSmokeEra161Wiring(process.cwd());

  const summary = buildKlaviyoLiveSmokeEra161Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatKlaviyoLiveSmokeEra161ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${KLAVIYO_LIVE_SMOKE_ERA161_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
