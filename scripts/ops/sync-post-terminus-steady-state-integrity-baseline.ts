#!/usr/bin/env npx tsx
/**
 * Records Post-terminus steady state integrity baseline when Engineering path terminus honest + train active.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { evaluatePostTerminusSteadyStateIntegrity } from "@/lib/commercial/post-terminus-steady-state-integrity-era38";
import {
  POST_TERMINUS_STEADY_STATE_INTEGRITY_BASELINE_ARTIFACT,
  type PostTerminusSteadyStateIntegrityBaseline,
} from "@/lib/commercial/post-terminus-steady-state-integrity-era38";

function main() {
  const write = process.argv.includes("--write");
  const integrity = evaluatePostTerminusSteadyStateIntegrity();

  if (!integrity.integrityPassed) {
    console.error("Cannot record baseline — Post-terminus steady state integrity FAIL.");
    for (const violation of integrity.violations) {
      console.error(`  [${violation.id}] ${violation.detail}`);
    }
    process.exit(2);
  }

  if (
    !integrity.postTerminusSteadyStateComplete ||
    integrity.goDecision !== "GO" ||
    !integrity.goIntegrityPassed
  ) {
    console.error(
      "Cannot record baseline — honest Engineering path terminus + GO prerequisite not met.",
    );
    process.exit(2);
  }

  const baseline: PostTerminusSteadyStateIntegrityBaseline = {
    postTerminusSteadyStateExecutionHonest: true,
    recordedAt: new Date().toISOString(),
    engineeringPathTerminusCompleteAttested: true,
    goDecision: "GO",
  };

  if (!write) {
    console.log(JSON.stringify(baseline, null, 2));
    console.log("\nPass --write to persist baseline artifact.\n");
    return;
  }

  const path = join(process.cwd(), POST_TERMINUS_STEADY_STATE_INTEGRITY_BASELINE_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(baseline, null, 2)}\n`, "utf8");
  console.log(`Wrote ${POST_TERMINUS_STEADY_STATE_INTEGRITY_BASELINE_ARTIFACT}`);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}
