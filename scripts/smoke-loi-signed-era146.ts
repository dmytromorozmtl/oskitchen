/**
 * Era 146 first design partner LOI signed orchestrator — signed record pilot gate wiring cert.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  LOI_SIGNED_ERA146_CYCLE_RUNBOOK_STEPS,
  LOI_SIGNED_ERA146_NPM_SCRIPT,
  LOI_SIGNED_ERA146_OPS_DOC,
  LOI_SIGNED_ERA146_POLICY_ID,
  LOI_SIGNED_ERA146_SUMMARY_ARTIFACT,
} from "../lib/commercial/loi-signed-era146-policy";
import {
  auditLoiSignedEra146Wiring,
  buildLoiSignedEra146Summary,
  formatLoiSignedEra146ReportLines,
} from "../lib/commercial/loi-signed-era146-smoke-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(summary: ReturnType<typeof buildLoiSignedEra146Summary>): void {
  const path = join(process.cwd(), LOI_SIGNED_ERA146_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nFirst design partner LOI signed (${LOI_SIGNED_ERA146_POLICY_ID})\n`);
  for (const [index, step] of LOI_SIGNED_ERA146_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${LOI_SIGNED_ERA146_OPS_DOC}\n`);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 146 first design partner LOI signed smoke

  (default)         Cert chain + wiring audit
  --checklist-only  Print activation runbook steps
`);
    process.exit(0);
  }

  if (process.argv.includes("--checklist-only")) {
    printRunbook();
    process.exit(0);
  }

  console.log(`\n[${LOI_SIGNED_ERA146_NPM_SCRIPT}] ${LOI_SIGNED_ERA146_POLICY_ID}\n`);
  console.log("\n→ npm run test:ci:loi-signed-era146:cert\n");
  const certCode = runNpmScript("test:ci:loi-signed-era146:cert");

  const wiring = auditLoiSignedEra146Wiring(process.cwd());

  const summary = buildLoiSignedEra146Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatLoiSignedEra146ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${LOI_SIGNED_ERA146_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
