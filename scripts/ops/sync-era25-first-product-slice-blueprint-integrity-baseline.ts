#!/usr/bin/env npx tsx
/**
 * Records era25 first product slice blueprint integrity baseline when engineering gates open + train active.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { evaluateEra25FirstProductSliceBlueprintIntegrity } from "@/lib/commercial/era25-first-product-slice-blueprint-integrity-era45";
import {
  ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_INTEGRITY_BASELINE_ARTIFACT,
  type Era25FirstProductSliceBlueprintIntegrityBaseline,
} from "@/lib/commercial/era25-first-product-slice-blueprint-integrity-era45";

function main() {
  const write = process.argv.includes("--write");
  const integrity = evaluateEra25FirstProductSliceBlueprintIntegrity();

  if (!integrity.integrityPassed) {
    console.error("Cannot record baseline — blueprint integrity FAIL.");
    for (const violation of integrity.violations) {
      console.error(`  [${violation.id}] ${violation.detail}`);
    }
    process.exit(2);
  }

  if (
    !integrity.era25FirstProductSliceBlueprintComplete ||
    integrity.goDecision !== "GO" ||
    !integrity.goIntegrityPassed
  ) {
    console.error(
      "Cannot record baseline — honest engineering gates open + GO prerequisite not met.",
    );
    process.exit(2);
  }

  const baseline: Era25FirstProductSliceBlueprintIntegrityBaseline = {
    era25FirstProductSliceBlueprintExecutionHonest: true,
    recordedAt: new Date().toISOString(),
    era25EngineeringGatesOpenAttested: true,
    goDecision: "GO",
  };

  if (!write) {
    console.log(JSON.stringify(baseline, null, 2));
    console.log("\nPass --write to persist baseline artifact.\n");
    return;
  }

  const path = join(process.cwd(), ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_INTEGRITY_BASELINE_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(baseline, null, 2)}\n`, "utf8");
  console.log(`Wrote ${ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_INTEGRITY_BASELINE_ARTIFACT}`);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}
