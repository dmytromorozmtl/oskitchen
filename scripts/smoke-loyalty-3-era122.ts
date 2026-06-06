/**
 * Era 122 Loyalty 3.0 orchestrator — cross-brand VIP events referrals wiring cert.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  LOYALTY_3_ERA122_CYCLE_RUNBOOK_STEPS,
  LOYALTY_3_ERA122_NPM_SCRIPT,
  LOYALTY_3_ERA122_OPS_DOC,
  LOYALTY_3_ERA122_POLICY_ID,
  LOYALTY_3_ERA122_SUMMARY_ARTIFACT,
} from "../lib/loyalty/loyalty-3-era122-policy";
import {
  auditLoyalty3SmokeWiring,
  buildLoyalty3SmokeEra122Summary,
  formatLoyalty3SmokeEra122ReportLines,
} from "../lib/loyalty/loyalty-3-smoke-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(
  summary: ReturnType<typeof buildLoyalty3SmokeEra122Summary>,
): void {
  const path = join(process.cwd(), LOYALTY_3_ERA122_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nLoyalty 3.0 smoke (${LOYALTY_3_ERA122_POLICY_ID})\n`);
  for (const [index, step] of LOYALTY_3_ERA122_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${LOYALTY_3_ERA122_OPS_DOC}\n`);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 122 Loyalty 3.0 smoke

  (default)         Cert chain + wiring audit
  --checklist-only  Print activation runbook steps
`);
    process.exit(0);
  }

  if (process.argv.includes("--checklist-only")) {
    printRunbook();
    process.exit(0);
  }

  console.log(`\n[${LOYALTY_3_ERA122_NPM_SCRIPT}] ${LOYALTY_3_ERA122_POLICY_ID}\n`);
  console.log("\n→ npm run test:ci:loyalty-3-era122:cert\n");
  const certCode = runNpmScript("test:ci:loyalty-3-era122:cert");

  const wiring = auditLoyalty3SmokeWiring(process.cwd());

  const summary = buildLoyalty3SmokeEra122Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatLoyalty3SmokeEra122ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${LOYALTY_3_ERA122_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
