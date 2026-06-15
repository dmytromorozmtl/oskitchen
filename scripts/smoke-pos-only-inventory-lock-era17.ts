/**
 * Era 17 POS-only inventory lock recert smoke — cert chain + entrypoint scan artifact.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  POS_ONLY_INVENTORY_LOCK_ERA17_CYCLE_RUNBOOK_STEPS,
  POS_ONLY_INVENTORY_LOCK_ERA17_POLICY_ID,
  POS_ONLY_INVENTORY_LOCK_ERA17_SUMMARY_ARTIFACT,
} from "../lib/inventory/pos-only-inventory-lock-era17-policy";
import {
  buildPosOnlyInventoryLockSummary,
  formatPosOnlyInventoryLockReportLines,
} from "../lib/inventory/pos-only-inventory-lock-summary";

function hasFlag(name: string): boolean {
  return process.argv.includes(name);
}

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function printRunbook(): void {
  console.log(`\nPOS-only inventory lock (${POS_ONLY_INVENTORY_LOCK_ERA17_POLICY_ID})\n`);
  for (const [index, step] of POS_ONLY_INVENTORY_LOCK_ERA17_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log("\nSee docs/pos-only-inventory-lock-era17.md\n");
}

function main() {
  if (hasFlag("--help") || hasFlag("-h")) {
    console.log(`
Era 17 POS-only inventory lock recert smoke

  (default)         Run cert chain + entrypoint scan; write summary artifact
  --checklist-only  Print recert runbook steps
  --scan-only       Entrypoint scan without cert run
`);
    process.exit(0);
  }

  if (hasFlag("--checklist-only")) {
    printRunbook();
    process.exit(0);
  }

  console.log(`\n[smoke:pos-only-inventory-lock] ${POS_ONLY_INVENTORY_LOCK_ERA17_POLICY_ID}\n`);

  let certExitCode = 0;
  if (!hasFlag("--scan-only")) {
    certExitCode = runNpmScript("test:ci:pos-only-inventory-lock-era17:cert");
    if (certExitCode !== 0) {
      console.error("\nCert chain FAILED — fix before recording lock recert proof.\n");
      process.exit(certExitCode);
    }
  }

  const summary = buildPosOnlyInventoryLockSummary({
    certPassed: certExitCode === 0,
  });

  const artifactPath = join(process.cwd(), POS_ONLY_INVENTORY_LOCK_ERA17_SUMMARY_ARTIFACT);
  mkdirSync(dirname(artifactPath), { recursive: true });
  writeFileSync(artifactPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  for (const line of formatPosOnlyInventoryLockReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${POS_ONLY_INVENTORY_LOCK_ERA17_SUMMARY_ARTIFACT}\n`);

  if (summary.lockProofStatus === "proof_failed") {
    process.exit(1);
  }
}

main();
