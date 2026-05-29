/**
 * Era25 convergence governance terminus freeze — final env freeze after honest train capstone.
 * Policy: era60-era25-convergence-governance-terminus-freeze-phases-v1
 */
import {
  ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_TRACKED_ENV_KEYS,
  ERA25_FROZEN_AFTER_TRAIN_CAPSTONE_ENV_KEYS,
} from "@/lib/commercial/era25-commercial-pilot-convergence-train-capstone-phases-era59";

export const ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_ERA60_PHASES_POLICY_ID =
  "era60-era25-convergence-governance-terminus-freeze-phases-v1" as const;

export const ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_DOC =
  "docs/next-step-era25-convergence-governance-terminus-freeze-phase-aj-product-2026-05-28.md" as const;

export const ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_PLATFORM_ANCHOR =
  "#era25-convergence-governance-terminus-freeze" as const;

export const ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_TRACKED_ENV_KEYS = [
  "ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_ERA25_ATTESTED",
  "ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_ERA25_REPORT_REVIEWED",
  "ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_ERA25_MARKET_PROOF_REFERENCED",
] as const;

/** Env keys that must not mutate after honest governance terminus freeze. */
export const ERA25_FROZEN_AFTER_GOVERNANCE_TERMINUS_FREEZE_ENV_KEYS = [
  ...ERA25_FROZEN_AFTER_TRAIN_CAPSTONE_ENV_KEYS,
  ...ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_TRACKED_ENV_KEYS,
] as const;

export function detectEra25ConvergenceGovernanceTerminusFreezeStarted(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_TRACKED_ENV_KEYS.some((key) =>
    Boolean(env[key]?.trim()),
  );
}

export function detectEra25FrozenEnvMutationAfterGovernanceTerminusFreeze(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return ERA25_FROZEN_AFTER_GOVERNANCE_TERMINUS_FREEZE_ENV_KEYS.some((key) =>
    Boolean(env[key]?.trim()),
  );
}

export function detectTerminusFreezeMarketProofReferenced(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return Boolean(
    env.ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_ERA25_MARKET_PROOF_REFERENCED?.trim(),
  );
}

export const ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_BACKLOG_ID =
  "KOS-E25-015-GOVERNANCE-TERMINUS-FREEZE" as const;

export const ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_GUARDRAILS: readonly string[] = [
  "Never attest governance terminus freeze before era25 commercial pilot convergence train capstone integrity is honest",
  "Never reference market proof_passed in terminus freeze unless artifacts/p0-staging-proof-unblock-summary.json is honestly proof_passed",
  "Never mutate era25 convergence governance env after terminus freeze baseline",
  "Never hand-edit PASS in artifacts/*.json",
  "Never skip test:ci:governance-bundles and test:ci:commercial-pilot-runbook:cert after terminus freeze baseline sync",
] as const;

export const ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_FOREVER_COMMANDS: readonly string[] = [
  "ops:validate-era25-convergence-governance-terminus-freeze-integrity",
  "ops:validate-era25-commercial-pilot-convergence-train-capstone-integrity",
  "ops:validate-p0-staging-proof-integrity",
  "smoke:p0-staging-proof-unblock",
  "test:ci:governance-bundles",
  "test:ci:commercial-pilot-runbook:cert",
] as const;
