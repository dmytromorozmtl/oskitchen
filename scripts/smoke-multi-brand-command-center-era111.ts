/**
 * Era 111 Multi-Brand Command Center orchestrator — lanes A–D + revenue wiring cert.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  MULTI_BRAND_COMMAND_CENTER_ERA111_CYCLE_RUNBOOK_STEPS,
  MULTI_BRAND_COMMAND_CENTER_ERA111_NPM_SCRIPT,
  MULTI_BRAND_COMMAND_CENTER_ERA111_OPS_DOC,
  MULTI_BRAND_COMMAND_CENTER_ERA111_POLICY_ID,
  MULTI_BRAND_COMMAND_CENTER_ERA111_SUMMARY_ARTIFACT,
} from "../lib/enterprise/multi-brand-command-center-era111-policy";
import {
  auditMultiBrandCommandCenterSmokeWiring,
  buildMultiBrandCommandCenterSmokeEra111Summary,
  formatMultiBrandCommandCenterSmokeEra111ReportLines,
} from "../lib/enterprise/multi-brand-command-center-smoke-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(
  summary: ReturnType<typeof buildMultiBrandCommandCenterSmokeEra111Summary>,
): void {
  const path = join(process.cwd(), MULTI_BRAND_COMMAND_CENTER_ERA111_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(
    `\nMulti-Brand Command Center smoke (${MULTI_BRAND_COMMAND_CENTER_ERA111_POLICY_ID})\n`,
  );
  for (const [index, step] of MULTI_BRAND_COMMAND_CENTER_ERA111_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${MULTI_BRAND_COMMAND_CENTER_ERA111_OPS_DOC}\n`);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 111 Multi-Brand Command Center smoke

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
    `\n[${MULTI_BRAND_COMMAND_CENTER_ERA111_NPM_SCRIPT}] ${MULTI_BRAND_COMMAND_CENTER_ERA111_POLICY_ID}\n`,
  );
  console.log("\n→ npm run test:ci:multi-brand-command-center-era111:cert\n");
  const certCode = runNpmScript("test:ci:multi-brand-command-center-era111:cert");

  const wiring = auditMultiBrandCommandCenterSmokeWiring(process.cwd());

  const summary = buildMultiBrandCommandCenterSmokeEra111Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatMultiBrandCommandCenterSmokeEra111ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${MULTI_BRAND_COMMAND_CENTER_ERA111_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
