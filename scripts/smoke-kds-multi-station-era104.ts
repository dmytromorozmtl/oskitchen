/**
 * Era 104 KDS Multi-Station orchestrator — 12-station registry + food-type routing cert.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  KDS_MULTI_STATION_ERA104_CYCLE_RUNBOOK_STEPS,
  KDS_MULTI_STATION_ERA104_NPM_SCRIPT,
  KDS_MULTI_STATION_ERA104_OPS_DOC,
  KDS_MULTI_STATION_ERA104_POLICY_ID,
  KDS_MULTI_STATION_ERA104_SUMMARY_ARTIFACT,
} from "../lib/kitchen/kds-multi-station-era104-policy";
import {
  auditKdsMultiStationSmokeWiring,
  buildKdsMultiStationSmokeEra104Summary,
  formatKdsMultiStationSmokeEra104ReportLines,
} from "../lib/kitchen/kds-multi-station-smoke-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(
  summary: ReturnType<typeof buildKdsMultiStationSmokeEra104Summary>,
): void {
  const path = join(process.cwd(), KDS_MULTI_STATION_ERA104_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nKDS Multi-Station smoke (${KDS_MULTI_STATION_ERA104_POLICY_ID})\n`);
  for (const [index, step] of KDS_MULTI_STATION_ERA104_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${KDS_MULTI_STATION_ERA104_OPS_DOC}\n`);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 104 KDS Multi-Station smoke

  (default)         Cert chain + wiring audit
  --checklist-only  Print activation runbook steps
`);
    process.exit(0);
  }

  if (process.argv.includes("--checklist-only")) {
    printRunbook();
    process.exit(0);
  }

  console.log(`\n[${KDS_MULTI_STATION_ERA104_NPM_SCRIPT}] ${KDS_MULTI_STATION_ERA104_POLICY_ID}\n`);
  console.log("\n→ npm run test:ci:kds-multi-station-era104:cert\n");
  const certCode = runNpmScript("test:ci:kds-multi-station-era104:cert");

  const wiring = auditKdsMultiStationSmokeWiring(process.cwd());

  const summary = buildKdsMultiStationSmokeEra104Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatKdsMultiStationSmokeEra104ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${KDS_MULTI_STATION_ERA104_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
