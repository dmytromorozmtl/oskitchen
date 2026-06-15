/**
 * Execute exactly one next action toward paid-pilot GO.
 *
 *   npm run pilot:next-step
 *   npm run pilot:next-step -- --list
 *   npm run pilot:next-step -- --dry-run
 */
import { execSync } from "node:child_process";

import {
  nextIncompletePilotAction,
  resolvePilotQueue,
  sh,
} from "./lib/pilot-action-queue";

function regenerateDoc(): void {
  try {
    execSync("npx tsx scripts/generate-pilot-next-step-instructions.ts", {
      stdio: "pipe",
      env: { ...process.env, NPM_CONFIG_PRODUCTION: "false" },
    });
  } catch {
    /* non-fatal */
  }
}

async function main() {
  const listOnly = process.argv.includes("--list");
  const dryRun = process.argv.includes("--dry-run");
  const resolved = await resolvePilotQueue();
  const done = resolved.filter((x) => x.complete).length;

  console.log("Paid pilot — action queue\n");
  for (const { action, complete } of resolved) {
    const mark = complete ? "✓" : " ";
    console.log(`  [${mark}] ${action.id} (${action.owner}) — ${action.title}`);
  }
  console.log(`\nProgress: ${done}/${resolved.length}`);

  const pick = await nextIncompletePilotAction();

  regenerateDoc();
  console.log("\nDetailed guide: docs/generated/NEXT_STEP_INSTRUCTIONS.md\n");

  if (!pick) {
    console.log("All steps complete. Run: npm run pilot:go-no-go-report");
    sh("npm run pilot:go-no-go-report");
    return;
  }

  if (listOnly) return;

  console.log(`>>> Next: [${pick.owner}] ${pick.title} (${pick.id})\n`);

  if (dryRun) {
    console.log("--dry-run: not executing.");
    return;
  }

  if (pick.auto) {
    const ok = await pick.auto();
    if (!ok && pick.manual) {
      console.log("\nManual follow-up:");
      pick.manual.forEach((l) => console.log(`  ${l}`));
    }
    regenerateDoc();
    sh("npm run pilot:go-no-go-report");
    console.log(
      ok ? "\nStep succeeded. Run again: npm run pilot:next-step" : "\nStep needs manual input.",
    );
    process.exit(ok ? 0 : 1);
  }

  if (pick.manual) {
    pick.manual.forEach((l) => console.log(`  ${l}`));
    console.log("\n(Manual step — exit 2 = action required, not a script bug.)");
    process.exit(2);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
