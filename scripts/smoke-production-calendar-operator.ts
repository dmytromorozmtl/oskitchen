/**
 * Production calendar operator certification smoke (local / pre-pilot).
 *
 * Runs wired Vitest certs — does not drive a browser. Pair with the manual
 * checklist in docs/production-calendar-operator-checklist.md.
 *
 * Usage:
 *   npx tsx scripts/smoke-production-calendar-operator.ts
 *   npx tsx scripts/smoke-production-calendar-operator.ts --checklist-only
 */
import { spawnSync } from "node:child_process";

import {
  PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA15_MANUAL_CHECKLIST,
  PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA15_POLICY_ID,
} from "../lib/production/production-calendar-operator-depth-era15-policy";

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

function printChecklist(): void {
  console.log(`\nProduction calendar operator checklist (${PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA15_POLICY_ID})\n`);
  for (const [index, step] of PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA15_MANUAL_CHECKLIST.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log("\nSee docs/production-calendar-operator-checklist.md\n");
}

async function main() {
  if (hasFlag("--help") || hasFlag("-h")) {
    console.log(`
Production calendar operator smoke

  (default)  Run test:ci:production-calendar-move-ui:cert + era13 operator-depth cert
  --checklist-only   Print manual pilot steps only
`);
    process.exit(0);
  }

  if (hasFlag("--checklist-only")) {
    printChecklist();
    process.exit(0);
  }

  console.log(`\n[smoke:production-calendar] ${PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA15_POLICY_ID}\n`);

  const codes = [
    runNpmScript("test:ci:production-calendar-move-ui:cert"),
    runNpmScript("test:ci:production-calendar-operator-depth-era15:cert"),
  ];

  printChecklist();

  const failed = codes.find((c) => c !== 0);
  if (failed !== undefined) {
    console.error("\n[smoke:production-calendar] FAILED — fix cert tests before pilot sign-off.\n");
    process.exit(failed);
  }

  console.log("\n[smoke:production-calendar] PASSED — complete manual checklist before pilot claim.\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
