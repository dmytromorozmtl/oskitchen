#!/usr/bin/env npx tsx
/**
 * Records Linear path permanently closed integrity baseline when Commercial pilot path absolute end honest + train active.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { evaluateLinearPathPermanentlyClosedIntegrity } from "@/lib/commercial/linear-path-permanently-closed-integrity-era40";
import {
  LINEAR_PATH_PERMANENTLY_CLOSED_INTEGRITY_BASELINE_ARTIFACT,
  type LinearPathPermanentlyClosedIntegrityBaseline,
} from "@/lib/commercial/linear-path-permanently-closed-integrity-era40";

function main() {
  const write = process.argv.includes("--write");
  const integrity = evaluateLinearPathPermanentlyClosedIntegrity();

  if (!integrity.integrityPassed) {
    console.error("Cannot record baseline — Linear path permanently closed integrity FAIL.");
    for (const violation of integrity.violations) {
      console.error(`  [${violation.id}] ${violation.detail}`);
    }
    process.exit(2);
  }

  if (
    !integrity.linearPathPermanentlyClosedComplete ||
    integrity.goDecision !== "GO" ||
    !integrity.goIntegrityPassed
  ) {
    console.error(
      "Cannot record baseline — honest Commercial pilot path absolute end + GO prerequisite not met.",
    );
    process.exit(2);
  }

  const baseline: LinearPathPermanentlyClosedIntegrityBaseline = {
    linearPathPermanentlyClosedExecutionHonest: true,
    recordedAt: new Date().toISOString(),
    commercialPilotPathAbsoluteEndCompleteAttested: true,
    goDecision: "GO",
  };

  if (!write) {
    console.log(JSON.stringify(baseline, null, 2));
    console.log("\nPass --write to persist baseline artifact.\n");
    return;
  }

  const path = join(process.cwd(), LINEAR_PATH_PERMANENTLY_CLOSED_INTEGRITY_BASELINE_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(baseline, null, 2)}\n`, "utf8");
  console.log(`Wrote ${LINEAR_PATH_PERMANENTLY_CLOSED_INTEGRITY_BASELINE_ARTIFACT}`);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}
