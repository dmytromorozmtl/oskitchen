/**
 * Staging workflows honesty smoke (local / pre-pilot).
 *
 * Runs wired Vitest staging workflow policy certs — does not call GitHub Actions.
 */
import { spawnSync } from "node:child_process";

import {
  STAGING_WORKFLOWS_FIRST_RUN_ERA15_PILOT_CHECKLIST,
  STAGING_WORKFLOWS_FIRST_RUN_ERA15_POLICY_ID,
} from "../lib/ci/staging-workflows-first-run-era15-policy";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function printChecklist(): void {
  console.log(`\nStaging workflows (${STAGING_WORKFLOWS_FIRST_RUN_ERA15_POLICY_ID})\n`);
  for (const [index, step] of STAGING_WORKFLOWS_FIRST_RUN_ERA15_PILOT_CHECKLIST.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log("\nSee docs/GITHUB_E2E_STAGING_SECRETS.md\n");
}

async function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Staging workflows honesty smoke

  (default)         Run test:ci:e2e-staging-secrets-era12:cert + era15 cert
  --checklist-only  Print first green run checklist only
`);
    process.exit(0);
  }

  if (process.argv.includes("--checklist-only")) {
    printChecklist();
    process.exit(0);
  }

  console.log(`\n[smoke:staging-workflows] ${STAGING_WORKFLOWS_FIRST_RUN_ERA15_POLICY_ID}\n`);

  const steps = [
    "test:ci:e2e-staging-secrets-era12",
    "test:ci:e2e-staging-secrets-era12:cert",
    "test:ci:staging-workflows-first-run-era15:cert",
  ] as const;

  for (const script of steps) {
    console.log(`\n→ npm run ${script}\n`);
    const code = runNpmScript(script);
    if (code !== 0) {
      console.error(
        `\n[smoke:staging-workflows] FAILED at ${script} (exit ${code})\n`,
      );
      process.exit(code);
    }
  }

  printChecklist();
  console.log(
    "\n[smoke:staging-workflows] PASSED — CI wiring certified; first green GitHub run still requires secrets.\n",
  );
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
