#!/usr/bin/env npx tsx
/**
 * Records pilot week 1 execution convergence integrity baseline when GO convergence ready + train active.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { evaluatePilotWeek1ExecutionConvergenceIntegrity } from "@/lib/commercial/pilot-week1-execution-convergence-integrity-era48";
import {
  PILOT_WEEK1_EXECUTION_CONVERGENCE_INTEGRITY_BASELINE_ARTIFACT,
  type PilotWeek1ExecutionConvergenceIntegrityBaseline,
} from "@/lib/commercial/pilot-week1-execution-convergence-integrity-era48";

function main() {
  const write = process.argv.includes("--write");
  const integrity = evaluatePilotWeek1ExecutionConvergenceIntegrity();

  if (!integrity.integrityPassed) {
    console.error("Cannot record baseline — pilot week 1 convergence integrity FAIL.");
    for (const violation of integrity.violations) {
      console.error(`  [${violation.id}] ${violation.detail}`);
    }
    process.exit(2);
  }

  if (
    !integrity.pilotWeek1ExecutionConvergenceComplete ||
    integrity.goDecision !== "GO" ||
    !integrity.goIntegrityPassed
  ) {
    console.error(
      "Cannot record baseline — honest GO convergence ready + week 1 complete prerequisite not met.",
    );
    process.exit(2);
  }

  const baseline: PilotWeek1ExecutionConvergenceIntegrityBaseline = {
    pilotWeek1ExecutionConvergenceExecutionHonest: true,
    recordedAt: new Date().toISOString(),
    paidPilotGoConvergenceReadyAttested: true,
    goDecision: "GO",
  };

  if (!write) {
    console.log(JSON.stringify(baseline, null, 2));
    console.log("\nPass --write to persist baseline artifact.\n");
    return;
  }

  const path = join(process.cwd(), PILOT_WEEK1_EXECUTION_CONVERGENCE_INTEGRITY_BASELINE_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(baseline, null, 2)}\n`, "utf8");
  console.log(`Wrote ${PILOT_WEEK1_EXECUTION_CONVERGENCE_INTEGRITY_BASELINE_ARTIFACT}`);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}
