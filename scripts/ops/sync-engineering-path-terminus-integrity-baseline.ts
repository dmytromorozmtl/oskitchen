#!/usr/bin/env npx tsx
/**
 * Records Engineering path terminus integrity baseline when Maintenance mode honest + train active.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { evaluateEngineeringPathTerminusIntegrity } from "@/lib/commercial/engineering-path-terminus-integrity-era37";
import {
  ENGINEERING_PATH_TERMINUS_INTEGRITY_BASELINE_ARTIFACT,
  type EngineeringPathTerminusIntegrityBaseline,
} from "@/lib/commercial/engineering-path-terminus-integrity-era37";

function main() {
  const write = process.argv.includes("--write");
  const integrity = evaluateEngineeringPathTerminusIntegrity();

  if (!integrity.integrityPassed) {
    console.error("Cannot record baseline — Engineering path terminus integrity FAIL.");
    for (const violation of integrity.violations) {
      console.error(`  [${violation.id}] ${violation.detail}`);
    }
    process.exit(2);
  }

  if (
    !integrity.engineeringPathTerminusComplete ||
    integrity.goDecision !== "GO" ||
    !integrity.goIntegrityPassed
  ) {
    console.error("Cannot record baseline — honest Maintenance mode + GO prerequisite not met.");
    process.exit(2);
  }

  const baseline: EngineeringPathTerminusIntegrityBaseline = {
    engineeringPathTerminusExecutionHonest: true,
    recordedAt: new Date().toISOString(),
    maintenanceModeCompleteAttested: true,
    goDecision: "GO",
  };

  if (!write) {
    console.log(JSON.stringify(baseline, null, 2));
    console.log("\nPass --write to persist baseline artifact.\n");
    return;
  }

  const path = join(process.cwd(), ENGINEERING_PATH_TERMINUS_INTEGRITY_BASELINE_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(baseline, null, 2)}\n`, "utf8");
  console.log(`Wrote ${ENGINEERING_PATH_TERMINUS_INTEGRITY_BASELINE_ARTIFACT}`);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}
