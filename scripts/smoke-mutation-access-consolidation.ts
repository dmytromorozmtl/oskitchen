/**
 * Mutation access consolidation smoke (local / pre-release).
 *
 * Runs wired Vitest certs — does not replace test:security wave-4 negative suites.
 */
import { spawnSync } from "node:child_process";

import {
  MUTATION_ACCESS_ERA14_AUDIT_CHECKLIST,
  MUTATION_ACCESS_ERA14_POLICY_ID,
} from "../lib/permissions/mutation-access-era14-policy";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function printChecklist(): void {
  console.log(
    `\nMutation access consolidation (${MUTATION_ACCESS_ERA14_POLICY_ID})\n`,
  );
  for (const [index, step] of MUTATION_ACCESS_ERA14_AUDIT_CHECKLIST.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log("\nSee docs/mutation-access-consolidation-checklist.md\n");
}

async function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Mutation access consolidation smoke

  (default)         Run test:ci:mutation-access-consolidation:cert + era14 cert
  --checklist-only  Print audit checklist only
`);
    process.exit(0);
  }

  if (process.argv.includes("--checklist-only")) {
    printChecklist();
    process.exit(0);
  }

  console.log(`\n[smoke:mutation-access] ${MUTATION_ACCESS_ERA14_POLICY_ID}\n`);

  const codes = [
    runNpmScript("test:ci:mutation-access-consolidation:cert"),
    runNpmScript("test:ci:mutation-access-era14:cert"),
  ];

  printChecklist();

  const failed = codes.find((c) => c !== 0);
  if (failed !== undefined) {
    console.error("\n[smoke:mutation-access] FAILED — fix cert tests before RBAC claims.\n");
    process.exit(failed);
  }

  console.log(
    "\n[smoke:mutation-access] PASSED — registry narrative recertified; no unified rewrite claim.\n",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
