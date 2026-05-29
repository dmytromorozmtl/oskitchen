/**
 * Era25 commercial pilot convergence train capstone — honest closure of era47–AH governance train.
 * Policy: era59-era25-commercial-pilot-convergence-train-capstone-phases-v1
 */
import {
  ERA25_FROZEN_AFTER_STEADY_STATE_LOOP_LOCK_ENV_KEYS,
  ERA25_STEADY_STATE_OPERATOR_LOOP_LOCK_TRACKED_ENV_KEYS,
} from "@/lib/commercial/era25-steady-state-operator-loop-lock-phases-era58";

export const ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_ERA59_PHASES_POLICY_ID =
  "era59-era25-commercial-pilot-convergence-train-capstone-phases-v1" as const;

export const ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_DOC =
  "docs/next-step-era25-commercial-pilot-convergence-train-capstone-phase-ai-product-2026-05-28.md" as const;

export const ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_PLATFORM_ANCHOR =
  "#era25-commercial-pilot-convergence-train-capstone" as const;

export const ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_TRACKED_ENV_KEYS = [
  "ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_ERA25_ATTESTED",
  "ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_ERA25_REPORT_REVIEWED",
  "ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_ERA25_P0_PROOF_REFERENCED",
  "ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_ERA25_GO_REFERENCED",
] as const;

/** Env keys that must not mutate after honest train capstone — full era25 convergence chain frozen. */
export const ERA25_FROZEN_AFTER_TRAIN_CAPSTONE_ENV_KEYS = [
  ...ERA25_FROZEN_AFTER_STEADY_STATE_LOOP_LOCK_ENV_KEYS,
  ...ERA25_STEADY_STATE_OPERATOR_LOOP_LOCK_TRACKED_ENV_KEYS,
] as const;

export function detectEra25CommercialPilotConvergenceTrainCapstoneStarted(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_TRACKED_ENV_KEYS.some((key) =>
    Boolean(env[key]?.trim()),
  );
}

export function detectEra25FrozenEnvMutationAfterTrainCapstone(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return ERA25_FROZEN_AFTER_TRAIN_CAPSTONE_ENV_KEYS.some((key) => Boolean(env[key]?.trim()));
}

export function detectCapstoneP0ProofReferenced(env: NodeJS.ProcessEnv = process.env): boolean {
  return Boolean(
    env.ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_ERA25_P0_PROOF_REFERENCED?.trim(),
  );
}

export function detectCapstoneGoReferenced(env: NodeJS.ProcessEnv = process.env): boolean {
  return Boolean(env.ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_ERA25_GO_REFERENCED?.trim());
}

export const ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_BACKLOG_ID =
  "KOS-E25-014-TRAIN-CAPSTONE" as const;

export const ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_GUARDRAILS: readonly string[] = [
  "Never attest train capstone before era25 steady-state operator loop lock integrity is honest",
  "Never reference proof_passed in capstone rollup unless artifacts/p0-staging-proof-unblock-summary.json is honestly proof_passed",
  "Never reference GO in capstone rollup unless artifacts/pilot-gono-go-summary.json decision is honestly GO",
  "Never mutate era25 convergence / steady-state env after capstone baseline",
  "Never hand-edit PASS in artifacts/*.json",
  "Never skip test:ci:governance-bundles and test:ci:commercial-pilot-runbook:cert after capstone baseline sync",
] as const;

export const ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_FOREVER_COMMANDS: readonly string[] = [
  "ops:validate-era25-commercial-pilot-convergence-train-capstone-integrity",
  "ops:validate-era25-steady-state-operator-loop-lock-integrity",
  "ops:validate-p0-staging-proof-integrity",
  "smoke:p0-staging-proof-unblock",
  "test:ci:governance-bundles",
  "test:ci:commercial-pilot-runbook:cert",
] as const;
