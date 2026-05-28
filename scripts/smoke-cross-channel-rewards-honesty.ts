/**
 * Cross-channel rewards honesty smoke (local / pre-pilot).
 *
 * Runs wired Vitest certs — does not drive unified cross-channel browser E2E.
 */
import { spawnSync } from "node:child_process";

import {
  CROSS_CHANNEL_REWARDS_ERA14_PILOT_HONESTY_CHECKLIST,
  CROSS_CHANNEL_REWARDS_ERA14_POLICY_ID,
  CROSS_CHANNEL_REWARDS_ERA14_UNIFICATION_STATUS,
} from "../lib/rewards/cross-channel-rewards-era14-policy";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function printChecklist(): void {
  console.log(
    `\nCross-channel rewards honesty (${CROSS_CHANNEL_REWARDS_ERA14_POLICY_ID}) — unification: ${CROSS_CHANNEL_REWARDS_ERA14_UNIFICATION_STATUS}\n`,
  );
  for (const [index, step] of CROSS_CHANNEL_REWARDS_ERA14_PILOT_HONESTY_CHECKLIST.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log("\nSee docs/cross-channel-rewards-honesty-checklist.md\n");
}

async function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Cross-channel rewards honesty smoke

  (default)  Run test:ci:cross-channel-rewards:cert + era14 cert
  --checklist-only   Print pilot honesty steps only
`);
    process.exit(0);
  }

  if (process.argv.includes("--checklist-only")) {
    printChecklist();
    process.exit(0);
  }

  console.log(`\n[smoke:cross-channel-rewards] ${CROSS_CHANNEL_REWARDS_ERA14_POLICY_ID}\n`);

  const codes = [
    runNpmScript("test:ci:cross-channel-rewards:cert"),
    runNpmScript("test:ci:cross-channel-rewards-era14:cert"),
  ];

  printChecklist();

  const failed = codes.find((c) => c !== 0);
  if (failed !== undefined) {
    console.error("\n[smoke:cross-channel-rewards] FAILED — fix cert tests before pilot claims.\n");
    process.exit(failed);
  }

  console.log("\n[smoke:cross-channel-rewards] PASSED — dual ledger honesty certified; no unified E2E claim.\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
