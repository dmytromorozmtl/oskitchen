/**
 * Era 95 Offline POS orchestrator — IndexedDB + PCI encryption + card capture + auto-sync wiring cert.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  POS_OFFLINE_QUEUE_ERA95_CYCLE_RUNBOOK_STEPS,
  POS_OFFLINE_QUEUE_ERA95_NPM_SCRIPT,
  POS_OFFLINE_QUEUE_ERA95_OPS_DOC,
  POS_OFFLINE_QUEUE_ERA95_POLICY_ID,
  POS_OFFLINE_QUEUE_ERA95_SUMMARY_ARTIFACT,
} from "../lib/pos/pos-offline-queue-era95-policy";
import {
  auditPosOfflineQueueSmokeWiring,
  buildPosOfflineQueueSmokeEra95Summary,
  formatPosOfflineQueueSmokeEra95ReportLines,
} from "../lib/pos/pos-offline-queue-smoke-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(
  summary: ReturnType<typeof buildPosOfflineQueueSmokeEra95Summary>,
): void {
  const path = join(process.cwd(), POS_OFFLINE_QUEUE_ERA95_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nOffline POS queue smoke (${POS_OFFLINE_QUEUE_ERA95_POLICY_ID})\n`);
  for (const [index, step] of POS_OFFLINE_QUEUE_ERA95_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${POS_OFFLINE_QUEUE_ERA95_OPS_DOC}\n`);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 95 Offline POS queue smoke

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
    `\n[${POS_OFFLINE_QUEUE_ERA95_NPM_SCRIPT}] ${POS_OFFLINE_QUEUE_ERA95_POLICY_ID}\n`,
  );
  console.log("\n→ npm run test:ci:pos-offline-queue-era95:cert\n");
  const certCode = runNpmScript("test:ci:pos-offline-queue-era95:cert");

  const wiring = auditPosOfflineQueueSmokeWiring(process.cwd());

  const summary = buildPosOfflineQueueSmokeEra95Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatPosOfflineQueueSmokeEra95ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${POS_OFFLINE_QUEUE_ERA95_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
