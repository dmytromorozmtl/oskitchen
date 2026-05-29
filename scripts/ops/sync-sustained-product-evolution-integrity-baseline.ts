#!/usr/bin/env npx tsx
/**
 * Records Sustained product evolution integrity baseline when Improvement loop honest + train active.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { evaluateSustainedProductEvolutionIntegrity } from "@/lib/commercial/sustained-product-evolution-integrity-era35";
import {
  SUSTAINED_PRODUCT_EVOLUTION_INTEGRITY_BASELINE_ARTIFACT,
  type SustainedProductEvolutionIntegrityBaseline,
} from "@/lib/commercial/sustained-product-evolution-integrity-era35";

function main() {
  const write = process.argv.includes("--write");
  const integrity = evaluateSustainedProductEvolutionIntegrity();

  if (!integrity.integrityPassed) {
    console.error("Cannot record baseline — Sustained product evolution integrity FAIL.");
    for (const violation of integrity.violations) {
      console.error(`  [${violation.id}] ${violation.detail}`);
    }
    process.exit(2);
  }

  if (
    !integrity.productEvolutionComplete ||
    integrity.goDecision !== "GO" ||
    !integrity.goIntegrityPassed
  ) {
    console.error("Cannot record baseline — honest Improvement loop + GO prerequisite not met.");
    process.exit(2);
  }

  const baseline: SustainedProductEvolutionIntegrityBaseline = {
    productEvolutionExecutionHonest: true,
    recordedAt: new Date().toISOString(),
    improvementLoopCompleteAttested: true,
    goDecision: "GO",
  };

  if (!write) {
    console.log(JSON.stringify(baseline, null, 2));
    console.log("\nPass --write to persist baseline artifact.\n");
    return;
  }

  const path = join(process.cwd(), SUSTAINED_PRODUCT_EVOLUTION_INTEGRITY_BASELINE_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(baseline, null, 2)}\n`, "utf8");
  console.log(`Wrote ${SUSTAINED_PRODUCT_EVOLUTION_INTEGRITY_BASELINE_ARTIFACT}`);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}
