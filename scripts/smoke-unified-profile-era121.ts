/**
 * Era 121 Unified Customer Profile orchestrator — CRM unified profile wiring cert.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  UNIFIED_PROFILE_ERA121_CYCLE_RUNBOOK_STEPS,
  UNIFIED_PROFILE_ERA121_NPM_SCRIPT,
  UNIFIED_PROFILE_ERA121_OPS_DOC,
  UNIFIED_PROFILE_ERA121_POLICY_ID,
  UNIFIED_PROFILE_ERA121_SUMMARY_ARTIFACT,
} from "../lib/crm/unified-profile-era121-policy";
import {
  auditUnifiedProfileSmokeWiring,
  buildUnifiedProfileSmokeEra121Summary,
  formatUnifiedProfileSmokeEra121ReportLines,
} from "../lib/crm/unified-profile-smoke-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(
  summary: ReturnType<typeof buildUnifiedProfileSmokeEra121Summary>,
): void {
  const path = join(process.cwd(), UNIFIED_PROFILE_ERA121_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nUnified Customer Profile smoke (${UNIFIED_PROFILE_ERA121_POLICY_ID})\n`);
  for (const [index, step] of UNIFIED_PROFILE_ERA121_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${UNIFIED_PROFILE_ERA121_OPS_DOC}\n`);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 121 Unified Customer Profile smoke

  (default)         Cert chain + wiring audit
  --checklist-only  Print activation runbook steps
`);
    process.exit(0);
  }

  if (process.argv.includes("--checklist-only")) {
    printRunbook();
    process.exit(0);
  }

  console.log(`\n[${UNIFIED_PROFILE_ERA121_NPM_SCRIPT}] ${UNIFIED_PROFILE_ERA121_POLICY_ID}\n`);
  console.log("\n→ npm run test:ci:unified-profile-era121:cert\n");
  const certCode = runNpmScript("test:ci:unified-profile-era121:cert");

  const wiring = auditUnifiedProfileSmokeWiring(process.cwd());

  const summary = buildUnifiedProfileSmokeEra121Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatUnifiedProfileSmokeEra121ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${UNIFIED_PROFILE_ERA121_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
