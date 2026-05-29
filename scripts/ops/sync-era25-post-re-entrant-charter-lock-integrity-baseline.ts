#!/usr/bin/env npx tsx
/**
 * Records era25 post-re-entrant charter lock integrity baseline when re-entrant honest + frozen env guard PASS.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { evaluateEra25PostReentrantCharterLockIntegrity } from "@/lib/commercial/era25-post-re-entrant-charter-lock-integrity-era57";
import { ERA25_FROZEN_AFTER_CHARTER_LOCK_ENV_KEYS } from "@/lib/commercial/era25-post-re-entrant-charter-lock-phases-era57";
import {
  ERA25_POST_REENTRANT_CHARTER_LOCK_INTEGRITY_BASELINE_ARTIFACT,
  type Era25PostReentrantCharterLockIntegrityBaseline,
} from "@/lib/commercial/era25-post-re-entrant-charter-lock-integrity-era57";

function main() {
  const write = process.argv.includes("--write");
  const integrity = evaluateEra25PostReentrantCharterLockIntegrity();

  if (!integrity.integrityPassed) {
    console.error("Cannot record baseline — era25 post-re-entrant charter lock integrity FAIL.");
    for (const violation of integrity.violations) {
      console.error(`  [${violation.id}] ${violation.detail}`);
    }
    process.exit(2);
  }

  if (
    !integrity.era25PostReentrantCharterLockComplete ||
    !integrity.sustainedProductEvolutionReentrantComplete ||
    integrity.frozenEnvMutationDetected ||
    integrity.goDecision !== "GO" ||
    !integrity.goIntegrityPassed
  ) {
    console.error(
      "Cannot record baseline — re-entrant complete + frozen env guard prerequisite not met.",
    );
    process.exit(2);
  }

  const baseline: Era25PostReentrantCharterLockIntegrityBaseline = {
    era25PostReentrantCharterLockHonest: true,
    recordedAt: new Date().toISOString(),
    reentrantEvolutionHonestAttested: true,
    frozenEnvKeyCount: ERA25_FROZEN_AFTER_CHARTER_LOCK_ENV_KEYS.length,
    goDecision: "GO",
  };

  if (!write) {
    console.log(JSON.stringify(baseline, null, 2));
    console.log("\nPass --write to persist baseline artifact.\n");
    return;
  }

  const path = join(process.cwd(), ERA25_POST_REENTRANT_CHARTER_LOCK_INTEGRITY_BASELINE_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(baseline, null, 2)}\n`, "utf8");
  console.log(`Wrote ${ERA25_POST_REENTRANT_CHARTER_LOCK_INTEGRITY_BASELINE_ARTIFACT}`);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}
