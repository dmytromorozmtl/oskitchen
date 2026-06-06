/**
 * Era 97 POS Hardware Compatibility orchestrator — doc ↔ catalog wiring cert.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  POS_HARDWARE_COMPATIBILITY_ERA97_CYCLE_RUNBOOK_STEPS,
  POS_HARDWARE_COMPATIBILITY_ERA97_NPM_SCRIPT,
  POS_HARDWARE_COMPATIBILITY_ERA97_OPS_DOC,
  POS_HARDWARE_COMPATIBILITY_ERA97_POLICY_ID,
  POS_HARDWARE_COMPATIBILITY_ERA97_SUMMARY_ARTIFACT,
} from "../lib/pos/pos-hardware-compatibility-era97-policy";
import {
  auditPosHardwareCompatibilitySmokeWiring,
  buildPosHardwareCompatibilitySmokeEra97Summary,
  formatPosHardwareCompatibilitySmokeEra97ReportLines,
} from "../lib/pos/pos-hardware-compatibility-smoke-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(
  summary: ReturnType<typeof buildPosHardwareCompatibilitySmokeEra97Summary>,
): void {
  const path = join(process.cwd(), POS_HARDWARE_COMPATIBILITY_ERA97_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nPOS Hardware Compatibility smoke (${POS_HARDWARE_COMPATIBILITY_ERA97_POLICY_ID})\n`);
  for (const [index, step] of POS_HARDWARE_COMPATIBILITY_ERA97_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${POS_HARDWARE_COMPATIBILITY_ERA97_OPS_DOC}\n`);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 97 POS Hardware Compatibility smoke

  (default)         Cert chain + doc/catalog wiring audit
  --checklist-only  Print activation runbook steps
`);
    process.exit(0);
  }

  if (process.argv.includes("--checklist-only")) {
    printRunbook();
    process.exit(0);
  }

  console.log(
    `\n[${POS_HARDWARE_COMPATIBILITY_ERA97_NPM_SCRIPT}] ${POS_HARDWARE_COMPATIBILITY_ERA97_POLICY_ID}\n`,
  );
  console.log("\n→ npm run test:ci:pos-hardware-compatibility-era97:cert\n");
  const certCode = runNpmScript("test:ci:pos-hardware-compatibility-era97:cert");

  const wiring = auditPosHardwareCompatibilitySmokeWiring(process.cwd());

  const summary = buildPosHardwareCompatibilitySmokeEra97Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatPosHardwareCompatibilitySmokeEra97ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${POS_HARDWARE_COMPATIBILITY_ERA97_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
