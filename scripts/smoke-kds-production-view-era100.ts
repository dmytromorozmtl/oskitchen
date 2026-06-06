/**
 * Era 100 KDS Production View orchestrator — station load + bottleneck wiring cert.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  KDS_PRODUCTION_VIEW_ERA100_CYCLE_RUNBOOK_STEPS,
  KDS_PRODUCTION_VIEW_ERA100_NPM_SCRIPT,
  KDS_PRODUCTION_VIEW_ERA100_OPS_DOC,
  KDS_PRODUCTION_VIEW_ERA100_POLICY_ID,
  KDS_PRODUCTION_VIEW_ERA100_SUMMARY_ARTIFACT,
} from "../lib/kitchen/kds-production-view-era100-policy";
import {
  auditKdsProductionViewSmokeWiring,
  buildKdsProductionViewSmokeEra100Summary,
  formatKdsProductionViewSmokeEra100ReportLines,
} from "../lib/kitchen/kds-production-view-smoke-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(
  summary: ReturnType<typeof buildKdsProductionViewSmokeEra100Summary>,
): void {
  const path = join(process.cwd(), KDS_PRODUCTION_VIEW_ERA100_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nKDS Production View smoke (${KDS_PRODUCTION_VIEW_ERA100_POLICY_ID})\n`);
  for (const [index, step] of KDS_PRODUCTION_VIEW_ERA100_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${KDS_PRODUCTION_VIEW_ERA100_OPS_DOC}\n`);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 100 KDS Production View smoke

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
    `\n[${KDS_PRODUCTION_VIEW_ERA100_NPM_SCRIPT}] ${KDS_PRODUCTION_VIEW_ERA100_POLICY_ID}\n`,
  );
  console.log("\n→ npm run test:ci:kds-production-view-era100:cert\n");
  const certCode = runNpmScript("test:ci:kds-production-view-era100:cert");

  const wiring = auditKdsProductionViewSmokeWiring(process.cwd());

  const summary = buildKdsProductionViewSmokeEra100Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatKdsProductionViewSmokeEra100ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${KDS_PRODUCTION_VIEW_ERA100_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
