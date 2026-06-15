/**
 * Closed-beta QA orchestrator (step 4) — delegates to beta:launch step 4 or full Playwright path.
 *
 *   npm run beta:qa-bundle
 *   npm run beta:qa-bundle -- --with-playwright
 */
import { spawnSync } from "node:child_process";

function main() {
  const withPlaywright = process.argv.includes("--with-playwright");
  const args = ["run", "beta:launch", "--", "--step=4"];
  if (withPlaywright) args.push("--with-playwright");
  args.push("--json");

  console.log("=== OS Kitchen beta QA bundle (step 4) ===\n");
  const r = spawnSync("npm", args, {
    stdio: "inherit",
    env: process.env,
    shell: process.platform === "win32",
  });

  if (r.status !== 0) process.exit(r.status ?? 1);

  console.log("\nStep 5 reminder: npm run verify:staff-scope");
  console.log("Manual: docs/MANUAL_STAFF_VISIBILITY_CHECKLIST.md");
}

main();
