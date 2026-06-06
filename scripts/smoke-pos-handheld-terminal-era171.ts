/**
 * Era 171 Handheld POS orchestrator — table → order → KDS Round 2 wiring cert.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  POS_HANDHELD_TERMINAL_ERA171_CYCLE_RUNBOOK_STEPS,
  POS_HANDHELD_TERMINAL_ERA171_NPM_SCRIPT,
  POS_HANDHELD_TERMINAL_ERA171_OPS_DOC,
  POS_HANDHELD_TERMINAL_ERA171_POLICY_ID,
  POS_HANDHELD_TERMINAL_ERA171_SUMMARY_ARTIFACT,
} from "../lib/pos/pos-handheld-terminal-era171-policy";
import {
  auditPosHandheldTerminalSmokeEra171Wiring,
  buildPosHandheldTerminalSmokeEra171Summary,
  formatPosHandheldTerminalSmokeEra171ReportLines,
} from "../lib/pos/pos-handheld-terminal-era171-smoke-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(
  summary: ReturnType<typeof buildPosHandheldTerminalSmokeEra171Summary>,
): void {
  const path = join(process.cwd(), POS_HANDHELD_TERMINAL_ERA171_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nHandheld POS terminal (${POS_HANDHELD_TERMINAL_ERA171_POLICY_ID})\n`);
  for (const [index, step] of POS_HANDHELD_TERMINAL_ERA171_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${POS_HANDHELD_TERMINAL_ERA171_OPS_DOC}\n`);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 171 Handheld POS terminal smoke

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
    `\n[${POS_HANDHELD_TERMINAL_ERA171_NPM_SCRIPT}] ${POS_HANDHELD_TERMINAL_ERA171_POLICY_ID}\n`,
  );
  console.log("\n→ npm run test:ci:pos-handheld-terminal-era171:cert\n");
  const certCode = runNpmScript("test:ci:pos-handheld-terminal-era171:cert");

  const wiring = auditPosHandheldTerminalSmokeEra171Wiring(process.cwd());

  const summary = buildPosHandheldTerminalSmokeEra171Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatPosHandheldTerminalSmokeEra171ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${POS_HANDHELD_TERMINAL_ERA171_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
