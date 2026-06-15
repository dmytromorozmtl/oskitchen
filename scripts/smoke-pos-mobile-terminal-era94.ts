/**
 * Era 94 Mobile POS orchestrator — swipe gestures + one-hand checkout wiring cert.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  POS_MOBILE_TERMINAL_ERA94_CYCLE_RUNBOOK_STEPS,
  POS_MOBILE_TERMINAL_ERA94_NPM_SCRIPT,
  POS_MOBILE_TERMINAL_ERA94_OPS_DOC,
  POS_MOBILE_TERMINAL_ERA94_POLICY_ID,
  POS_MOBILE_TERMINAL_ERA94_SUMMARY_ARTIFACT,
} from "../lib/pos/pos-mobile-terminal-era94-policy";
import {
  auditPosMobileTerminalSmokeWiring,
  buildPosMobileTerminalSmokeEra94Summary,
  formatPosMobileTerminalSmokeEra94ReportLines,
} from "../lib/pos/pos-mobile-terminal-smoke-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(
  summary: ReturnType<typeof buildPosMobileTerminalSmokeEra94Summary>,
): void {
  const path = join(process.cwd(), POS_MOBILE_TERMINAL_ERA94_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nMobile POS terminal smoke (${POS_MOBILE_TERMINAL_ERA94_POLICY_ID})\n`);
  for (const [index, step] of POS_MOBILE_TERMINAL_ERA94_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${POS_MOBILE_TERMINAL_ERA94_OPS_DOC}\n`);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 94 Mobile POS terminal smoke

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
    `\n[${POS_MOBILE_TERMINAL_ERA94_NPM_SCRIPT}] ${POS_MOBILE_TERMINAL_ERA94_POLICY_ID}\n`,
  );
  console.log("\n→ npm run test:ci:pos-mobile-terminal-era94:cert\n");
  const certCode = runNpmScript("test:ci:pos-mobile-terminal-era94:cert");

  const wiring = auditPosMobileTerminalSmokeWiring(process.cwd());

  const summary = buildPosMobileTerminalSmokeEra94Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatPosMobileTerminalSmokeEra94ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${POS_MOBILE_TERMINAL_ERA94_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
