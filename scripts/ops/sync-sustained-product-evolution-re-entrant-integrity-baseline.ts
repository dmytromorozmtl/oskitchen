#!/usr/bin/env npx tsx
/**
 * Records sustained product evolution re-entrant integrity baseline when train closure honest + improvement loop path PASS.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { evaluateSustainedProductEvolutionReentrantIntegrity } from "@/lib/commercial/sustained-product-evolution-re-entrant-integrity-era56";
import {
  SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_INTEGRITY_BASELINE_ARTIFACT,
  type SustainedProductEvolutionReentrantIntegrityBaseline,
} from "@/lib/commercial/sustained-product-evolution-re-entrant-integrity-era56";

function main() {
  const write = process.argv.includes("--write");
  const integrity = evaluateSustainedProductEvolutionReentrantIntegrity();

  if (!integrity.integrityPassed) {
    console.error("Cannot record baseline — sustained product evolution re-entrant integrity FAIL.");
    for (const violation of integrity.violations) {
      console.error(`  [${violation.id}] ${violation.detail}`);
    }
    process.exit(2);
  }

  if (
    !integrity.sustainedProductEvolutionReentrantComplete ||
    !integrity.era25CommercialPilotConvergenceTrainClosureComplete ||
    !integrity.improvementLoopActive ||
    integrity.goDecision !== "GO" ||
    !integrity.goIntegrityPassed
  ) {
    console.error(
      "Cannot record baseline — train closure complete + improvement loop active + product evolution integrity prerequisite not met.",
    );
    process.exit(2);
  }

  const baseline: SustainedProductEvolutionReentrantIntegrityBaseline = {
    sustainedProductEvolutionReentrantHonest: true,
    recordedAt: new Date().toISOString(),
    trainClosureCompleteAttested: true,
    improvementLoopActiveAttested: true,
    goDecision: "GO",
  };

  if (!write) {
    console.log(JSON.stringify(baseline, null, 2));
    console.log("\nPass --write to persist baseline artifact.\n");
    return;
  }

  const path = join(process.cwd(), SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_INTEGRITY_BASELINE_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(baseline, null, 2)}\n`, "utf8");
  console.log(`Wrote ${SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_INTEGRITY_BASELINE_ARTIFACT}`);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}
