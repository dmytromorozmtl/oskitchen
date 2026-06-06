/**
 * Era 168 Tablet POS orchestrator — 44px targets + portrait/landscape Round 2 wiring cert.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  POS_TABLET_TERMINAL_ERA168_CYCLE_RUNBOOK_STEPS,
  POS_TABLET_TERMINAL_ERA168_NPM_SCRIPT,
  POS_TABLET_TERMINAL_ERA168_OPS_DOC,
  POS_TABLET_TERMINAL_ERA168_POLICY_ID,
  POS_TABLET_TERMINAL_ERA168_SUMMARY_ARTIFACT,
} from "../lib/pos/pos-tablet-terminal-era168-policy";
import {
  auditPosTabletTerminalSmokeEra168Wiring,
  buildPosTabletTerminalSmokeEra168Summary,
  formatPosTabletTerminalSmokeEra168ReportLines,
} from "../lib/pos/pos-tablet-terminal-era168-smoke-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(
  summary: ReturnType<typeof buildPosTabletTerminalSmokeEra168Summary>,
): void {
  const path = join(process.cwd(), POS_TABLET_TERMINAL_ERA168_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nTablet POS terminal (${POS_TABLET_TERMINAL_ERA168_POLICY_ID})\n`);
  for (const [index, step] of POS_TABLET_TERMINAL_ERA168_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${POS_TABLET_TERMINAL_ERA168_OPS_DOC}\n`);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 168 Tablet POS terminal smoke

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
    `\n[${POS_TABLET_TERMINAL_ERA168_NPM_SCRIPT}] ${POS_TABLET_TERMINAL_ERA168_POLICY_ID}\n`,
  );
  console.log("\n→ npm run test:ci:pos-tablet-terminal-era168:cert\n");
  const certCode = runNpmScript("test:ci:pos-tablet-terminal-era168:cert");

  const wiring = auditPosTabletTerminalSmokeEra168Wiring(process.cwd());

  const summary = buildPosTabletTerminalSmokeEra168Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatPosTabletTerminalSmokeEra168ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${POS_TABLET_TERMINAL_ERA168_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
