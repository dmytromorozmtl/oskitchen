/**
 * Era 196 Unified Customer Profile orchestrator — Round 2 wiring cert.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  UNIFIED_PROFILE_ERA196_CYCLE_RUNBOOK_STEPS,
  UNIFIED_PROFILE_ERA196_NPM_SCRIPT,
  UNIFIED_PROFILE_ERA196_OPS_DOC,
  UNIFIED_PROFILE_ERA196_POLICY_ID,
  UNIFIED_PROFILE_ERA196_SUMMARY_ARTIFACT,
} from "../lib/crm/unified-profile-era196-policy";
import {
  auditUnifiedProfileSmokeEra196Wiring,
  buildUnifiedProfileSmokeEra196Summary,
  formatUnifiedProfileSmokeEra196ReportLines,
} from "../lib/crm/unified-profile-era196-smoke-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(
  summary: ReturnType<typeof buildUnifiedProfileSmokeEra196Summary>,
): void {
  const path = join(process.cwd(), UNIFIED_PROFILE_ERA196_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nUnified Customer Profile (${UNIFIED_PROFILE_ERA196_POLICY_ID})\n`);
  for (const [index, step] of UNIFIED_PROFILE_ERA196_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${UNIFIED_PROFILE_ERA196_OPS_DOC}\n`);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 196 Unified Customer Profile smoke

  (default)         Cert chain + wiring audit
  --checklist-only  Print activation runbook steps
`);
    process.exit(0);
  }

  if (process.argv.includes("--checklist-only")) {
    printRunbook();
    process.exit(0);
  }

  console.log(`\n[${UNIFIED_PROFILE_ERA196_NPM_SCRIPT}] ${UNIFIED_PROFILE_ERA196_POLICY_ID}\n`);
  console.log("\n→ npm run test:ci:unified-profile-era196:cert\n");
  const certCode = runNpmScript("test:ci:unified-profile-era196:cert");

  const wiring = auditUnifiedProfileSmokeEra196Wiring(process.cwd());

  const summary = buildUnifiedProfileSmokeEra196Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatUnifiedProfileSmokeEra196ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${UNIFIED_PROFILE_ERA196_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
