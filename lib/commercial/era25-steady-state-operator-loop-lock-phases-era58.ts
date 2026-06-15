/**
 * Era25 steady-state operator loop convergence lock — cadence locked after honest charter lock.
 * Policy: era58-era25-steady-state-operator-loop-lock-phases-v1
 */
import { CONTINUOUS_IMPROVEMENT_LOOP_TRACKED_ENV_KEYS } from "@/lib/commercial/continuous-improvement-loop-phases-era22";
import {
  ERA25_FROZEN_AFTER_CHARTER_LOCK_ENV_KEYS,
  ERA25_POST_REENTRANT_CHARTER_LOCK_TRACKED_ENV_KEYS,
} from "@/lib/commercial/era25-post-re-entrant-charter-lock-phases-era57";
import { SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_TRACKED_ENV_KEYS } from "@/lib/commercial/sustained-product-evolution-re-entrant-phases-era56";

export const ERA25_STEADY_STATE_OPERATOR_LOOP_LOCK_ERA58_PHASES_POLICY_ID =
  "era58-era25-steady-state-operator-loop-lock-phases-v1" as const;

export const ERA25_STEADY_STATE_OPERATOR_LOOP_LOCK_DOC =
  "docs/next-step-era25-steady-state-operator-loop-lock-phase-ah-product-2026-05-28.md" as const;

export const ERA25_STEADY_STATE_OPERATOR_LOOP_LOCK_PLATFORM_ANCHOR =
  "#era25-steady-state-operator-loop-lock" as const;

export const ERA25_STEADY_STATE_OPERATOR_LOOP_LOCK_TRACKED_ENV_KEYS = [
  "ERA25_STEADY_STATE_OPERATOR_LOOP_LOCK_ERA25_ATTESTED",
  "ERA25_STEADY_STATE_OPERATOR_LOOP_LOCK_ERA25_REPORT_REVIEWED",
] as const;

/** Env keys that must not mutate after honest steady-state loop lock — era25 convergence + charter chain frozen. */
export const ERA25_FROZEN_AFTER_STEADY_STATE_LOOP_LOCK_ENV_KEYS = [
  ...ERA25_FROZEN_AFTER_CHARTER_LOCK_ENV_KEYS,
  ...ERA25_POST_REENTRANT_CHARTER_LOCK_TRACKED_ENV_KEYS,
  ...SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_TRACKED_ENV_KEYS,
] as const;

export function detectEra25SteadyStateOperatorLoopLockStarted(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return ERA25_STEADY_STATE_OPERATOR_LOOP_LOCK_TRACKED_ENV_KEYS.some((key) =>
    Boolean(env[key]?.trim()),
  );
}

export function detectEra25FrozenEnvMutationAfterSteadyStateLoopLock(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return ERA25_FROZEN_AFTER_STEADY_STATE_LOOP_LOCK_ENV_KEYS.some((key) =>
    Boolean(env[key]?.trim()),
  );
}

/** Improvement-loop attest env present while loop prerequisites are not honest on steady-state lock path. */
export function detectImprovementLoopRhythmMutationAfterSteadyStateLock(input: {
  env: NodeJS.ProcessEnv;
  improvementLoopActive: boolean;
  improvementLoopIntegrityPassed: boolean;
}): boolean {
  const improvementLoopEnvStarted = CONTINUOUS_IMPROVEMENT_LOOP_TRACKED_ENV_KEYS.some((key) =>
    Boolean(input.env[key]?.trim()),
  );
  return (
    improvementLoopEnvStarted &&
    (!input.improvementLoopActive || !input.improvementLoopIntegrityPassed)
  );
}

export const ERA25_STEADY_STATE_OPERATOR_LOOP_LOCK_BACKLOG_ID =
  "KOS-E25-013-STEADY-STATE-OPERATOR-LOOP-LOCK" as const;

export const ERA25_STEADY_STATE_OPERATOR_LOOP_LOCK_GUARDRAILS: readonly string[] = [
  "Never attest steady-state loop lock before era25 post-re-entrant charter lock integrity is honest",
  "Never mutate era25 charter / re-entrant / linear convergence env after steady-state lock baseline",
  "Never attest improvement-loop cadence env keys without ops:validate-continuous-improvement-loop-integrity PASS",
  "Never hand-edit PASS in artifacts/*.json",
  "Never skip test:ci:governance-bundles and test:ci:commercial-pilot-runbook:cert after steady-state lock baseline sync",
] as const;

export const ERA25_STEADY_STATE_OPERATOR_LOOP_LOCK_FOREVER_COMMANDS: readonly string[] = [
  "ops:validate-era25-steady-state-operator-loop-lock-integrity",
  "ops:validate-era25-post-re-entrant-charter-lock-integrity",
  "ops:validate-continuous-improvement-loop-integrity",
  "ops:validate-steady-state-operator-loop",
  "test:ci:governance-bundles",
  "test:ci:commercial-pilot-runbook:cert",
] as const;
