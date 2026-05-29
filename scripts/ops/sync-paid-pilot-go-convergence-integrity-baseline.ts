#!/usr/bin/env npx tsx
/**
 * Records paid pilot GO convergence integrity baseline when breakthrough ready + train active.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { evaluatePaidPilotGoConvergenceIntegrity } from "@/lib/commercial/paid-pilot-go-convergence-integrity-era47";
import {
  PAID_PILOT_GO_CONVERGENCE_INTEGRITY_BASELINE_ARTIFACT,
  type PaidPilotGoConvergenceIntegrityBaseline,
} from "@/lib/commercial/paid-pilot-go-convergence-integrity-era47";

function main() {
  const write = process.argv.includes("--write");
  const integrity = evaluatePaidPilotGoConvergenceIntegrity();

  if (!integrity.integrityPassed) {
    console.error("Cannot record baseline — paid pilot GO convergence integrity FAIL.");
    for (const violation of integrity.violations) {
      console.error(`  [${violation.id}] ${violation.detail}`);
    }
    process.exit(2);
  }

  if (
    !integrity.paidPilotGoConvergenceComplete ||
    integrity.goDecision !== "GO" ||
    !integrity.goIntegrityPassed
  ) {
    console.error(
      "Cannot record baseline — honest breakthrough ready + GO prerequisite not met.",
    );
    process.exit(2);
  }

  const baseline: PaidPilotGoConvergenceIntegrityBaseline = {
    paidPilotGoConvergenceExecutionHonest: true,
    recordedAt: new Date().toISOString(),
    ownerDailyBriefingBreakthroughReadyAttested: true,
    goDecision: "GO",
  };

  if (!write) {
    console.log(JSON.stringify(baseline, null, 2));
    console.log("\nPass --write to persist baseline artifact.\n");
    return;
  }

  const path = join(process.cwd(), PAID_PILOT_GO_CONVERGENCE_INTEGRITY_BASELINE_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(baseline, null, 2)}\n`, "utf8");
  console.log(`Wrote ${PAID_PILOT_GO_CONVERGENCE_INTEGRITY_BASELINE_ARTIFACT}`);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}
