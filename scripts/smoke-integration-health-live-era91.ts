/**
 * Era 91 Integration Health LIVE smoke orchestrator — fleet cert all 18 LIVE integrations.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  INTEGRATION_HEALTH_LIVE_SMOKE_ERA91_CYCLE_RUNBOOK_STEPS,
  INTEGRATION_HEALTH_LIVE_SMOKE_ERA91_NPM_SCRIPT,
  INTEGRATION_HEALTH_LIVE_SMOKE_ERA91_OPS_DOC,
  INTEGRATION_HEALTH_LIVE_SMOKE_ERA91_POLICY_ID,
  INTEGRATION_HEALTH_LIVE_SMOKE_ERA91_PROVIDER_CERTS,
  INTEGRATION_HEALTH_LIVE_SMOKE_ERA91_SUMMARY_ARTIFACT,
} from "../lib/integrations/integration-health-live-smoke-era91-policy";
import {
  auditIntegrationHealthLiveSmokeWiring,
  buildIntegrationHealthLiveSmokeEra91Summary,
  formatIntegrationHealthLiveSmokeEra91ReportLines,
  type IntegrationHealthLiveSmokeEra91ProviderResult,
} from "../lib/integrations/integration-health-live-smoke-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(
  summary: ReturnType<typeof buildIntegrationHealthLiveSmokeEra91Summary>,
): void {
  const path = join(process.cwd(), INTEGRATION_HEALTH_LIVE_SMOKE_ERA91_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(
    `\nIntegration Health LIVE smoke (${INTEGRATION_HEALTH_LIVE_SMOKE_ERA91_POLICY_ID})\n`,
  );
  for (const [index, step] of INTEGRATION_HEALTH_LIVE_SMOKE_ERA91_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${INTEGRATION_HEALTH_LIVE_SMOKE_ERA91_OPS_DOC}\n`);
}

function runFleetProviderCerts(): IntegrationHealthLiveSmokeEra91ProviderResult[] {
  const results: IntegrationHealthLiveSmokeEra91ProviderResult[] = [];

  for (const provider of INTEGRATION_HEALTH_LIVE_SMOKE_ERA91_PROVIDER_CERTS) {
    console.log(`\n→ npm run ${provider.certScript} (${provider.name})\n`);
    const code = runNpmScript(provider.certScript);
    results.push({
      integrationId: provider.integrationId,
      name: provider.name,
      era: provider.era,
      certScript: provider.certScript,
      status: code === 0 ? "PASSED" : "FAILED",
      reason: code === 0 ? "wiring cert PASSED" : `exit code ${code}`,
    });
  }

  return results;
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 91 Integration Health LIVE smoke — fleet cert

  (default)         Era91 cert + wiring audit + all 17 provider :cert scripts
  --checklist-only  Print activation runbook steps
  --wiring-only     Skip fleet provider cert runs (era91 cert + wiring audit only)
`);
    process.exit(0);
  }

  if (process.argv.includes("--checklist-only")) {
    printRunbook();
    process.exit(0);
  }

  console.log(
    `\n[${INTEGRATION_HEALTH_LIVE_SMOKE_ERA91_NPM_SCRIPT}] ${INTEGRATION_HEALTH_LIVE_SMOKE_ERA91_POLICY_ID}\n`,
  );
  console.log("\n→ npm run test:ci:integration-health-live-smoke-era91:cert\n");
  const certCode = runNpmScript("test:ci:integration-health-live-smoke-era91:cert");

  const wiring = auditIntegrationHealthLiveSmokeWiring(process.cwd());
  const wiringOnly = process.argv.includes("--wiring-only");

  const providerResults = wiringOnly ? [] : runFleetProviderCerts();

  const summary = buildIntegrationHealthLiveSmokeEra91Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    providerResults,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatIntegrationHealthLiveSmokeEra91ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${INTEGRATION_HEALTH_LIVE_SMOKE_ERA91_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
