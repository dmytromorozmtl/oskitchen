/**
 * Channel golden path honesty smoke (local / pre-pilot).
 *
 * Runs wired Vitest certs — does not call live Woo/Shopify APIs.
 * For tenant staging use npm run smoke:woo-shopify separately.
 */
import { spawnSync } from "node:child_process";

import {
  CHANNEL_GOLDEN_PATH_ERA14_PILOT_CHECKLIST,
  CHANNEL_GOLDEN_PATH_ERA14_POLICY_ID,
  CHANNEL_GOLDEN_PATH_ERA14_STAGING_SMOKE_NPM_SCRIPT,
} from "../lib/integrations/channel-golden-path-era14-policy";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function printChecklist(): void {
  console.log(`\nChannel golden path (${CHANNEL_GOLDEN_PATH_ERA14_POLICY_ID})\n`);
  for (const [index, step] of CHANNEL_GOLDEN_PATH_ERA14_PILOT_CHECKLIST.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(
    `\nStaging live-store smoke (optional): npm run ${CHANNEL_GOLDEN_PATH_ERA14_STAGING_SMOKE_NPM_SCRIPT}`,
  );
  console.log("\nSee docs/channel-golden-path-honesty-checklist.md\n");
}

async function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Channel golden path honesty smoke

  (default)         Run test:ci:channel-golden-path:cert + era14 cert
  --checklist-only  Print pilot honesty steps only
`);
    process.exit(0);
  }

  if (process.argv.includes("--checklist-only")) {
    printChecklist();
    process.exit(0);
  }

  console.log(`\n[smoke:channel-golden-path] ${CHANNEL_GOLDEN_PATH_ERA14_POLICY_ID}\n`);

  const codes = [
    runNpmScript("test:ci:channel-golden-path:cert"),
    runNpmScript("test:ci:channel-golden-path-era14:cert"),
  ];

  printChecklist();

  const failed = codes.find((c) => c !== 0);
  if (failed !== undefined) {
    console.error(
      "\n[smoke:channel-golden-path] FAILED — fix cert tests before integration depth claims.\n",
    );
    process.exit(failed);
  }

  console.log(
    "\n[smoke:channel-golden-path] PASSED — webhook→externalOrder→hub path certified; no live marketplace ops claim.\n",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
