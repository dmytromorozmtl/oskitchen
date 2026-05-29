#!/usr/bin/env npx tsx
/**
 * Records owner daily briefing breakthrough integrity baseline when blueprint ready + train active.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { evaluateOwnerDailyBriefingBreakthroughIntegrity } from "@/lib/commercial/owner-daily-briefing-breakthrough-integrity-era46";
import {
  OWNER_DAILY_BRIEFING_BREAKTHROUGH_INTEGRITY_BASELINE_ARTIFACT,
  type OwnerDailyBriefingBreakthroughIntegrityBaseline,
} from "@/lib/commercial/owner-daily-briefing-breakthrough-integrity-era46";

function main() {
  const write = process.argv.includes("--write");
  const integrity = evaluateOwnerDailyBriefingBreakthroughIntegrity();

  if (!integrity.integrityPassed) {
    console.error("Cannot record baseline — breakthrough integrity FAIL.");
    for (const violation of integrity.violations) {
      console.error(`  [${violation.id}] ${violation.detail}`);
    }
    process.exit(2);
  }

  if (
    !integrity.ownerDailyBriefingBreakthroughComplete ||
    integrity.goDecision !== "GO" ||
    !integrity.goIntegrityPassed
  ) {
    console.error(
      "Cannot record baseline — honest blueprint ready + GO prerequisite not met.",
    );
    process.exit(2);
  }

  const baseline: OwnerDailyBriefingBreakthroughIntegrityBaseline = {
    ownerDailyBriefingBreakthroughExecutionHonest: true,
    recordedAt: new Date().toISOString(),
    era25FirstProductSliceBlueprintReadyAttested: true,
    goDecision: "GO",
  };

  if (!write) {
    console.log(JSON.stringify(baseline, null, 2));
    console.log("\nPass --write to persist baseline artifact.\n");
    return;
  }

  const path = join(process.cwd(), OWNER_DAILY_BRIEFING_BREAKTHROUGH_INTEGRITY_BASELINE_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(baseline, null, 2)}\n`, "utf8");
  console.log(`Wrote ${OWNER_DAILY_BRIEFING_BREAKTHROUGH_INTEGRITY_BASELINE_ARTIFACT}`);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}
