/**
 * Era 17 pilot inventory messaging smoke — cert chain + training summary artifact.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  PILOT_INVENTORY_MESSAGING_ERA17_NPM_SCRIPT,
  PILOT_INVENTORY_MESSAGING_ERA17_POLICY_ID,
  PILOT_INVENTORY_MESSAGING_ERA17_SUMMARY_ARTIFACT,
  PILOT_INVENTORY_MESSAGING_ERA17_TRAINING_MODULES,
} from "../lib/inventory/pilot-inventory-messaging-era17-policy";
import {
  buildPilotInventoryMessagingSummary,
  formatPilotInventoryMessagingReportLines,
  parsePilotInventoryMessagingEnv,
} from "../lib/inventory/pilot-inventory-messaging-summary";

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

function main() {
  if (hasFlag("--help") || hasFlag("-h")) {
    console.log(`
Era 17 pilot inventory messaging smoke

  (default)         Run cert chain; write summary artifact
  --checklist-only  Print training module list
  --template-only   Write summary without cert run

Env:
  PILOT_INVENTORY_MESSAGING_ATTESTATION_EMAIL   Optional sales training attestation
`);
    process.exit(0);
  }

  if (hasFlag("--checklist-only")) {
    console.log(`\nPilot inventory messaging (${PILOT_INVENTORY_MESSAGING_ERA17_POLICY_ID})\n`);
    for (const [index, module] of PILOT_INVENTORY_MESSAGING_ERA17_TRAINING_MODULES.entries()) {
      console.log(`${index + 1}. ${module}`);
    }
    console.log("\nSee docs/pilot-inventory-messaging-era17.md\n");
    process.exit(0);
  }

  console.log(`\n[${PILOT_INVENTORY_MESSAGING_ERA17_NPM_SCRIPT}] ${PILOT_INVENTORY_MESSAGING_ERA17_POLICY_ID}\n`);

  let certExitCode = 0;
  if (!hasFlag("--template-only")) {
    certExitCode = runNpmScript("test:ci:pilot-inventory-messaging-era17:cert");
    if (certExitCode !== 0) {
      console.error("\nCert chain FAILED — fix before recording messaging proof.\n");
      process.exit(certExitCode);
    }
  }

  const summary = buildPilotInventoryMessagingSummary({
    ...parsePilotInventoryMessagingEnv(),
    certPassed: certExitCode === 0,
  });

  const artifactPath = join(process.cwd(), PILOT_INVENTORY_MESSAGING_ERA17_SUMMARY_ARTIFACT);
  mkdirSync(dirname(artifactPath), { recursive: true });
  writeFileSync(artifactPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  for (const line of formatPilotInventoryMessagingReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${PILOT_INVENTORY_MESSAGING_ERA17_SUMMARY_ARTIFACT}\n`);
}

main();
