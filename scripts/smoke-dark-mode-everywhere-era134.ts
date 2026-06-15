/**
 * Era 134 Dark Mode Everywhere orchestrator — shell + roles + leadership wiring cert.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  DARK_MODE_EVERYWHERE_ERA134_CYCLE_RUNBOOK_STEPS,
  DARK_MODE_EVERYWHERE_ERA134_NPM_SCRIPT,
  DARK_MODE_EVERYWHERE_ERA134_OPS_DOC,
  DARK_MODE_EVERYWHERE_ERA134_POLICY_ID,
  DARK_MODE_EVERYWHERE_ERA134_SUMMARY_ARTIFACT,
} from "../lib/design/dark-mode-everywhere-era134-policy";
import {
  auditDarkModeEverywhereSmokeWiring,
  buildDarkModeEverywhereSmokeEra134Summary,
  formatDarkModeEverywhereSmokeEra134ReportLines,
} from "../lib/design/dark-mode-everywhere-smoke-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(
  summary: ReturnType<typeof buildDarkModeEverywhereSmokeEra134Summary>,
): void {
  const path = join(process.cwd(), DARK_MODE_EVERYWHERE_ERA134_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nDark Mode Everywhere smoke (${DARK_MODE_EVERYWHERE_ERA134_POLICY_ID})\n`);
  for (const [index, step] of DARK_MODE_EVERYWHERE_ERA134_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${DARK_MODE_EVERYWHERE_ERA134_OPS_DOC}\n`);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 134 Dark Mode Everywhere smoke

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
    `\n[${DARK_MODE_EVERYWHERE_ERA134_NPM_SCRIPT}] ${DARK_MODE_EVERYWHERE_ERA134_POLICY_ID}\n`,
  );
  console.log("\n→ npm run test:ci:dark-mode-everywhere-era134:cert\n");
  const certCode = runNpmScript("test:ci:dark-mode-everywhere-era134:cert");

  const wiring = auditDarkModeEverywhereSmokeWiring(process.cwd());

  const summary = buildDarkModeEverywhereSmokeEra134Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatDarkModeEverywhereSmokeEra134ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${DARK_MODE_EVERYWHERE_ERA134_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
