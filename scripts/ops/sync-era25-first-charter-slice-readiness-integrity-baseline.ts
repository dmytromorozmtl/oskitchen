#!/usr/bin/env npx tsx
/**
 * Records era25 first charter slice readiness integrity baseline when charter exit honest + train active.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { evaluateEra25FirstCharterSliceReadinessIntegrity } from "@/lib/commercial/era25-first-charter-slice-readiness-integrity-era43";
import {
  ERA25_FIRST_CHARTER_SLICE_READINESS_INTEGRITY_BASELINE_ARTIFACT,
  type Era25FirstCharterSliceReadinessIntegrityBaseline,
} from "@/lib/commercial/era25-first-charter-slice-readiness-integrity-era43";

function main() {
  const write = process.argv.includes("--write");
  const integrity = evaluateEra25FirstCharterSliceReadinessIntegrity();

  if (!integrity.integrityPassed) {
    console.error("Cannot record baseline — first charter slice integrity FAIL.");
    for (const violation of integrity.violations) {
      console.error(`  [${violation.id}] ${violation.detail}`);
    }
    process.exit(2);
  }

  if (
    !integrity.era25FirstCharterSliceComplete ||
    integrity.goDecision !== "GO" ||
    !integrity.goIntegrityPassed
  ) {
    console.error(
      "Cannot record baseline — honest era25 charter exit + GO prerequisite not met.",
    );
    process.exit(2);
  }

  const baseline: Era25FirstCharterSliceReadinessIntegrityBaseline = {
    era25FirstCharterSliceReadinessExecutionHonest: true,
    recordedAt: new Date().toISOString(),
    era25CharterExitCompleteAttested: true,
    goDecision: "GO",
  };

  if (!write) {
    console.log(JSON.stringify(baseline, null, 2));
    console.log("\nPass --write to persist baseline artifact.\n");
    return;
  }

  const path = join(process.cwd(), ERA25_FIRST_CHARTER_SLICE_READINESS_INTEGRITY_BASELINE_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(baseline, null, 2)}\n`, "utf8");
  console.log(`Wrote ${ERA25_FIRST_CHARTER_SLICE_READINESS_INTEGRITY_BASELINE_ARTIFACT}`);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}
