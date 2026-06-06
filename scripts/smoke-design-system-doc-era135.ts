/**
 * Era 135 Design System doc orchestrator — canonical doc wiring cert.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  DESIGN_SYSTEM_DOC_ERA135_CYCLE_RUNBOOK_STEPS,
  DESIGN_SYSTEM_DOC_ERA135_NPM_SCRIPT,
  DESIGN_SYSTEM_DOC_ERA135_OPS_DOC,
  DESIGN_SYSTEM_DOC_ERA135_POLICY_ID,
  DESIGN_SYSTEM_DOC_ERA135_SUMMARY_ARTIFACT,
} from "../lib/design/design-system-doc-era135-policy";
import {
  auditDesignSystemDocSmokeWiring,
  buildDesignSystemDocSmokeEra135Summary,
  formatDesignSystemDocSmokeEra135ReportLines,
} from "../lib/design/design-system-doc-smoke-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(
  summary: ReturnType<typeof buildDesignSystemDocSmokeEra135Summary>,
): void {
  const path = join(process.cwd(), DESIGN_SYSTEM_DOC_ERA135_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nDesign System doc smoke (${DESIGN_SYSTEM_DOC_ERA135_POLICY_ID})\n`);
  for (const [index, step] of DESIGN_SYSTEM_DOC_ERA135_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${DESIGN_SYSTEM_DOC_ERA135_OPS_DOC}\n`);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 135 Design System doc smoke

  (default)         Cert chain + wiring audit
  --checklist-only  Print activation runbook steps
`);
    process.exit(0);
  }

  if (process.argv.includes("--checklist-only")) {
    printRunbook();
    process.exit(0);
  }

  console.log(`\n[${DESIGN_SYSTEM_DOC_ERA135_NPM_SCRIPT}] ${DESIGN_SYSTEM_DOC_ERA135_POLICY_ID}\n`);
  console.log("\n→ npm run test:ci:design-system-doc-era135:cert\n");
  const certCode = runNpmScript("test:ci:design-system-doc-era135:cert");

  const wiring = auditDesignSystemDocSmokeWiring(process.cwd());

  const summary = buildDesignSystemDocSmokeEra135Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatDesignSystemDocSmokeEra135ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${DESIGN_SYSTEM_DOC_ERA135_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
