#!/usr/bin/env npx tsx
/**
 * Records era25 engineering gates integrity baseline when first charter slice honest + train active.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { evaluateEra25EngineeringGatesIntegrity } from "@/lib/commercial/era25-engineering-gates-integrity-era44";
import {
  ERA25_ENGINEERING_GATES_INTEGRITY_BASELINE_ARTIFACT,
  type Era25EngineeringGatesIntegrityBaseline,
} from "@/lib/commercial/era25-engineering-gates-integrity-era44";

function main() {
  const write = process.argv.includes("--write");
  const integrity = evaluateEra25EngineeringGatesIntegrity();

  if (!integrity.integrityPassed) {
    console.error("Cannot record baseline — engineering gates integrity FAIL.");
    for (const violation of integrity.violations) {
      console.error(`  [${violation.id}] ${violation.detail}`);
    }
    process.exit(2);
  }

  if (
    !integrity.era25EngineeringGatesComplete ||
    integrity.goDecision !== "GO" ||
    !integrity.goIntegrityPassed
  ) {
    console.error(
      "Cannot record baseline — honest first charter slice + GO prerequisite not met.",
    );
    process.exit(2);
  }

  const baseline: Era25EngineeringGatesIntegrityBaseline = {
    era25EngineeringGatesExecutionHonest: true,
    recordedAt: new Date().toISOString(),
    era25FirstCharterSliceCompleteAttested: true,
    goDecision: "GO",
  };

  if (!write) {
    console.log(JSON.stringify(baseline, null, 2));
    console.log("\nPass --write to persist baseline artifact.\n");
    return;
  }

  const path = join(process.cwd(), ERA25_ENGINEERING_GATES_INTEGRITY_BASELINE_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(baseline, null, 2)}\n`, "utf8");
  console.log(`Wrote ${ERA25_ENGINEERING_GATES_INTEGRITY_BASELINE_ARTIFACT}`);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}
