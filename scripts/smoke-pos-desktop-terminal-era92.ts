/**
 * Era 92 Desktop POS orchestrator — keyboard shortcuts + multi-monitor wiring cert.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  POS_DESKTOP_TERMINAL_ERA92_CYCLE_RUNBOOK_STEPS,
  POS_DESKTOP_TERMINAL_ERA92_NPM_SCRIPT,
  POS_DESKTOP_TERMINAL_ERA92_OPS_DOC,
  POS_DESKTOP_TERMINAL_ERA92_POLICY_ID,
  POS_DESKTOP_TERMINAL_ERA92_SUMMARY_ARTIFACT,
} from "../lib/pos/pos-desktop-terminal-era92-policy";
import {
  auditPosDesktopTerminalSmokeWiring,
  buildPosDesktopTerminalSmokeEra92Summary,
  formatPosDesktopTerminalSmokeEra92ReportLines,
} from "../lib/pos/pos-desktop-terminal-smoke-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(
  summary: ReturnType<typeof buildPosDesktopTerminalSmokeEra92Summary>,
): void {
  const path = join(process.cwd(), POS_DESKTOP_TERMINAL_ERA92_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nDesktop POS terminal smoke (${POS_DESKTOP_TERMINAL_ERA92_POLICY_ID})\n`);
  for (const [index, step] of POS_DESKTOP_TERMINAL_ERA92_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${POS_DESKTOP_TERMINAL_ERA92_OPS_DOC}\n`);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 92 Desktop POS terminal smoke

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
    `\n[${POS_DESKTOP_TERMINAL_ERA92_NPM_SCRIPT}] ${POS_DESKTOP_TERMINAL_ERA92_POLICY_ID}\n`,
  );
  console.log("\n→ npm run test:ci:pos-desktop-terminal-era92:cert\n");
  const certCode = runNpmScript("test:ci:pos-desktop-terminal-era92:cert");

  const wiring = auditPosDesktopTerminalSmokeWiring(process.cwd());

  const summary = buildPosDesktopTerminalSmokeEra92Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatPosDesktopTerminalSmokeEra92ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${POS_DESKTOP_TERMINAL_ERA92_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
