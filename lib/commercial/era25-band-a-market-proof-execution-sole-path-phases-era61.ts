/**
 * Era25 Band A market proof execution sole-path — only P0 ops vault + improvement loop remain mutable.
 * Policy: era61-era25-band-a-market-proof-execution-sole-path-phases-v1
 */
import {
  ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_TRACKED_ENV_KEYS,
  ERA25_FROZEN_AFTER_GOVERNANCE_TERMINUS_FREEZE_ENV_KEYS,
} from "@/lib/commercial/era25-convergence-governance-terminus-freeze-phases-era60";

export const ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_ERA61_PHASES_POLICY_ID =
  "era61-era25-band-a-market-proof-execution-sole-path-phases-v1" as const;

export const ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_DOC =
  "docs/next-step-era25-band-a-market-proof-execution-sole-path-phase-ak-product-2026-05-28.md" as const;

export const ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_PLATFORM_ANCHOR =
  "#era25-band-a-market-proof-execution-sole-path" as const;

export const ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_TRACKED_ENV_KEYS = [
  "ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_ERA25_ATTESTED",
  "ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_ERA25_REPORT_REVIEWED",
  "ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_ERA25_P0_PROOF_REFERENCED",
] as const;

/** Env keys that must not mutate after honest sole-path attestation. */
export const ERA25_FROZEN_AFTER_SOLE_PATH_ENV_KEYS = [
  ...ERA25_FROZEN_AFTER_GOVERNANCE_TERMINUS_FREEZE_ENV_KEYS,
  ...ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_TRACKED_ENV_KEYS,
] as const;

export function detectEra25BandAMarketProofExecutionSolePathStarted(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_TRACKED_ENV_KEYS.some((key) =>
    Boolean(env[key]?.trim()),
  );
}

export function detectEra25FrozenEnvMutationAfterSolePath(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return ERA25_FROZEN_AFTER_SOLE_PATH_ENV_KEYS.some((key) => Boolean(env[key]?.trim()));
}

export function detectSolePathP0ProofReferenced(env: NodeJS.ProcessEnv = process.env): boolean {
  return Boolean(
    env.ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_ERA25_P0_PROOF_REFERENCED?.trim(),
  );
}

export const ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_BACKLOG_ID =
  "KOS-E25-016-BAND-A-MARKET-PROOF-SOLE-PATH" as const;

export const ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_GUARDRAILS: readonly string[] = [
  "Never attest Band A sole-path before era25 convergence governance terminus freeze integrity is honest",
  "Never claim P0 proof_passed on sole-path unless artifacts/p0-staging-proof-unblock-summary.json is honestly proof_passed",
  "Never introduce new era25 convergence governance env keys after sole-path baseline",
  "Never hand-edit PASS in artifacts/*.json",
  "Never skip test:ci:governance-bundles and test:ci:commercial-pilot-runbook:cert after sole-path baseline sync",
] as const;

export const ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_FOREVER_COMMANDS: readonly string[] = [
  "ops:validate-era25-band-a-market-proof-execution-sole-path-integrity",
  "ops:validate-era25-convergence-governance-terminus-freeze-integrity",
  "ops:validate-p0-staging-proof-integrity",
  "smoke:p0-staging-proof-unblock",
  "test:ci:governance-bundles",
  "test:ci:commercial-pilot-runbook:cert",
] as const;
