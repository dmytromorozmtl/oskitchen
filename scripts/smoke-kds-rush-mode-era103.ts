/**
 * Era 103 KDS Rush Mode orchestrator — peak detection + routing + sound wiring cert.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  KDS_RUSH_MODE_ERA103_CYCLE_RUNBOOK_STEPS,
  KDS_RUSH_MODE_ERA103_NPM_SCRIPT,
  KDS_RUSH_MODE_ERA103_OPS_DOC,
  KDS_RUSH_MODE_ERA103_POLICY_ID,
  KDS_RUSH_MODE_ERA103_SUMMARY_ARTIFACT,
} from "../lib/kitchen/kds-rush-mode-era103-policy";
import {
  auditKdsRushModeSmokeWiring,
  buildKdsRushModeSmokeEra103Summary,
  formatKdsRushModeSmokeEra103ReportLines,
} from "../lib/kitchen/kds-rush-mode-smoke-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(
  summary: ReturnType<typeof buildKdsRushModeSmokeEra103Summary>,
): void {
  const path = join(process.cwd(), KDS_RUSH_MODE_ERA103_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nKDS Rush Mode smoke (${KDS_RUSH_MODE_ERA103_POLICY_ID})\n`);
  for (const [index, step] of KDS_RUSH_MODE_ERA103_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${KDS_RUSH_MODE_ERA103_OPS_DOC}\n`);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 103 KDS Rush Mode smoke

  (default)         Cert chain + wiring audit
  --checklist-only  Print activation runbook steps
`);
    process.exit(0);
  }

  if (process.argv.includes("--checklist-only")) {
    printRunbook();
    process.exit(0);
  }

  console.log(`\n[${KDS_RUSH_MODE_ERA103_NPM_SCRIPT}] ${KDS_RUSH_MODE_ERA103_POLICY_ID}\n`);
  console.log("\n→ npm run test:ci:kds-rush-mode-era103:cert\n");
  const certCode = runNpmScript("test:ci:kds-rush-mode-era103:cert");

  const wiring = auditKdsRushModeSmokeWiring(process.cwd());

  const summary = buildKdsRushModeSmokeEra103Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatKdsRushModeSmokeEra103ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${KDS_RUSH_MODE_ERA103_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
