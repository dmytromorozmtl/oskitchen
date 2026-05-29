#!/usr/bin/env npx tsx
/**
 * Records Pilot Week 1 integrity baseline when GO honest + Week 1 train active.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { evaluatePilotWeek1ExecutionIntegrity } from "@/lib/commercial/pilot-week1-execution-integrity-era28";
import {
  PILOT_WEEK1_EXECUTION_INTEGRITY_BASELINE_ARTIFACT,
  type PilotWeek1ExecutionIntegrityBaseline,
} from "@/lib/commercial/pilot-week1-execution-integrity-era28";

function main() {
  const write = process.argv.includes("--write");
  const integrity = evaluatePilotWeek1ExecutionIntegrity();

  if (!integrity.integrityPassed) {
    console.error("Cannot record baseline — Week 1 execution integrity FAIL.");
    for (const violation of integrity.violations) {
      console.error(`  [${violation.id}] ${violation.detail}`);
    }
    process.exit(2);
  }

  if (integrity.goDecision !== "GO" || !integrity.goIntegrityPassed) {
    console.error("Cannot record baseline — honest GO prerequisite not met.");
    process.exit(2);
  }

  const baseline: PilotWeek1ExecutionIntegrityBaseline = {
    week1ExecutionHonest: true,
    recordedAt: new Date().toISOString(),
    goDecision: "GO",
  };

  if (!write) {
    console.log(JSON.stringify(baseline, null, 2));
    console.log("\nPass --write to persist baseline artifact.\n");
    return;
  }

  const path = join(process.cwd(), PILOT_WEEK1_EXECUTION_INTEGRITY_BASELINE_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(baseline, null, 2)}\n`, "utf8");
  console.log(`Wrote ${PILOT_WEEK1_EXECUTION_INTEGRITY_BASELINE_ARTIFACT}`);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}
