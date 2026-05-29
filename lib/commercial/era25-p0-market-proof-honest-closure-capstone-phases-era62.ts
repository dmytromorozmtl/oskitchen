/**
 * Era25 P0 market proof honest closure capstone — terminal Band A closure on honest proof_passed artifact.
 * Policy: era62-era25-p0-market-proof-honest-closure-capstone-phases-v1
 */
import {
  ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_TRACKED_ENV_KEYS,
  ERA25_FROZEN_AFTER_SOLE_PATH_ENV_KEYS,
} from "@/lib/commercial/era25-band-a-market-proof-execution-sole-path-phases-era61";

export const ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_ERA62_PHASES_POLICY_ID =
  "era62-era25-p0-market-proof-honest-closure-capstone-phases-v1" as const;

export const ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_DOC =
  "docs/next-step-era25-p0-market-proof-honest-closure-capstone-phase-al-product-2026-05-28.md" as const;

export const ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_PLATFORM_ANCHOR =
  "#era25-p0-market-proof-honest-closure-capstone" as const;

export const ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_TRACKED_ENV_KEYS = [
  "ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_ERA25_ATTESTED",
  "ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_ERA25_REPORT_REVIEWED",
] as const;

/** Env keys that must not mutate after honest P0 market proof closure capstone. */
export const ERA25_FROZEN_AFTER_CLOSURE_CAPSTONE_ENV_KEYS = [
  ...ERA25_FROZEN_AFTER_SOLE_PATH_ENV_KEYS,
  ...ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_TRACKED_ENV_KEYS,
] as const;

export function detectEra25P0MarketProofHonestClosureCapstoneStarted(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_TRACKED_ENV_KEYS.some((key) =>
    Boolean(env[key]?.trim()),
  );
}

export function detectEra25FrozenEnvMutationAfterClosureCapstone(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return ERA25_FROZEN_AFTER_CLOSURE_CAPSTONE_ENV_KEYS.some((key) => Boolean(env[key]?.trim()));
}

export const ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_BACKLOG_ID =
  "KOS-E25-017-P0-MARKET-PROOF-HONEST-CLOSURE" as const;

export const ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_GUARDRAILS: readonly string[] = [
  "Never attest P0 market proof closure capstone before Band A sole-path is locked",
  "Never attest closure capstone unless artifacts/p0-staging-proof-unblock-summary.json is honestly proof_passed",
  "Never introduce new era25 convergence governance env keys after closure capstone baseline",
  "Never hand-edit PASS in artifacts/*.json",
  "Never skip test:ci:governance-bundles and test:ci:commercial-pilot-runbook:cert after closure baseline sync",
] as const;

export const ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_FOREVER_COMMANDS: readonly string[] = [
  "ops:validate-era25-p0-market-proof-honest-closure-capstone-integrity",
  "ops:validate-era25-band-a-market-proof-execution-sole-path-integrity",
  "ops:validate-p0-staging-proof-integrity",
  "smoke:p0-staging-proof-unblock",
  "test:ci:governance-bundles",
  "test:ci:commercial-pilot-runbook:cert",
] as const;
