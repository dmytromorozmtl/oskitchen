/**
 * Era 17 BETA integrations registry smoke — scaffold integrity after DEV-48.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  BETA_INTEGRATIONS_REGISTRY_SMOKE_ERA17_CYCLE_RUNBOOK_STEPS,
  BETA_INTEGRATIONS_REGISTRY_SMOKE_ERA17_NPM_SCRIPT,
  BETA_INTEGRATIONS_REGISTRY_SMOKE_ERA17_POLICY_ID,
  BETA_INTEGRATIONS_REGISTRY_SMOKE_ERA17_SUMMARY_ARTIFACT,
} from "../lib/integrations/beta-integrations-registry-smoke-era17-policy";
import {
  auditBetaIntegrationsRegistryScaffold,
  buildBetaIntegrationsRegistrySmokeSummary,
  formatBetaIntegrationsRegistrySmokeReportLines,
} from "../lib/integrations/beta-integrations-registry-smoke-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(
  summary: ReturnType<typeof buildBetaIntegrationsRegistrySmokeSummary>,
): void {
  const path = join(process.cwd(), BETA_INTEGRATIONS_REGISTRY_SMOKE_ERA17_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nBETA integrations registry smoke (${BETA_INTEGRATIONS_REGISTRY_SMOKE_ERA17_POLICY_ID})\n`);
  for (const [index, step] of BETA_INTEGRATIONS_REGISTRY_SMOKE_ERA17_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log("\nSee docs/beta-integrations-registry-smoke.md\n");
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 17 BETA integrations registry smoke

  (default)         Cert chain + scaffold audit artifact
  --checklist-only  Print runbook steps
`);
    process.exit(0);
  }

  if (process.argv.includes("--checklist-only")) {
    printRunbook();
    process.exit(0);
  }

  console.log(
    `\n[${BETA_INTEGRATIONS_REGISTRY_SMOKE_ERA17_NPM_SCRIPT}] ${BETA_INTEGRATIONS_REGISTRY_SMOKE_ERA17_POLICY_ID}\n`,
  );
  console.log("\n→ npm run test:ci:beta-integrations-registry-era17:cert\n");
  const certCode = runNpmScript("test:ci:beta-integrations-registry-era17:cert");

  const audit = auditBetaIntegrationsRegistryScaffold(process.cwd());
  const summary = buildBetaIntegrationsRegistrySmokeSummary({
    certPassed: certCode === 0,
    scaffoldFailures: audit.scaffoldFailures,
    registryBetaCount: audit.registryBetaCount,
    placeholderCount: audit.placeholderCount,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatBetaIntegrationsRegistrySmokeReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${BETA_INTEGRATIONS_REGISTRY_SMOKE_ERA17_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
