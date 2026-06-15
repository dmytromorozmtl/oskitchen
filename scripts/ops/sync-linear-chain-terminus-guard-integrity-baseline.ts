#!/usr/bin/env npx tsx
/**
 * Records Linear chain terminus guard integrity baseline when Linear path permanently closed honest + train active.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { evaluateLinearChainTerminusGuardIntegrity } from "@/lib/commercial/linear-chain-terminus-guard-integrity-era41";
import {
  LINEAR_CHAIN_TERMINUS_GUARD_INTEGRITY_BASELINE_ARTIFACT,
  type LinearChainTerminusGuardIntegrityBaseline,
} from "@/lib/commercial/linear-chain-terminus-guard-integrity-era41";

function main() {
  const write = process.argv.includes("--write");
  const integrity = evaluateLinearChainTerminusGuardIntegrity();

  if (!integrity.integrityPassed) {
    console.error("Cannot record baseline — Linear chain terminus guard integrity FAIL.");
    for (const violation of integrity.violations) {
      console.error(`  [${violation.id}] ${violation.detail}`);
    }
    process.exit(2);
  }

  if (
    !integrity.linearChainTerminusGuardComplete ||
    integrity.goDecision !== "GO" ||
    !integrity.goIntegrityPassed
  ) {
    console.error(
      "Cannot record baseline — honest Linear path permanently closed + GO prerequisite not met.",
    );
    process.exit(2);
  }

  const baseline: LinearChainTerminusGuardIntegrityBaseline = {
    linearChainTerminusGuardExecutionHonest: true,
    recordedAt: new Date().toISOString(),
    linearPathPermanentlyClosedCompleteAttested: true,
    goDecision: "GO",
  };

  if (!write) {
    console.log(JSON.stringify(baseline, null, 2));
    console.log("\nPass --write to persist baseline artifact.\n");
    return;
  }

  const path = join(process.cwd(), LINEAR_CHAIN_TERMINUS_GUARD_INTEGRITY_BASELINE_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(baseline, null, 2)}\n`, "utf8");
  console.log(`Wrote ${LINEAR_CHAIN_TERMINUS_GUARD_INTEGRITY_BASELINE_ARTIFACT}`);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}
