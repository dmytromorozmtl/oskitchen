/**
 * Era 17 unified BETA integrations integrity smoke — registry + env bundle (DEV-52).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  BETA_INTEGRATIONS_INTEGRITY_SMOKE_ERA17_CYCLE_RUNBOOK_STEPS,
  BETA_INTEGRATIONS_INTEGRITY_SMOKE_ERA17_NPM_SCRIPT,
  BETA_INTEGRATIONS_INTEGRITY_SMOKE_ERA17_POLICY_ID,
  BETA_INTEGRATIONS_INTEGRITY_SMOKE_ERA17_SUMMARY_ARTIFACT,
} from "../lib/integrations/beta-integrations-integrity-smoke-era17-policy";
import {
  buildBetaIntegrationsIntegritySmokeSummary,
  formatBetaIntegrationsIntegritySmokeReportLines,
} from "../lib/integrations/beta-integrations-integrity-smoke-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(
  summary: ReturnType<typeof buildBetaIntegrationsIntegritySmokeSummary>,
): void {
  const path = join(process.cwd(), BETA_INTEGRATIONS_INTEGRITY_SMOKE_ERA17_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(
    `\nBETA integrations integrity smoke (${BETA_INTEGRATIONS_INTEGRITY_SMOKE_ERA17_POLICY_ID})\n`,
  );
  for (const [index, step] of BETA_INTEGRATIONS_INTEGRITY_SMOKE_ERA17_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log("\nSee docs/beta-integrations-integrity-smoke.md\n");
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 17 unified BETA integrations integrity smoke

  (default)         Registry + env cert chain + combined artifact
  --checklist-only  Print runbook steps

Env:
  BETA_ENV_STRICT=1  Propagate strict env gate to env sub-audit
`);
    process.exit(0);
  }

  if (process.argv.includes("--checklist-only")) {
    printRunbook();
    process.exit(0);
  }

  const strictEnvMode = process.env.BETA_ENV_STRICT === "1";

  console.log(
    `\n[${BETA_INTEGRATIONS_INTEGRITY_SMOKE_ERA17_NPM_SCRIPT}] ${BETA_INTEGRATIONS_INTEGRITY_SMOKE_ERA17_POLICY_ID}\n`,
  );
  console.log("\n→ npm run test:ci:beta-integrations-registry-era17:cert\n");
  const registryCertCode = runNpmScript("test:ci:beta-integrations-registry-era17:cert");
  console.log("\n→ npm run test:ci:beta-integration-env-readiness-era17:cert\n");
  const envCertCode = runNpmScript("test:ci:beta-integration-env-readiness-era17:cert");

  const summary = buildBetaIntegrationsIntegritySmokeSummary({
    registryCertPassed: registryCertCode === 0,
    envCertPassed: envCertCode === 0,
    strictEnvMode,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatBetaIntegrationsIntegritySmokeReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${BETA_INTEGRATIONS_INTEGRITY_SMOKE_ERA17_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
