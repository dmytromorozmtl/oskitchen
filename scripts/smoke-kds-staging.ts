/**
 * KDS staging smoke (local / pre-pilot).
 *
 * Runs wired Vitest KDS staging + realtime E2E policy certs — does not launch Playwright.
 */
import { spawnSync } from "node:child_process";

import {
  KDS_STAGING_SMOKE_ERA15_PILOT_CHECKLIST,
  KDS_STAGING_SMOKE_ERA15_POLICY_ID,
} from "../lib/kitchen/kds-staging-smoke-era15-policy";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function printChecklist(): void {
  console.log(`\nKDS staging smoke (${KDS_STAGING_SMOKE_ERA15_POLICY_ID})\n`);
  for (const [index, step] of KDS_STAGING_SMOKE_ERA15_PILOT_CHECKLIST.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log("\nSee docs/kds-staging-smoke-checklist.md\n");
}

async function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
KDS staging smoke

  (default)         Run test:ci:kds-staging-smoke:cert + era15 cert + realtime E2E staging cert wiring
  --checklist-only  Print pilot checklist only
`);
    process.exit(0);
  }

  if (process.argv.includes("--checklist-only")) {
    printChecklist();
    process.exit(0);
  }

  console.log(`\n[smoke:kds-staging] ${KDS_STAGING_SMOKE_ERA15_POLICY_ID}\n`);

  const codes = [
    runNpmScript("test:ci:kds-staging-smoke:cert"),
    runNpmScript("test:ci:kds-staging-smoke-era15:cert"),
    runNpmScript("test:ci:kds-realtime-e2e-staging:cert"),
  ];

  printChecklist();

  const failed = codes.find((c) => c !== 0);
  if (failed !== undefined) {
    console.error("\n[smoke:kds-staging] FAILED — fix KDS cert tests before pilot claims.\n");
    process.exit(failed);
  }

  console.log(
    "\n[smoke:kds-staging] PASSED — bump/recall CI path certified; no rush-hour or default-CI Playwright claim.\n",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
