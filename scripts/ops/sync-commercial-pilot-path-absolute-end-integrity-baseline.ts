#!/usr/bin/env npx tsx
/**
 * Records Commercial pilot path absolute end integrity baseline when Post-terminus steady state honest + train active.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { evaluateCommercialPilotPathAbsoluteEndIntegrity } from "@/lib/commercial/commercial-pilot-path-absolute-end-integrity-era39";
import {
  COMMERCIAL_PILOT_PATH_ABSOLUTE_END_INTEGRITY_BASELINE_ARTIFACT,
  type CommercialPilotPathAbsoluteEndIntegrityBaseline,
} from "@/lib/commercial/commercial-pilot-path-absolute-end-integrity-era39";

function main() {
  const write = process.argv.includes("--write");
  const integrity = evaluateCommercialPilotPathAbsoluteEndIntegrity();

  if (!integrity.integrityPassed) {
    console.error("Cannot record baseline — Commercial pilot path absolute end integrity FAIL.");
    for (const violation of integrity.violations) {
      console.error(`  [${violation.id}] ${violation.detail}`);
    }
    process.exit(2);
  }

  if (
    !integrity.commercialPilotPathAbsoluteEndComplete ||
    integrity.goDecision !== "GO" ||
    !integrity.goIntegrityPassed
  ) {
    console.error(
      "Cannot record baseline — honest Post-terminus steady state + GO prerequisite not met.",
    );
    process.exit(2);
  }

  const baseline: CommercialPilotPathAbsoluteEndIntegrityBaseline = {
    commercialPilotPathAbsoluteEndExecutionHonest: true,
    recordedAt: new Date().toISOString(),
    postTerminusSteadyStateCompleteAttested: true,
    goDecision: "GO",
  };

  if (!write) {
    console.log(JSON.stringify(baseline, null, 2));
    console.log("\nPass --write to persist baseline artifact.\n");
    return;
  }

  const path = join(process.cwd(), COMMERCIAL_PILOT_PATH_ABSOLUTE_END_INTEGRITY_BASELINE_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(baseline, null, 2)}\n`, "utf8");
  console.log(`Wrote ${COMMERCIAL_PILOT_PATH_ABSOLUTE_END_INTEGRITY_BASELINE_ARTIFACT}`);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}
