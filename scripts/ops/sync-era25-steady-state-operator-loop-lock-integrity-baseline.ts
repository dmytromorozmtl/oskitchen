#!/usr/bin/env npx tsx
/**
 * Records era25 steady-state operator loop lock integrity baseline when charter lock + loop rhythm guard PASS.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { evaluateEra25SteadyStateOperatorLoopLockIntegrity } from "@/lib/commercial/era25-steady-state-operator-loop-lock-integrity-era58";
import { ERA25_FROZEN_AFTER_STEADY_STATE_LOOP_LOCK_ENV_KEYS } from "@/lib/commercial/era25-steady-state-operator-loop-lock-phases-era58";
import {
  ERA25_STEADY_STATE_OPERATOR_LOOP_LOCK_INTEGRITY_BASELINE_ARTIFACT,
  type Era25SteadyStateOperatorLoopLockIntegrityBaseline,
} from "@/lib/commercial/era25-steady-state-operator-loop-lock-integrity-era58";

function main() {
  const write = process.argv.includes("--write");
  const integrity = evaluateEra25SteadyStateOperatorLoopLockIntegrity();

  if (!integrity.integrityPassed) {
    console.error("Cannot record baseline — era25 steady-state operator loop lock integrity FAIL.");
    for (const violation of integrity.violations) {
      console.error(`  [${violation.id}] ${violation.detail}`);
    }
    process.exit(2);
  }

  if (
    !integrity.era25SteadyStateOperatorLoopLockComplete ||
    !integrity.era25PostReentrantCharterLockComplete ||
    !integrity.improvementLoopActive ||
    integrity.frozenEnvMutationDetected ||
    integrity.improvementLoopRhythmMutationDetected ||
    integrity.goDecision !== "GO" ||
    !integrity.goIntegrityPassed
  ) {
    console.error(
      "Cannot record baseline — charter lock + improvement loop rhythm prerequisite not met.",
    );
    process.exit(2);
  }

  const baseline: Era25SteadyStateOperatorLoopLockIntegrityBaseline = {
    era25SteadyStateOperatorLoopLockHonest: true,
    recordedAt: new Date().toISOString(),
    charterLockHonestAttested: true,
    improvementLoopRhythmHonestAttested: true,
    frozenEnvKeyCount: ERA25_FROZEN_AFTER_STEADY_STATE_LOOP_LOCK_ENV_KEYS.length,
    goDecision: "GO",
  };

  if (!write) {
    console.log(JSON.stringify(baseline, null, 2));
    console.log("\nPass --write to persist baseline artifact.\n");
    return;
  }

  const path = join(
    process.cwd(),
    ERA25_STEADY_STATE_OPERATOR_LOOP_LOCK_INTEGRITY_BASELINE_ARTIFACT,
  );
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(baseline, null, 2)}\n`, "utf8");
  console.log(`Wrote ${ERA25_STEADY_STATE_OPERATOR_LOOP_LOCK_INTEGRITY_BASELINE_ARTIFACT}`);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}
