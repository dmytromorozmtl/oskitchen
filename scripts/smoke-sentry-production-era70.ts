/**
 * Era 70 Sentry production smoke — wiring cert + DSN readiness artifact.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  SENTRY_PRODUCTION_ERA70_CYCLE_RUNBOOK_STEPS,
  SENTRY_PRODUCTION_ERA70_NPM_SCRIPT,
  SENTRY_PRODUCTION_ERA70_OPS_DOC,
  SENTRY_PRODUCTION_ERA70_POLICY_ID,
  SENTRY_PRODUCTION_ERA70_SUMMARY_ARTIFACT,
} from "../lib/observability/sentry-production-era70-policy";
import {
  auditSentryProductionWiring,
  buildSentryProductionSmokeSummary,
  formatSentryProductionSmokeReportLines,
} from "../lib/observability/sentry-production-summary";
import { loadProductionEnvLocal } from "./lib/load-dotenv-file";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(summary: ReturnType<typeof buildSentryProductionSmokeSummary>): void {
  const path = join(process.cwd(), SENTRY_PRODUCTION_ERA70_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nSentry production smoke (${SENTRY_PRODUCTION_ERA70_POLICY_ID})\n`);
  for (const [index, step] of SENTRY_PRODUCTION_ERA70_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${SENTRY_PRODUCTION_ERA70_OPS_DOC}\n`);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 70 Sentry production smoke

  (default)         Cert chain + wiring audit + DSN readiness artifact
  --checklist-only  Print activation runbook steps
`);
    process.exit(0);
  }

  if (process.argv.includes("--checklist-only")) {
    printRunbook();
    process.exit(0);
  }

  loadProductionEnvLocal();

  console.log(`\n[${SENTRY_PRODUCTION_ERA70_NPM_SCRIPT}] ${SENTRY_PRODUCTION_ERA70_POLICY_ID}\n`);
  console.log("\n→ npm run test:ci:sentry-production-era70:cert\n");
  const certCode = runNpmScript("test:ci:sentry-production-era70:cert");

  const wiring = auditSentryProductionWiring(process.cwd());
  const summary = buildSentryProductionSmokeSummary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatSentryProductionSmokeReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${SENTRY_PRODUCTION_ERA70_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
