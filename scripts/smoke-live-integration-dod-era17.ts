/**
 * Era 17 LIVE integration DoD smoke — integrity + gate tracker artifact (DEV-55).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  LIVE_INTEGRATION_DOD_SMOKE_ERA17_CYCLE_RUNBOOK_STEPS,
  LIVE_INTEGRATION_DOD_SMOKE_ERA17_NPM_SCRIPT,
  LIVE_INTEGRATION_DOD_SMOKE_ERA17_POLICY_ID,
  LIVE_INTEGRATION_DOD_SMOKE_ERA17_SUMMARY_ARTIFACT,
} from "../lib/integrations/live-integration-dod-smoke-era17-policy";
import {
  buildLiveIntegrationDodSmokeSummary,
  formatLiveIntegrationDodSmokeReportLines,
} from "../lib/integrations/live-integration-dod-smoke-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(summary: ReturnType<typeof buildLiveIntegrationDodSmokeSummary>): void {
  const path = join(process.cwd(), LIVE_INTEGRATION_DOD_SMOKE_ERA17_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nLIVE integration DoD smoke (${LIVE_INTEGRATION_DOD_SMOKE_ERA17_POLICY_ID})\n`);
  for (const [index, step] of LIVE_INTEGRATION_DOD_SMOKE_ERA17_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log("\nSee docs/live-integration-dod-smoke.md\n");
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 17 LIVE integration DoD smoke

  (default)         DoD cert + integrity + gate tracker artifact
  --checklist-only  Print runbook steps
`);
    process.exit(0);
  }

  if (process.argv.includes("--checklist-only")) {
    printRunbook();
    process.exit(0);
  }

  console.log(
    `\n[${LIVE_INTEGRATION_DOD_SMOKE_ERA17_NPM_SCRIPT}] ${LIVE_INTEGRATION_DOD_SMOKE_ERA17_POLICY_ID}\n`,
  );
  console.log("\n→ npm run test:ci:live-integration-dod-era17:cert\n");
  const certCode = runNpmScript("test:ci:live-integration-dod-era17:cert");

  const summary = buildLiveIntegrationDodSmokeSummary({
    certPassed: certCode === 0,
    integrityCertPassed: certCode === 0,
    envCertPassed: certCode === 0,
    strictEnvMode: process.env.BETA_ENV_STRICT === "1",
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatLiveIntegrationDodSmokeReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${LIVE_INTEGRATION_DOD_SMOKE_ERA17_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
