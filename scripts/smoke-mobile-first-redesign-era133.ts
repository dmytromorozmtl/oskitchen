/**
 * Era 133 Mobile-First Redesign orchestrator — 375px / 44px / swipe wiring cert.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  MOBILE_FIRST_REDESIGN_ERA133_CYCLE_RUNBOOK_STEPS,
  MOBILE_FIRST_REDESIGN_ERA133_NPM_SCRIPT,
  MOBILE_FIRST_REDESIGN_ERA133_OPS_DOC,
  MOBILE_FIRST_REDESIGN_ERA133_POLICY_ID,
  MOBILE_FIRST_REDESIGN_ERA133_SUMMARY_ARTIFACT,
} from "../lib/design/mobile-first-redesign-era133-policy";
import {
  auditMobileFirstRedesignSmokeWiring,
  buildMobileFirstRedesignSmokeEra133Summary,
  formatMobileFirstRedesignSmokeEra133ReportLines,
} from "../lib/design/mobile-first-redesign-smoke-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(
  summary: ReturnType<typeof buildMobileFirstRedesignSmokeEra133Summary>,
): void {
  const path = join(process.cwd(), MOBILE_FIRST_REDESIGN_ERA133_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nMobile-First Redesign smoke (${MOBILE_FIRST_REDESIGN_ERA133_POLICY_ID})\n`);
  for (const [index, step] of MOBILE_FIRST_REDESIGN_ERA133_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${MOBILE_FIRST_REDESIGN_ERA133_OPS_DOC}\n`);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 133 Mobile-First Redesign smoke

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
    `\n[${MOBILE_FIRST_REDESIGN_ERA133_NPM_SCRIPT}] ${MOBILE_FIRST_REDESIGN_ERA133_POLICY_ID}\n`,
  );
  console.log("\n→ npm run test:ci:mobile-first-redesign-era133:cert\n");
  const certCode = runNpmScript("test:ci:mobile-first-redesign-era133:cert");

  const wiring = auditMobileFirstRedesignSmokeWiring(process.cwd());

  const summary = buildMobileFirstRedesignSmokeEra133Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatMobileFirstRedesignSmokeEra133ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${MOBILE_FIRST_REDESIGN_ERA133_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
