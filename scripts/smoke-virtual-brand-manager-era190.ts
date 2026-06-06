/**
 * Era 190 Virtual Brand Manager orchestrator — Round 2 wiring cert.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  VIRTUAL_BRAND_MANAGER_ERA190_CYCLE_RUNBOOK_STEPS,
  VIRTUAL_BRAND_MANAGER_ERA190_NPM_SCRIPT,
  VIRTUAL_BRAND_MANAGER_ERA190_OPS_DOC,
  VIRTUAL_BRAND_MANAGER_ERA190_POLICY_ID,
  VIRTUAL_BRAND_MANAGER_ERA190_SUMMARY_ARTIFACT,
} from "../lib/enterprise/virtual-brand-manager-era190-policy";
import {
  auditVirtualBrandManagerSmokeEra190Wiring,
  buildVirtualBrandManagerSmokeEra190Summary,
  formatVirtualBrandManagerSmokeEra190ReportLines,
} from "../lib/enterprise/virtual-brand-manager-era190-smoke-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(
  summary: ReturnType<typeof buildVirtualBrandManagerSmokeEra190Summary>,
): void {
  const path = join(process.cwd(), VIRTUAL_BRAND_MANAGER_ERA190_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nVirtual Brand Manager (${VIRTUAL_BRAND_MANAGER_ERA190_POLICY_ID})\n`);
  for (const [index, step] of VIRTUAL_BRAND_MANAGER_ERA190_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${VIRTUAL_BRAND_MANAGER_ERA190_OPS_DOC}\n`);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 190 Virtual Brand Manager smoke

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
    `\n[${VIRTUAL_BRAND_MANAGER_ERA190_NPM_SCRIPT}] ${VIRTUAL_BRAND_MANAGER_ERA190_POLICY_ID}\n`,
  );
  console.log("\n→ npm run test:ci:virtual-brand-manager-era190:cert\n");
  const certCode = runNpmScript("test:ci:virtual-brand-manager-era190:cert");

  const wiring = auditVirtualBrandManagerSmokeEra190Wiring(process.cwd());

  const summary = buildVirtualBrandManagerSmokeEra190Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatVirtualBrandManagerSmokeEra190ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${VIRTUAL_BRAND_MANAGER_ERA190_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
