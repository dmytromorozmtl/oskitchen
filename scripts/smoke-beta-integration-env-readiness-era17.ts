/**
 * Era 17 BETA integration env readiness smoke — G2 platform vault audit.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  BETA_INTEGRATION_ENV_READINESS_SMOKE_ERA17_CYCLE_RUNBOOK_STEPS,
  BETA_INTEGRATION_ENV_READINESS_SMOKE_ERA17_NPM_SCRIPT,
  BETA_INTEGRATION_ENV_READINESS_SMOKE_ERA17_POLICY_ID,
  BETA_INTEGRATION_ENV_READINESS_SMOKE_ERA17_SUMMARY_ARTIFACT,
} from "../lib/integrations/beta-integration-env-readiness-smoke-era17-policy";
import {
  auditBetaIntegrationEnvReadiness,
  buildBetaIntegrationEnvReadinessSmokeSummary,
  formatBetaIntegrationEnvReadinessSmokeReportLines,
} from "../lib/integrations/beta-integration-env-readiness-smoke-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(
  summary: ReturnType<typeof buildBetaIntegrationEnvReadinessSmokeSummary>,
): void {
  const path = join(process.cwd(), BETA_INTEGRATION_ENV_READINESS_SMOKE_ERA17_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(
    `\nBETA integration env readiness smoke (${BETA_INTEGRATION_ENV_READINESS_SMOKE_ERA17_POLICY_ID})\n`,
  );
  for (const [index, step] of BETA_INTEGRATION_ENV_READINESS_SMOKE_ERA17_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log("\nSee docs/beta-integration-env-readiness-smoke.md\n");
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 17 BETA integration env readiness smoke

  (default)         Cert chain + env audit artifact
  --checklist-only  Print runbook steps

Env:
  BETA_ENV_STRICT=1  Fail when zero integrations are env-ready or optional-only
`);
    process.exit(0);
  }

  if (process.argv.includes("--checklist-only")) {
    printRunbook();
    process.exit(0);
  }

  const strictMode = process.env.BETA_ENV_STRICT === "1";

  console.log(
    `\n[${BETA_INTEGRATION_ENV_READINESS_SMOKE_ERA17_NPM_SCRIPT}] ${BETA_INTEGRATION_ENV_READINESS_SMOKE_ERA17_POLICY_ID}\n`,
  );
  console.log("\n→ npm run test:ci:beta-integration-env-readiness-era17:cert\n");
  const certCode = runNpmScript("test:ci:beta-integration-env-readiness-era17:cert");

  const cards = auditBetaIntegrationEnvReadiness(process.env);
  const summary = buildBetaIntegrationEnvReadinessSmokeSummary({
    certPassed: certCode === 0,
    cards,
    strictMode,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatBetaIntegrationEnvReadinessSmokeReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${BETA_INTEGRATION_ENV_READINESS_SMOKE_ERA17_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
