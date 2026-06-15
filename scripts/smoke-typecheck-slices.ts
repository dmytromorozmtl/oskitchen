/**
 * Typecheck slice honesty smoke (local / pre-merge).
 *
 * Runs wired Vitest typecheck slice policy certs — does not run tsc (use typecheck:slice:*).
 */
import { spawnSync } from "node:child_process";

import {
  TYPECHECK_SLICE_ERA15_PILOT_CHECKLIST,
  TYPECHECK_SLICE_ERA15_POLICY_ID,
} from "../lib/ci/typecheck-slice-era15-policy";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function printChecklist(): void {
  console.log(`\nTypecheck slices (${TYPECHECK_SLICE_ERA15_POLICY_ID})\n`);
  for (const [index, step] of TYPECHECK_SLICE_ERA15_PILOT_CHECKLIST.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(
    "\nLocal slice example: npm run typecheck:slice:services-core\nSee docs/devops-release-enterprise-readiness.md\n",
  );
}

async function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Typecheck slice honesty smoke

  (default)         Run test:ci:typecheck-slice:cert + era15 cert
  --checklist-only  Print pilot checklist only
`);
    process.exit(0);
  }

  if (process.argv.includes("--checklist-only")) {
    printChecklist();
    process.exit(0);
  }

  console.log(`\n[smoke:typecheck-slices] ${TYPECHECK_SLICE_ERA15_POLICY_ID}\n`);

  const steps = [
    "test:ci:typecheck-slice",
    "test:ci:typecheck-slice:cert",
    "test:ci:typecheck-slice-era15:cert",
  ] as const;

  for (const script of steps) {
    console.log(`\n→ npm run ${script}\n`);
    const code = runNpmScript(script);
    if (code !== 0) {
      console.error(`\n[smoke:typecheck-slices] FAILED at ${script} (exit ${code})\n`);
      process.exit(code);
    }
  }

  printChecklist();
  console.log(
    "\n[smoke:typecheck-slices] PASSED — CI wiring certified; run typecheck:slice:* or typecheck:full locally before merge.\n",
  );
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
