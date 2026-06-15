/**
 * Era 126 Data Export & Portability orchestrator — CSV + JSON manifest wiring cert.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  DATA_EXPORT_ERA126_CYCLE_RUNBOOK_STEPS,
  DATA_EXPORT_ERA126_NPM_SCRIPT,
  DATA_EXPORT_ERA126_OPS_DOC,
  DATA_EXPORT_ERA126_POLICY_ID,
  DATA_EXPORT_ERA126_SUMMARY_ARTIFACT,
} from "../lib/data/data-export-era126-policy";
import {
  auditDataExportSmokeWiring,
  buildDataExportSmokeEra126Summary,
  formatDataExportSmokeEra126ReportLines,
} from "../lib/data/data-export-smoke-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(
  summary: ReturnType<typeof buildDataExportSmokeEra126Summary>,
): void {
  const path = join(process.cwd(), DATA_EXPORT_ERA126_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nData Export & Portability smoke (${DATA_EXPORT_ERA126_POLICY_ID})\n`);
  for (const [index, step] of DATA_EXPORT_ERA126_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${DATA_EXPORT_ERA126_OPS_DOC}\n`);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 126 Data Export & Portability smoke

  (default)         Cert chain + wiring audit
  --checklist-only  Print activation runbook steps
`);
    process.exit(0);
  }

  if (process.argv.includes("--checklist-only")) {
    printRunbook();
    process.exit(0);
  }

  console.log(`\n[${DATA_EXPORT_ERA126_NPM_SCRIPT}] ${DATA_EXPORT_ERA126_POLICY_ID}\n`);
  console.log("\n→ npm run test:ci:data-export-era126:cert\n");
  const certCode = runNpmScript("test:ci:data-export-era126:cert");

  const wiring = auditDataExportSmokeWiring(process.cwd());

  const summary = buildDataExportSmokeEra126Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatDataExportSmokeEra126ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${DATA_EXPORT_ERA126_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
