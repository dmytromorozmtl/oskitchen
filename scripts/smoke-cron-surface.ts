/**
 * Cron surface honesty smoke (local / pre-release).
 *
 * Runs wired Vitest cron hygiene certs — does not invoke live cron HTTP endpoints.
 */
import { spawnSync } from "node:child_process";

import {
  CRON_SURFACE_ERA14_AUDIT_CHECKLIST,
  CRON_SURFACE_ERA14_POLICY_ID,
  CRON_SURFACE_ERA14_VALIDATION_SCRIPTS,
} from "../lib/cron/cron-surface-era14-policy";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function printChecklist(): void {
  console.log(`\nCron surface honesty (${CRON_SURFACE_ERA14_POLICY_ID})\n`);
  for (const [index, step] of CRON_SURFACE_ERA14_AUDIT_CHECKLIST.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log("\nValidators:", CRON_SURFACE_ERA14_VALIDATION_SCRIPTS.join(", "));
  console.log("\nSee docs/cron-surface-honesty-checklist.md\n");
}

async function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Cron surface honesty smoke

  (default)         Run test:ci:cron-hygiene:cert + era14 cert
  --checklist-only  Print audit checklist only
  --validators      Also run validate:production-crons + validate:cron-inventory
`);
    process.exit(0);
  }

  if (process.argv.includes("--checklist-only")) {
    printChecklist();
    process.exit(0);
  }

  console.log(`\n[smoke:cron-surface] ${CRON_SURFACE_ERA14_POLICY_ID}\n`);

  const codes = [
    runNpmScript("test:ci:cron-hygiene:cert"),
    runNpmScript("test:ci:cron-hygiene-era14:cert"),
  ];

  if (process.argv.includes("--validators")) {
    for (const script of CRON_SURFACE_ERA14_VALIDATION_SCRIPTS) {
      if (script === "cron:archive:status") continue;
      codes.push(runNpmScript(script));
    }
  }

  printChecklist();

  const failed = codes.find((c) => c !== 0);
  if (failed !== undefined) {
    console.error("\n[smoke:cron-surface] FAILED — fix cron certs/validators before release claims.\n");
    process.exit(failed);
  }

  console.log(
    "\n[smoke:cron-surface] PASSED — 21 production crons only; no experimental App Router surface claim.\n",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
