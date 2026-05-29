#!/usr/bin/env npx tsx
/**
 * Records era25 charter exit outside linear path integrity baseline when Step 17 guard honest + train active.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { evaluateEra25CharterExitOutsideLinearPathIntegrity } from "@/lib/commercial/era25-charter-exit-outside-linear-path-integrity-era42";
import {
  ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_INTEGRITY_BASELINE_ARTIFACT,
  type Era25CharterExitOutsideLinearPathIntegrityBaseline,
} from "@/lib/commercial/era25-charter-exit-outside-linear-path-integrity-era42";

function main() {
  const write = process.argv.includes("--write");
  const integrity = evaluateEra25CharterExitOutsideLinearPathIntegrity();

  if (!integrity.integrityPassed) {
    console.error("Cannot record baseline — era25 charter exit integrity FAIL.");
    for (const violation of integrity.violations) {
      console.error(`  [${violation.id}] ${violation.detail}`);
    }
    process.exit(2);
  }

  if (
    !integrity.era25CharterExitComplete ||
    integrity.goDecision !== "GO" ||
    !integrity.goIntegrityPassed
  ) {
    console.error(
      "Cannot record baseline — honest Step 17 FORBIDDEN guard + GO prerequisite not met.",
    );
    process.exit(2);
  }

  const baseline: Era25CharterExitOutsideLinearPathIntegrityBaseline = {
    era25CharterExitExecutionHonest: true,
    recordedAt: new Date().toISOString(),
    linearChainTerminusGuardCompleteAttested: true,
    goDecision: "GO",
  };

  if (!write) {
    console.log(JSON.stringify(baseline, null, 2));
    console.log("\nPass --write to persist baseline artifact.\n");
    return;
  }

  const path = join(process.cwd(), ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_INTEGRITY_BASELINE_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(baseline, null, 2)}\n`, "utf8");
  console.log(`Wrote ${ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_INTEGRITY_BASELINE_ARTIFACT}`);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}
